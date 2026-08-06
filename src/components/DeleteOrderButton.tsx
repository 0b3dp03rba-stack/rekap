"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteOrder } from "../lib/actions";

export default function DeleteOrderButton({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm("Hapus transaksi ini?")) return;
    setLoading(true);
    await deleteOrder(id);
    router.refresh();
    setLoading(false);
  }

  return (
    <button onClick={handleDelete} disabled={loading} className="btn-danger">
      {loading ? "..." : "Hapus"}
    </button>
  );
}
