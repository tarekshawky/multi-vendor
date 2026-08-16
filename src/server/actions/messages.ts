"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function sendMessage(conversationId: string, formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const body = String(formData.get("body") ?? "").trim();
  if (!body) return;

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: { vendor: { select: { userId: true } } },
  });
  if (!conversation) throw new Error("Conversation not found");

  const isParticipant = conversation.customerId === session.user.id || conversation.vendor.userId === session.user.id;
  if (!isParticipant) throw new Error("Unauthorized");

  await prisma.$transaction([
    prisma.message.create({
      data: { conversationId, senderId: session.user.id, body },
    }),
    prisma.conversation.update({ where: { id: conversationId }, data: { lastMessageAt: new Date() } }),
  ]);

  revalidatePath(`/vendor/messages/${conversationId}`);
  revalidatePath("/vendor/messages");
}
