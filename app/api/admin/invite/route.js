import { NextResponse } from "next/server";
import { createClient as createUserClient } from "../../../../lib/supabase/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request) {
  const userClient = await createUserClient(); const { data: { user } } = await userClient.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data: profile } = await userClient.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return NextResponse.json({ error: "Only admins can invite members." }, { status: 403 });
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return NextResponse.json({ error: "Add SUPABASE_SERVICE_ROLE_KEY to Vercel before sending invitations." }, { status: 503 });
  const { email, name, role } = await request.json();
  if (!email || !["pnm", "nme", "admin"].includes(role)) return NextResponse.json({ error: "Enter a valid email and role." }, { status: 400 });
  const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { autoRefreshToken: false, persistSession: false } });
  const { data, error } = await admin.auth.admin.inviteUserByEmail(email, { data: { display_name: String(name || "").trim() }, redirectTo: `${new URL(request.url).origin}/auth/callback?next=/update-password` });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  const { error: roleError } = await admin.from("profiles").update({ role }).eq("id", data.user.id);
  if (roleError) return NextResponse.json({ error: roleError.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
