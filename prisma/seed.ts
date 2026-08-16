import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@vogue-chic.com" },
    update: {},
    create: {
      email: "admin@vogue-chic.com",
      passwordHash,
      name: "Vogue-Chic Admin",
      role: "ADMIN",
    },
  });

  const maisonEliteUser = await prisma.user.upsert({
    where: { email: "vendor@maisonelite.com" },
    update: {},
    create: {
      email: "vendor@maisonelite.com",
      passwordHash,
      name: "Maison Elite",
      role: "VENDOR",
      vendorProfile: {
        create: {
          brandName: "Maison Elite",
          slug: "maison-elite",
          tagline: "Editorial luxury, uncompromising craft.",
          bio: "Maison Elite crafts architectural silhouettes for the modern purist, blending heritage tailoring with avant-garde textures.",
          currency: "USD",
        },
      },
    },
    include: { vendorProfile: true },
  });

  const shipluxeUser = await prisma.user.upsert({
    where: { email: "vendor@shipluxe.com" },
    update: {},
    create: {
      email: "vendor@shipluxe.com",
      passwordHash,
      name: "ShipLuxe",
      role: "VENDOR",
      vendorProfile: {
        create: {
          brandName: "ShipLuxe",
          slug: "shipluxe",
          tagline: "Considered pieces, delivered with care.",
          bio: "ShipLuxe curates a refined edit of resort and everyday luxury essentials for the discerning traveler.",
          currency: "EUR",
        },
      },
    },
    include: { vendorProfile: true },
  });

  const customerUser = await prisma.user.upsert({
    where: { email: "elena.vance@example.com" },
    update: {},
    create: {
      email: "elena.vance@example.com",
      passwordHash,
      name: "Elena Vance",
      role: "CUSTOMER",
      customerProfile: {
        create: {
          vipTier: "VIP",
          bio: "Longtime patron of avant-garde tailoring and considered resort wear.",
          aestheticTags: ["Minimalist", "Avant-Garde"],
          favoredMaterials: ["Silk", "Cashmere"],
        },
      },
    },
  });

  console.log({
    admin: admin.email,
    maisonElite: maisonEliteUser.email,
    shipluxe: shipluxeUser.email,
    customer: customerUser.email,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
