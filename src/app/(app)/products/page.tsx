import { prisma } from "@/lib/prisma";
import { createProduct, toggleProductActive } from "@/lib/actions";
import ToggleActiveButton from "@/components/ToggleActiveButton";

export default async function ProductsPage() {
  const products = await prisma.product.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-[22px] font-semibold mb-1">Produk</h1>
        <p className="text-muted text-[13.5px]">
          Kelola jenis orderan. Tambahkan produk baru kapan saja — termasuk produk di luar skin nanti.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <form action={createProduct} className="card p-6 space-y-4 md:col-span-1 h-fit">
          <h2 className="text-[14px] font-semibold">Tambah Produk</h2>
          <div>
            <label>Nama Produk</label>
            <input type="text" name="name" placeholder="mis. Elytra Custom" required />
          </div>
          <div className="flex items-center gap-2 pt-1">
            <input type="checkbox" name="requiresResolution" id="requiresResolution" defaultChecked className="w-auto" />
            <label htmlFor="requiresResolution" className="!mb-0 !text-white">
              Punya varian resolusi (64/128/512 px)
            </label>
          </div>
          <p className="text-[11.5px] text-muted">
            Matikan opsi ini untuk produk non-skin yang tidak butuh pilihan resolusi.
          </p>
          <button type="submit" className="btn-primary w-full">Simpan</button>
        </form>

        <div className="card p-6 md:col-span-2">
          <div className="overflow-x-auto">
            <table>
              <thead><tr><th>Nama Produk</th><th>Resolusi</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td>{p.requiresResolution ? <span className="badge">Ya</span> : <span className="badge badge-muted">Tidak</span>}</td>
                    <td>{p.active ? <span className="badge">Aktif</span> : <span className="badge badge-muted">Nonaktif</span>}</td>
                    <td><ToggleActiveButton id={p.id} active={p.active} action={toggleProductActive} /></td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr><td colSpan={4} className="text-center text-muted py-10">Belum ada produk.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
