import { redirect } from "next/navigation";
import { getSessionFromCookies } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSessionFromCookies();

  if (!session || session.role !== "admin") {
    redirect("/login");
  }

  return <>{children}</>;
}