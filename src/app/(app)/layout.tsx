import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import Nav from "@/components/Nav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  return (
    <div className="min-h-screen flex flex-col">
      <Nav name={session.user.name} role={session.user.role} />
      <main className="flex-1 w-full max-w-6xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
