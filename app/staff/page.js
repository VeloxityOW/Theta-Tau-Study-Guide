import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";
import StaffPortal from "./staff-portal";

export default async function StaffPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");
  const { data: profile } = await supabase.from("profiles").select("role, display_name").eq("id", user.id).single();
  if (!profile || !["admin", "nme"].includes(profile.role)) redirect("/study-guide/");
  return <StaffPortal profile={profile} />;
}
