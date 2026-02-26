import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSubscriptionLimits } from "@/lib/subscription";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const limits = await getSubscriptionLimits(supabase, user.id);
    return NextResponse.json(limits);
  } catch (err) {
    console.error("GET /api/user/limits:", err);
    return NextResponse.json({ error: "Failed to fetch limits" }, { status: 500 });
  }
}
