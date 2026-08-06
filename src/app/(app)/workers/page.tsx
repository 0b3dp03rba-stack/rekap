import { prisma } from "@/lib/prisma";
import { createWorker, toggleWorkerActive } from "@/lib/actions";
import { TIER_LABEL } from "@/lib/commission";
import ToggleActiveButton from "@/components/ToggleActiveButton";

export const dynamic = "force-dynamic";

export default async function WorkersPage() {
  const workers = await prisma.worker.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-[22px] font-semibold mb-1">Worker</h1>
        <p className="text-muted text-[13.5px]">Kelola skin artist dan tingkatan komisinya.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <form action={createWorker} className="card p-6 space-y-4 md:col-span-1 h-fit">
          <h2 className="text-[14px] font-semibold">Tambah Worker</h2>
          <div>
            <label>Nama Worker</label>
            <input type="text" name="name" placeholder="mis. Rafi_Skinner" required />
          </div>
          <div>
            <label>Tingkatan</label>
            <select name="tier" defaultValue="JUNIOR">
              <option value="JUNIOR">Junior — komisi 30%</option>
              <option value="SENIOR">Senior — komisi 40%</option>
              <option value="MASTER">Master — komisi 50%</option>
            </select>
          </div>
          <button type="submit" className="btn-primary w-full">Simpan</button>
        </form>

        <div className="card p-6 md:col-span-2">
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr><th>Nama</th><th>Tingkatan</th><th>Status</th><th></th></tr>
              </thead>
              <tbody>
                {workers.map((w) => (
                  <tr key={w.id}>
                    <td>{w.name}</td>
                    <td><span className="badge">{TIER_LABEL[w.tier]}</span></td>
                    <td>{w.active ? <span className="badge">Aktif</span> : <span className="badge badge-muted">Nonaktif</span>}</td>
                    <td><ToggleActiveButton id={w.id} active={w.active} action={toggleWorkerActive} /></td>
                  </tr>
                ))}
                {workers.length === 0 && (
                  <tr><td colSpan={4} className="text-center text-muted py-10">Belum ada worker.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
