import { redirect } from "next/navigation";
import { getSessionFromCookies } from "@/lib/auth";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSessionFromCookies();

  if (!session || session.role !== "student") {
    redirect("/login");
  }

  return <>{children}</>;
}