import { prisma } from "@/lib/prisma";
import { fmtRupiah } from "@/lib/commission";

export const dynamic = "force-dynamic";

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}
function startOfMonth() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export default async function DashboardPage() {
  const [todayOrders, monthOrders, totalWorkers, totalProducts] = await Promise.all([
    prisma.order.findMany({ where: { tanggal: { gte: startOfToday() } } }),
    prisma.order.findMany({ where: { tanggal: { gte: startOfMonth() } } }),
    prisma.worker.count({ where: { active: true } }),
    prisma.product.count({ where: { active: true } }),
  ]);

  const sum = (arr: typeof monthOrders, key: "harga" | "workerAmount" | "adminAmount" | "kasAmount" | "ownerAmount") =>
    arr.reduce((s, o) => s + Number(o[key]), 0);

  const stats = [
    { label: "Pendapatan Hari Ini", value: fmtRupiah(sum(todayOrders, "harga")), glow: true },
    { label: "Transaksi Hari Ini", value: String(todayOrders.length) },
    { label: "Pendapatan Bulan Ini", value: fmtRupiah(sum(monthOrders, "harga")), glow: true },
    { label: "Transaksi Bulan Ini", value: String(monthOrders.length) },
    { label: "Worker Aktif", value: String(totalWorkers) },
    { label: "Produk Aktif", value: String(totalProducts) },
  ];

  const breakdown = [
    { label: "Komisi Worker (bulan ini)", value: sum(monthOrders, "workerAmount") },
    { label: "Komisi Admin CS (bulan ini)", value: sum(monthOrders, "adminAmount") },
    { label: "Kas Perusahaan (bulan ini)", value: sum(monthOrders, "kasAmount") },
    { label: "Bagian Owner (bulan ini)", value: sum(monthOrders, "ownerAmount") },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-[22px] font-semibold mb-1">Dashboard</h1>
        <p className="text-muted text-[13.5px]">Ringkasan performa Aura Store.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {stats.map((s) => (
          <div key={s.label} className={`card p-5 ${s.glow ? "relative overflow-hidden" : ""}`}>
            <div className="text-[11.5px] uppercase tracking-wide text-muted mb-1.5">{s.label}</div>
            <div className={`text-[21px] font-semibold font-mono ${s.glow ? "text-cyan" : ""}`}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="card p-6">
        <h2 className="text-[15px] font-semibold mb-1">Pembagian Pendapatan Bulan Ini</h2>
        <p className="text-[12.5px] text-muted mb-5">Total dari semua transaksi bulan berjalan.</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {breakdown.map((b) => (
            <div key={b.label} className="bg-panel2 border border-border rounded-xl p-4">
              <div className="text-[11px] text-muted mb-1">{b.label}</div>
              <div className="text-[16px] font-mono font-semibold">{fmtRupiah(b.value)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
