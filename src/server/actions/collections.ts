"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "@/i18n/navigation";
import { slugify } from "@/lib/slug";

async function requireVendorId() {
  const session = await auth();
  if (!session?.user || session.user.role !== "VENDOR") {
    throw new Error("Unauthorized");
  }
  const vendor = await prisma.vendorProfile.findUnique({ where: { userId: session.user.id } });
  if (!vendor) throw new Error("Vendor profile not found");
  return vendor.id;
}

export async function createDraftCollection(formData: FormData) {
  const vendorId = await requireVendorId();
  const locale = String(formData.get("locale") ?? "en");
  const name = String(formData.get("name") ?? "").trim();
  const season = String(formData.get("season") ?? "");
  const editorialDescription = String(formData.get("editorialDescription") ?? "");

  if (!name) throw new Error("Collection name is required");

  const baseSlug = slugify(name) || "collection";
  let slug = baseSlug;
  let suffix = 1;
  while (await prisma.collection.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${++suffix}`;
  }

  const collection = await prisma.collection.create({
    data: { vendorId, name, slug, season, editorialDescription, status: "DRAFT" },
  });

  redirect({ href: `/vendor/collections/new/step-2/${collection.id}`, locale });
}

export async function updateCollectionVisuals(id: string, formData: FormData) {
  const vendorId = await requireVendorId();
  const locale = String(formData.get("locale") ?? "en");
  const heroImage = String(formData.get("heroImage") ?? "") || null;
  const editorialDescription = String(formData.get("editorialDescription") ?? "");
  const tags = String(formData.get("tags") ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  const collection = await prisma.collection.findFirst({ where: { id, vendorId } });
  if (!collection) throw new Error("Collection not found");

  await prisma.collection.update({
    where: { id },
    data: { heroImage, editorialDescription, tags },
  });

  redirect({ href: `/vendor/collections/new/step-3/${id}`, locale });
}

export async function publishOrSaveCollection(id: string, formData: FormData) {
  const vendorId = await requireVendorId();
  const locale = String(formData.get("locale") ?? "en");
  const action = String(formData.get("action") ?? "draft");
  const productIds = formData.getAll("productIds").map(String);

  const collection = await prisma.collection.findFirst({ where: { id, vendorId } });
  if (!collection) throw new Error("Collection not found");

  await prisma.$transaction([
    prisma.product.updateMany({ where: { collectionId: id }, data: { collectionId: null } }),
    prisma.product.updateMany({ where: { id: { in: productIds }, vendorId }, data: { collectionId: id } }),
    prisma.collection.update({
      where: { id },
      data: {
        itemCount: productIds.length,
        status: action === "publish" ? "ACTIVE" : "DRAFT",
        publishedAt: action === "publish" ? new Date() : collection.publishedAt,
      },
    }),
  ]);

  if (action === "publish") {
    redirect({ href: `/vendor/collections/${id}/published`, locale });
  } else {
    redirect({ href: "/vendor/collections", locale });
  }
}
