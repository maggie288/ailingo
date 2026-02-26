import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function isAdmin(email: string | undefined): boolean {
  const list = process.env.ADMIN_EMAILS;
  if (!list || !email) return false;
  return list.split(",").map((e) => e.trim().toLowerCase()).includes(email.toLowerCase());
}

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, username, avatar_url, preferred_language, theme, created_at, subscription_plan, subscription_end_at")
      .eq("id", user.id)
      .single();
    const plan = (profile as { subscription_plan?: string } | null)?.subscription_plan ?? "free";
    const endAt = (profile as { subscription_end_at?: string } | null)?.subscription_end_at;
    const isPro = plan === "pro" && (!endAt || new Date(endAt) > new Date());
    return NextResponse.json({
      id: user.id,
      email: user.email ?? undefined,
      isAdmin: isAdmin(user.email ?? undefined),
      subscription_plan: plan,
      subscription_end_at: endAt ?? undefined,
      isPro,
      ...profile,
    });
  } catch (err) {
    console.error("GET /api/user/profile:", err);
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await request.json();
    const { username, avatar_url, preferred_language, theme } = body;
    const updates: Record<string, unknown> = {};
    if (typeof username === "string") updates.username = username;
    if (typeof avatar_url === "string") updates.avatar_url = avatar_url;
    if (typeof preferred_language === "string") updates.preferred_language = preferred_language;
    if (theme === "light" || theme === "dark" || theme === "system") updates.theme = theme;
    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }
    const { error } = await supabase.from("profiles").update(updates).eq("id", user.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("PUT /api/user/profile:", err);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
