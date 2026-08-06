"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ToggleActiveButton({
  id,
  active,
  action,
}: {
  id: string;
  active: boolean;
  action: (id: string, active: boolean) => Promise<void>;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    await action(id, !active);
    router.refresh();
    setLoading(false);
  }

  return (
    <button onClick={handleClick} disabled={loading} className={active ? "btn-secondary" : "btn-primary"}>
      {loading ? "..." : active ? "Nonaktifkan" : "Aktifkan"}
    </button>
  );
}
