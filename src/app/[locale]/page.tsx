import { createClient } from "@/lib/supabase/server";
import { redirect } from "@/i18n/navigation";

export default async function Home({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect({ href: "/login", locale });

  const { data: profile } = await supabase
    .from("profiles")
    .select("default_view")
    .eq("id", user!.id)
    .maybeSingle();

  redirect({ href: `/app/${profile?.default_view ?? "daily"}`, locale });
}