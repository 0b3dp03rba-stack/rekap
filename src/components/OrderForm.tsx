"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createOrder } from "../lib/actions";
import { WORKER_PERCENT, ADMIN_CS_PERCENT, KAS_PERUSAHAAN_PERCENT, fmtRupiah, TIER_LABEL } from "../lib/commission";

type Worker = { id: string; name: string; tier: "JUNIOR" | "SENIOR" | "MASTER" };
type Product = { id: string; name: string; requiresResolution: boolean };
type AdminStaff = { id: string; name: string };

function todayISO() {
  const d = new Date();
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}
function nowHM() {
  const d = new Date();
  return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
}

export default function OrderForm({
  workers,
  products,
  adminStaffs,
}: {
  workers: Worker[];
  products: Product[];
  adminStaffs: AdminStaff[];
}) {
  const router = useRouter();
  const [workerId, setWorkerId] = useState(workers[0]?.id || "");
  const [productId, setProductId] = useState(products[0]?.id || "");
  const [harga, setHarga] = useState<number>(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const selectedWorker = workers.find((w) => w.id === workerId);
  const selectedProduct = products.find((p) => p.id === productId);
  const tier = selectedWorker?.tier || "JUNIOR";

  const preview = useMemo(() => {
    const workerPercent = WORKER_PERCENT[tier];
    const workerAmount = Math.round((harga * workerPercent) / 100);
    const adminAmount = Math.round((harga * ADMIN_CS_PERCENT) / 100);
    const kasAmount = Math.round((harga * KAS_PERUSAHAAN_PERCENT) / 100);
    const ownerAmount = harga - workerAmount - adminAmount - kasAmount;
    return { workerPercent, workerAmount, adminAmount, kasAmount, ownerAmount };
  }, [harga, tier]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      await createOrder(formData);
      router.push("/transactions");
      router.refresh();
    } catch (err: any) {
      setError(err?.message || "Gagal menyimpan transaksi.");
      setLoading(false);
    }
  }

  if (workers.length === 0 || products.length === 0 || adminStaffs.length === 0) {
    return (
      <div className="card p-6">
        <p className="text-[14px] text-muted">
          Sebelum mengisi transaksi, pastikan sudah ada minimal 1 data di masing-masing:{" "}
          <b className="text-white">Admin CS</b>, <b className="text-white">Worker</b>, dan{" "}
          <b className="text-white">Produk</b>. Tambahkan lewat menu terkait di navigasi.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid md:grid-cols-3 gap-6">
      <div className="md:col-span-2 card p-6 space-y-5">
        {error && (
          <div className="bg-[#3a1f26] border border-[rgba(255,107,107,0.35)] text-[#ffb3b3] text-[13px] px-3 py-2.5 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label>Hari / Tanggal</label>
            <input type="date" name="tanggal" defaultValue={todayISO()} required />
          </div>
          <div>
            <label>Waktu (Jam)</label>
            <input type="time" name="waktu" defaultValue={nowHM()} required />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label>Admin (yang menangani orderan)</label>
            <select name="adminStaffId" required>
              {adminStaffs.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label>Worker (skin artist)</label>
            <select name="workerId" value={workerId} onChange={(e) => setWorkerId(e.target.value)} required>
              {workers.map((w) => (
                <option key={w.id} value={w.id}>{w.name} — {TIER_LABEL[w.tier]}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label>Jenis Orderan (Produk)</label>
            <select name="productId" value={productId} onChange={(e) => setProductId(e.target.value)} required>
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label>Harga (Rp)</label>
            <input
              type="number"
              name="harga"
              min={0}
              step={500}
              value={harga || ""}
              onChange={(e) => setHarga(Number(e.target.value))}
              placeholder="15000"
              required
            />
          </div>
        </div>

        {selectedProduct?.requiresResolution && (
          <div>
            <label>Varian Resolusi Skin</label>
            <select name="resolusi" required>
              <option value="R64">64 pixel</option>
              <option value="R128">128 pixel</option>
              <option value="R512">512 pixel</option>
            </select>
          </div>
        )}

        <div>
          <label>Catatan (opsional)</label>
          <input type="text" name="catatan" placeholder="mis. request custom cape" />
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Menyimpan..." : "Simpan Transaksi"}
        </button>
      </div>

      <div className="glint-border h-fit">
        <div className="card p-5 space-y-4">
          <h3 className="text-[13.5px] font-semibold">Rincian Komisi (otomatis)</h3>
          <div className="space-y-3 text-[13px]">
            <Row label={`Worker (${TIER_LABEL[tier]})`} value={fmtRupiah(preview.workerAmount)} highlight />
            <Row label="Admin CS (10%)" value={fmtRupiah(preview.adminAmount)} />
            <Row label="Kas Perusahaan (10%)" value={fmtRupiah(preview.kasAmount)} />
            <Row label="Owner (sisa)" value={fmtRupiah(preview.ownerAmount)} highlight />
          </div>
          <div className="pt-3 border-t border-border flex justify-between text-[13.5px] font-semibold">
            <span>Total Harga</span>
            <span className="font-mono text-cyan">{fmtRupiah(harga || 0)}</span>
          </div>
        </div>
      </div>
    </form>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-muted">{label}</span>
      <span className={`font-mono ${highlight ? "text-cyan font-semibold" : ""}`}>{value}</span>
    </div>
  );
}
