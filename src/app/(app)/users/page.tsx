import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";
import { createUser } from "../../../lib/actions";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const session = await getServerSession(authOptions);
  if (session?.user.role !== "OWNER") redirect("/");

  const users = await prisma.user.findMany({ orderBy: { createdAt: "asc" }, select: { id: true, username: true, name: true, role: true } });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-[22px] font-semibold mb-1">Pengguna</h1>
        <p className="text-muted text-[13.5px]">Kelola akun login ke sistem ini (khusus Owner).</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <form action={createUser} className="card p-6 space-y-4 md:col-span-1 h-fit">
          <h2 className="text-[14px] font-semibold">Tambah Pengguna</h2>
          <div>
            <label>Nama</label>
            <input type="text" name="name" required />
          </div>
          <div>
            <label>Username</label>
            <input type="text" name="username" required />
          </div>
          <div>
            <label>Password</label>
            <input type="password" name="password" minLength={6} required />
          </div>
          <div>
            <label>Role</label>
            <select name="role" defaultValue="ADMIN">
              <option value="ADMIN">Admin</option>
              <option value="OWNER">Owner</option>
            </select>
          </div>
          <button type="submit" className="btn-primary w-full">Simpan</button>
        </form>

        <div className="card p-6 md:col-span-2">
          <div className="overflow-x-auto">
            <table>
              <thead><tr><th>Nama</th><th>Username</th><th>Role</th></tr></thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>{u.name}</td>
                    <td className="font-mono">{u.username}</td>
                    <td><span className="badge">{u.role}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
