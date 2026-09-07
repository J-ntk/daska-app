export interface AiSettings {
  provider: "openai_compatible" | "anthropic";
  api_key: string;
  base_url: string | null;
  model: string;
}

const SYSTEM_PROMPT = `You are a productivity planning assistant. The user will give you a goal.
Break it into 4 to 8 concrete, actionable tasks that will help them accomplish it.
Respond with ONLY a JSON array, no markdown formatting, no explanation, in exactly this shape:
[{"title": string, "horizon": "daily" | "weekly" | "monthly", "offsetDays": number}]
"offsetDays" is how many days from today the task should be due (0 = today).
Keep titles short and actionable (a few words each).`;

export async function callAiProvider(settings: AiSettings, goal: string): Promise<string> {
  if (settings.provider === "anthropic") {
    return callAnthropic(settings, goal);
  }
  return callOpenAiCompatible(settings, goal);
}

async function callOpenAiCompatible(settings: AiSettings, goal: string) {
  const baseUrl = (settings.base_url || "https://api.openai.com/v1").replace(/\/$/, "");
  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${settings.api_key}`,
    },
    body: JSON.stringify({
      model: settings.model,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: goal },
      ],
      temperature: 0.4,
    }),
  });
  if (!res.ok) throw new Error(`AI provider error: ${await res.text()}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}

async function callAnthropic(settings: AiSettings, goal: string) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": settings.api_key,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: settings.model,
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: goal }],
    }),
  });
  if (!res.ok) throw new Error(`AI provider error: ${await res.text()}`);
  const data = await res.json();
  const textBlock = (data.content ?? []).find((b: any) => b.type === "text");
  return textBlock?.text ?? "";
}

export interface SuggestedTask {
  title: string;
  horizon: "daily" | "weekly" | "monthly";
  offsetDays: number;
}

export function parseSuggestedTasks(raw: string): SuggestedTask[] {
  const start = raw.indexOf("[");
  const end = raw.lastIndexOf("]");
  if (start === -1 || end === -1) throw new Error("The AI didn't return a task list — try rephrasing your goal.");

  const parsed = JSON.parse(raw.slice(start, end + 1));
  if (!Array.isArray(parsed)) throw new Error("Unexpected response format from the AI provider.");

  return parsed
    .filter((t: any) => t && typeof t.title === "string")
    .map((t: any) => ({
      title: t.title,
      horizon: (["daily", "weekly", "monthly"].includes(t.horizon) ? t.horizon : "weekly") as
        | "daily"
        | "weekly"
        | "monthly",
      offsetDays: typeof t.offsetDays === "number" ? t.offsetDays : 3,
    }));
}