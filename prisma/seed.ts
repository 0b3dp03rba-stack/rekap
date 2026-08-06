import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Akun owner default — GANTI PASSWORD INI setelah login pertama kali
  const existingOwner = await prisma.user.findUnique({ where: { username: "owner" } });
  if (!existingOwner) {
    const passwordHash = await bcrypt.hash("aurastore123", 10);
    await prisma.user.create({
      data: {
        username: "owner",
        passwordHash,
        name: "Owner Aura Store",
        role: "OWNER",
      },
    });
    console.log("✓ User default dibuat -> username: owner / password: aurastore123");
  }

  const defaultProducts = [
    { name: "Kostum Skin", requiresResolution: true },
    { name: "Head Only", requiresResolution: true },
    { name: "Vault Only", requiresResolution: true },
    { name: "Couple Skin", requiresResolution: true },
  ];

  for (const p of defaultProducts) {
    const exists = await prisma.product.findFirst({ where: { name: p.name } });
    if (!exists) {
      await prisma.product.create({ data: p });
      console.log(`✓ Produk dibuat: ${p.name}`);
    }
  }

  console.log("Seeding selesai.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
