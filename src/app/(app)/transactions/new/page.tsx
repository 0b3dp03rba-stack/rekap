import { prisma } from "../../../../lib/prisma";
import OrderForm from "../../../../components/OrderForm";

export const dynamic = "force-dynamic";

export default async function NewTransactionPage() {
  const [workers, products, adminStaffs] = await Promise.all([
    prisma.worker.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
    prisma.product.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
    prisma.adminStaff.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-[22px] font-semibold mb-1">Isi Transaksi</h1>
        <p className="text-muted text-[13.5px]">Catat orderan baru, komisi terhitung otomatis.</p>
      </div>
      <OrderForm
        workers={workers.map((w) => ({ id: w.id, name: w.name, tier: w.tier }))}
        products={products.map((p) => ({ id: p.id, name: p.name, requiresResolution: p.requiresResolution }))}
        adminStaffs={adminStaffs.map((a) => ({ id: a.id, name: a.name }))}
      />
    </div>
  );
}
