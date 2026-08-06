import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { fmtRupiah, RESOLUTION_LABEL, TIER_LABEL } from "@/lib/commission";
import DeleteOrderButton from "@/components/DeleteOrderButton";

function fmtTanggalIndo(d: Date) {
  const hari = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const bulan = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  return `${hari[d.getDay()]}, ${d.getDate()} ${bulan[d.getMonth()]} ${d.getFullYear()}`;
}

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: { from?: string; to?: string; q?: string };
}) {
  const { from, to, q } = searchParams;

  const where: any = {};
  if (from || to) {
    where.tanggal = {};
    if (from) where.tanggal.gte = new Date(from);
    if (to) where.tanggal.lte = new Date(to);
  }
  if (q) {
    where.OR = [
      { adminStaff: { name: { contains: q, mode: "insensitive" } } },
      { worker: { name: { contains: q, mode: "insensitive" } } },
      { product: { name: { contains: q, mode: "insensitive" } } },
      { catatan: { contains: q, mode: "insensitive" } },
    ];
  }

  const orders = await prisma.order.findMany({
    where,
    include: { adminStaff: true, worker: true, product: true },
    orderBy: [{ tanggal: "desc" }, { waktu: "desc" }],
    take: 300,
  });

  const total = orders.reduce((s, o) => s + Number(o.harga), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-[22px] font-semibold mb-1">Rekap Transaksi</h1>
          <p className="text-muted text-[13.5px]">Riwayat semua orderan yang tercatat.</p>
        </div>
        <Link href="/transactions/new" className="btn-primary">+ Transaksi Baru</Link>
      </div>

      <form className="card p-5 flex flex-wrap gap-3 items-end" method="GET">
        <div className="flex-1 min-w-[180px]">
          <label>Cari (admin / worker / produk)</label>
          <input type="text" name="q" defaultValue={q} placeholder="Cari..." />
        </div>
        <div>
          <label>Dari tanggal</label>
          <input type="date" name="from" defaultValue={from} />
        </div>
        <div>
          <label>Sampai tanggal</label>
          <input type="date" name="to" defaultValue={to} />
        </div>
        <button type="submit" className="btn-secondary">Filter</button>
      </form>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="card p-5">
          <div className="text-[11.5px] uppercase tracking-wide text-muted mb-1.5">Total Transaksi</div>
          <div className="text-[21px] font-semibold">{orders.length}</div>
        </div>
        <div className="card p-5 relative overflow-hidden">
          <div className="text-[11.5px] uppercase tracking-wide text-muted mb-1.5">Total Pendapatan</div>
          <div className="text-[21px] font-semibold font-mono text-cyan">{fmtRupiah(total)}</div>
        </div>
      </div>

      <div className="card p-6">
        <div className="overflow-x-auto">
          {orders.length === 0 ? (
            <div className="text-center py-16 text-muted text-[13.5px]">
              Belum ada transaksi yang cocok. Coba ubah filter atau tambah transaksi baru.
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>Jam</th>
                  <th>Admin</th>
                  <th>Worker</th>
                  <th>Produk</th>
                  <th>Resolusi</th>
                  <th>Harga</th>
                  <th>Komisi Worker</th>
                  <th>Owner</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td>{fmtTanggalIndo(o.tanggal)}</td>
                    <td className="font-mono">{o.waktu}</td>
                    <td>{o.adminStaff.name}</td>
                    <td>{o.worker.name}<div className="text-muted text-[11px]">{TIER_LABEL[o.worker.tier]}</div></td>
                    <td>{o.product.name}{o.catatan && <div className="text-muted text-[11px] mt-1">{o.catatan}</div>}</td>
                    <td>{o.resolusi ? <span className="badge">{RESOLUTION_LABEL[o.resolusi]}</span> : <span className="badge badge-muted">-</span>}</td>
                    <td className="font-mono font-semibold text-cyan">{fmtRupiah(o.harga)}</td>
                    <td className="font-mono">{fmtRupiah(o.workerAmount)} <span className="text-muted">({o.workerPercent}%)</span></td>
                    <td className="font-mono">{fmtRupiah(o.ownerAmount)}</td>
                    <td><DeleteOrderButton id={o.id} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
