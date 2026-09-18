import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";

export default async function DashboardPage() {
  const { data: { user } } = await (await createClient()).auth.getUser();
  if (!user) redirect("/");
  return <main className="dashboard-page"><header><img src="/ot.webp" alt="Theta Tau" /><div><p className="kicker">SIGNED IN</p><h1>Welcome to the portal</h1></div></header><section className="dashboard-card"><h2>Authentication is connected.</h2><p>{user.email}</p><p>The quiz migration and staff permissions are the next implementation steps.</p><Link className="primary inline" href="/study-guide/">Open current study-guide preview</Link></section></main>;
}
