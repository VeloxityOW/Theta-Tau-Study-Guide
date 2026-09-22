import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request) {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return NextResponse.json({ error: "Invite sign-up is not configured yet." }, { status: 503 });
  const { token, email, password, displayName } = await request.json();
  if (!token || !email || !password || password.length < 10) return NextResponse.json({ error: "Use a valid email and a password of at least 10 characters." }, { status: 400 });
  const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { autoRefreshToken: false, persistSession: false } });
  const { data: created, error: createError } = await admin.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { display_name: String(displayName || "").slice(0, 120) } });
  if (createError) return NextResponse.json({ error: createError.message }, { status: 400 });
  const { data: used, error: useError } = await admin.rpc("consume_invite_link", { p_token: token });
  if (useError || !used?.length) {
    await admin.auth.admin.deleteUser(created.user.id);
    return NextResponse.json({ error: "This invite link is disabled, expired, or has reached its limit." }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
