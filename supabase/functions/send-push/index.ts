// Supabase Edge Function: send-push
// Deploy with: supabase functions deploy send-push
//
// Requires two secrets (Dashboard → Edge Functions → Manage secrets, or
// `supabase secrets set`):
//   FCM_PROJECT_ID       — your Firebase project ID (e.g. daska-aba1e)
//   FCM_SERVICE_ACCOUNT  — the full JSON contents of the service account
//                           key you downloaded from Firebase, as one string
//
// Also needs SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY, which Supabase
// injects into every Edge Function automatically — nothing to set for
// those two.

import { createClient } from "jsr:@supabase/supabase-js@2";

// Minimal helper to get an OAuth2 access token for the FCM v1 API from a
// service account, without pulling in the full Firebase Admin SDK (which
// isn't Deno/Edge-Function friendly). Google's token endpoint accepts a
// signed JWT in exchange for a short-lived access token.
async function getAccessToken(serviceAccount: {
  client_email: string;
  private_key: string;
}): Promise<string> {
  const header = { alg: "RS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const claim = {
    iss: serviceAccount.client_email,
    scope: "https://www.googleapis.com/auth/firebase.messaging",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  };

  const enc = (obj: unknown) =>
    btoa(JSON.stringify(obj)).replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");

  const unsigned = `${enc(header)}.${enc(claim)}`;

  const keyData = serviceAccount.private_key
    .replace(/-----BEGIN PRIVATE KEY-----/, "")
    .replace(/-----END PRIVATE KEY-----/, "")
    .replace(/\s/g, "");
  const binaryKey = Uint8Array.from(atob(keyData), (c) => c.charCodeAt(0));

  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    binaryKey,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    cryptoKey,
    new TextEncoder().encode(unsigned)
  );
  const sig = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/=+$/, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  const jwt = `${unsigned}.${sig}`;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  if (!res.ok) {
    throw new Error(`Token exchange failed: ${await res.text()}`);
  }
  const data = await res.json();
  return data.access_token as string;
}

Deno.serve(async (req) => {
  try {
    const { user_id, body, project_id, type } = await req.json();
    if (!user_id || !body) {
      return new Response(JSON.stringify({ error: "missing user_id or body" }), { status: 400 });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: tokens } = await supabase
      .from("device_push_tokens")
      .select("token")
      .eq("user_id", user_id);

    if (!tokens || tokens.length === 0) {
      // No device registered for this person — not an error, just nothing to do.
      return new Response(JSON.stringify({ sent: 0 }), { status: 200 });
    }

    const serviceAccount = JSON.parse(Deno.env.get("FCM_SERVICE_ACCOUNT")!);
    const projectId = Deno.env.get("FCM_PROJECT_ID")!;
    const accessToken = await getAccessToken(serviceAccount);

    const title =
      type === "invite" ? "You've been invited" : type === "assignment" ? "New task" : "Daska";

    let sent = 0;
    const staleTokens: string[] = [];

    for (const { token } of tokens) {
      const res = await fetch(
        `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: {
              token,
              notification: { title, body },
              data: project_id ? { project_id: String(project_id) } : {},
              android: { priority: "high" },
            },
          }),
        }
      );

      if (res.ok) {
        sent++;
      } else if (res.status === 404 || res.status === 400) {
        // Token no longer valid (app uninstalled, etc.) — clean it up.
        const errText = await res.text();
        if (errText.includes("UNREGISTERED") || errText.includes("NOT_FOUND")) {
          staleTokens.push(token);
        }
      }
    }

    if (staleTokens.length > 0) {
      await supabase.from("device_push_tokens").delete().in("token", staleTokens);
    }

    return new Response(JSON.stringify({ sent }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
});