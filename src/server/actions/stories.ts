"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "@/i18n/navigation";
import { slugify } from "@/lib/slug";

async function requireWriterId() {
  const session = await auth();
  if (!session?.user || session.user.role !== "WRITER") {
    throw new Error("Unauthorized");
  }
  return session.user.id;
}

export async function createStory(formData: FormData) {
  const authorId = await requireWriterId();
  const locale = String(formData.get("locale") ?? "en");
  const title = String(formData.get("title") ?? "").trim();

  if (!title) throw new Error("Title is required");

  const baseSlug = slugify(title) || "story";
  let slug = baseSlug;
  let suffix = 1;
  while (await prisma.story.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${++suffix}`;
  }

  const story = await prisma.story.create({
    data: { authorId, title, slug, body: "", status: "DRAFT" },
  });

  revalidatePath("/writer/stories");
  redirect({ href: `/writer/stories/${story.id}/edit`, locale });
}

export async function updateStory(storyId: string, formData: FormData) {
  const authorId = await requireWriterId();

  const story = await prisma.story.findFirst({ where: { id: storyId, authorId } });
  if (!story) throw new Error("Story not found");

  const action = String(formData.get("action") ?? "save");
  const status = action === "publish" ? "PUBLISHED" : action === "unpublish" ? "DRAFT" : story.status;

  await prisma.story.update({
    where: { id: storyId },
    data: {
      title: String(formData.get("title") ?? story.title),
      excerpt: String(formData.get("excerpt") ?? "") || null,
      body: String(formData.get("body") ?? ""),
      coverImage: String(formData.get("coverImage") ?? "") || null,
      status,
      publishedAt: status === "PUBLISHED" ? (story.publishedAt ?? new Date()) : story.publishedAt,
    },
  });

  revalidatePath("/writer/stories");
  revalidatePath(`/writer/stories/${storyId}/edit`);
  revalidatePath("/editorial");
}

export async function deleteStory(storyId: string): Promise<{ ok: boolean }> {
  const authorId = await requireWriterId();
  await prisma.story.deleteMany({ where: { id: storyId, authorId } });
  revalidatePath("/writer/stories");
  revalidatePath("/editorial");
  return { ok: true };
}
