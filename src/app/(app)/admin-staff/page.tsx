import { prisma } from "@/lib/prisma";
import { createAdminStaff, toggleAdminStaffActive } from "@/lib/actions";
import ToggleActiveButton from "@/components/ToggleActiveButton";

export default async function AdminStaffPage() {
  const staffs = await prisma.adminStaff.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-[22px] font-semibold mb-1">Admin CS</h1>
        <p className="text-muted text-[13.5px]">Kelola staff admin yang menangani orderan (komisi tetap 10%).</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <form action={createAdminStaff} className="card p-6 space-y-4 md:col-span-1 h-fit">
          <h2 className="text-[14px] font-semibold">Tambah Admin</h2>
          <div>
            <label>Nama Admin</label>
            <input type="text" name="name" placeholder="mis. Nadia_CS" required />
          </div>
          <button type="submit" className="btn-primary w-full">Simpan</button>
        </form>

        <div className="card p-6 md:col-span-2">
          <div className="overflow-x-auto">
            <table>
              <thead><tr><th>Nama</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {staffs.map((a) => (
                  <tr key={a.id}>
                    <td>{a.name}</td>
                    <td>{a.active ? <span className="badge">Aktif</span> : <span className="badge badge-muted">Nonaktif</span>}</td>
                    <td><ToggleActiveButton id={a.id} active={a.active} action={toggleAdminStaffActive} /></td>
                  </tr>
                ))}
                {staffs.length === 0 && (
                  <tr><td colSpan={3} className="text-center text-muted py-10">Belum ada admin.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
