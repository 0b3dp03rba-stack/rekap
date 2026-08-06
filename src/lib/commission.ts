import { WorkerTier } from "@prisma/client";

// Persentase komisi worker berdasarkan tingkatan
export const WORKER_PERCENT: Record<WorkerTier, number> = {
  JUNIOR: 30,
  SENIOR: 40,
  MASTER: 50,
};

export const ADMIN_CS_PERCENT = 10;
export const KAS_PERUSAHAAN_PERCENT = 10;

export const TIER_LABEL: Record<WorkerTier, string> = {
  JUNIOR: "Junior (30%)",
  SENIOR: "Senior (40%)",
  MASTER: "Master (50%)",
};

export function calcCommission(harga: number, tier: WorkerTier) {
  const workerPercent = WORKER_PERCENT[tier];
  const adminPercent = ADMIN_CS_PERCENT;
  const kasPercent = KAS_PERUSAHAAN_PERCENT;

  const workerAmount = Math.round((harga * workerPercent) / 100);
  const adminAmount = Math.round((harga * adminPercent) / 100);
  const kasAmount = Math.round((harga * kasPercent) / 100);
  // Owner mendapat sisa pendapatan (menghindari selisih pembulatan)
  const ownerAmount = harga - workerAmount - adminAmount - kasAmount;

  return {
    workerPercent,
    workerAmount,
    adminPercent,
    adminAmount,
    kasPercent,
    kasAmount,
    ownerAmount,
  };
}

export function fmtRupiah(n: number | string) {
  const num = Number(n) || 0;
  return "Rp" + num.toLocaleString("id-ID");
}

export const RESOLUTION_LABEL: Record<string, string> = {
  R64: "64 pixel",
  R128: "128 pixel",
  R512: "512 pixel",
};
