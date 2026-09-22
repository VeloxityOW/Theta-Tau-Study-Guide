import { NextResponse } from "next/server";
import { randomBytes, createHash } from "crypto";
import { createClient } from "../../../lib/supabase/server";

async function requireStaff() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized", status: 401 };
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (!profile || !["admin", "nme"].includes(profile.role)) return { error: "Staff access required", status: 403 };
  return { supabase, user, profile };
}

export async function GET() {
  const auth = await requireStaff();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const { data, error } = await auth.supabase.from("invite_links").select("id, label, max_uses, use_count, active, expires_at, created_at").order("created_at", { ascending: false });
  return NextResponse.json({ links: data || [], error: error?.message });
}

export async function POST(request) {
  const auth = await requireStaff();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const { label, maxUses, expiresAt } = await request.json();
  const parsedMax = Number(maxUses);
  if (!Number.isInteger(parsedMax) || parsedMax < 1 || parsedMax > 500) return NextResponse.json({ error: "Choose a maximum between 1 and 500." }, { status: 400 });
  const token = randomBytes(24).toString("base64url");
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const { data, error } = await auth.supabase.from("invite_links").insert({ token_hash: tokenHash, label: String(label || "PNM invite link").slice(0, 120), max_uses: parsedMax, expires_at: expiresAt || null, created_by: auth.user.id }).select("id, label, max_uses, use_count, active, expires_at, created_at").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ link: data, url: `${new URL(request.url).origin}/join/${token}` });
}
