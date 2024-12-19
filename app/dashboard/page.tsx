import { validateRequest } from "@/lib/auth/lucia";
import { redirect } from "next/navigation";
import DashboardContent from "./DashboardContent";

export default async function Dashboard() {
  const { user } = await validateRequest();

  if (!user) {
    redirect("/");
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      <DashboardContent userId={user.id} />
    </div>
  );
}