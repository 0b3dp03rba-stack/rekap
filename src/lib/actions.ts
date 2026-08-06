"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import { authOptions } from "./auth";
import { prisma } from "./prisma";
import { calcCommission } from "./commission";
import { Resolution, WorkerTier } from "@prisma/client";

async function requireSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");
  return session;
}

async function requireOwner() {
  const session = await requireSession();
  if (session.user.role !== "OWNER") throw new Error("Hanya owner yang boleh melakukan ini");
  return session;
}

// ---------------- Orders / Transaksi ----------------
export async function createOrder(formData: FormData) {
  const session = await requireSession();

  const tanggal = String(formData.get("tanggal"));
  const waktu = String(formData.get("waktu"));
  const adminStaffId = String(formData.get("adminStaffId"));
  const workerId = String(formData.get("workerId"));
  const productId = String(formData.get("productId"));
  const resolusiRaw = String(formData.get("resolusi") || "");
  const harga = Number(formData.get("harga"));
  const catatan = String(formData.get("catatan") || "").trim();

  if (!tanggal || !waktu || !adminStaffId || !workerId || !productId || !harga || harga <= 0) {
    throw new Error("Lengkapi semua field yang wajib diisi.");
  }

  const worker = await prisma.worker.findUnique({ where: { id: workerId } });
  if (!worker) throw new Error("Worker tidak ditemukan.");

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw new Error("Produk tidak ditemukan.");

  const resolusi = product.requiresResolution && resolusiRaw ? (resolusiRaw as Resolution) : null;
  if (product.requiresResolution && !resolusi) {
    throw new Error("Pilih varian resolusi untuk produk ini.");
  }

  const c = calcCommission(harga, worker.tier);

  await prisma.order.create({
    data: {
      tanggal: new Date(tanggal),
      waktu,
      adminStaffId,
      workerId,
      productId,
      resolusi,
      harga,
      catatan: catatan || null,
      workerPercent: c.workerPercent,
      workerAmount: c.workerAmount,
      adminPercent: c.adminPercent,
      adminAmount: c.adminAmount,
      kasPercent: c.kasPercent,
      kasAmount: c.kasAmount,
      ownerAmount: c.ownerAmount,
      createdByUserId: session.user.id,
    },
  });

  revalidatePath("/transactions");
  revalidatePath("/");
}

export async function deleteOrder(id: string) {
  await requireSession();
  await prisma.order.delete({ where: { id } });
  revalidatePath("/transactions");
  revalidatePath("/");
}

// ---------------- Worker ----------------
export async function createWorker(formData: FormData) {
  await requireSession();
  const name = String(formData.get("name") || "").trim();
  const tier = String(formData.get("tier") || "JUNIOR") as WorkerTier;
  if (!name) throw new Error("Nama worker wajib diisi.");
  await prisma.worker.create({ data: { name, tier } });
  revalidatePath("/workers");
}

export async function toggleWorkerActive(id: string, active: boolean) {
  await requireSession();
  await prisma.worker.update({ where: { id }, data: { active } });
  revalidatePath("/workers");
}

export async function updateWorkerTier(id: string, tier: WorkerTier) {
  await requireSession();
  await prisma.worker.update({ where: { id }, data: { tier } });
  revalidatePath("/workers");
}

// ---------------- Admin Staff ----------------
export async function createAdminStaff(formData: FormData) {
  await requireSession();
  const name = String(formData.get("name") || "").trim();
  if (!name) throw new Error("Nama admin wajib diisi.");
  await prisma.adminStaff.create({ data: { name } });
  revalidatePath("/admin-staff");
}

export async function toggleAdminStaffActive(id: string, active: boolean) {
  await requireSession();
  await prisma.adminStaff.update({ where: { id }, data: { active } });
  revalidatePath("/admin-staff");
}

// ---------------- Product ----------------
export async function createProduct(formData: FormData) {
  await requireSession();
  const name = String(formData.get("name") || "").trim();
  const requiresResolution = formData.get("requiresResolution") === "on";
  if (!name) throw new Error("Nama produk wajib diisi.");
  await prisma.product.create({ data: { name, requiresResolution } });
  revalidatePath("/products");
}

export async function toggleProductActive(id: string, active: boolean) {
  await requireSession();
  await prisma.product.update({ where: { id }, data: { active } });
  revalidatePath("/products");
}

// ---------------- Users (khusus OWNER) ----------------
export async function createUser(formData: FormData) {
  await requireOwner();
  const username = String(formData.get("username") || "").trim();
  const name = String(formData.get("name") || "").trim();
  const password = String(formData.get("password") || "");
  const role = String(formData.get("role") || "ADMIN") as "OWNER" | "ADMIN";

  if (!username || !name || password.length < 6) {
    throw new Error("Lengkapi data. Password minimal 6 karakter.");
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.create({ data: { username, name, passwordHash, role } });
  revalidatePath("/users");
}
