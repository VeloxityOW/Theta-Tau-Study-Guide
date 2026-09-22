import { NextResponse } from "next/server";
import { createClient } from "../../../../lib/supabase/server";

export async function PATCH(request, { params }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (!profile || !["admin", "nme"].includes(profile.role)) return NextResponse.json({ error: "Staff access required" }, { status: 403 });
  const { id } = await params;
  const { active } = await request.json();
  const { error } = await supabase.from("invite_links").update({ active: !!active }).eq("id", id);
  return NextResponse.json(error ? { error: error.message } : { ok: true }, { status: error ? 400 : 200 });
}
