import { getTranslations } from "next-intl/server";
import { requireVendor } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ConversationList } from "@/components/vendor/messages/ConversationList";
import { Icon } from "@/components/ui/icons/Icon";

export default async function VendorMessagesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const { vendor } = await requireVendor(locale);
  const t = await getTranslations("VendorMessages");

  const conversations = await prisma.conversation.findMany({
    where: { vendorId: vendor.id },
    orderBy: { lastMessageAt: "desc" },
    include: {
      customer: { include: { customerProfile: true } },
      order: { select: { orderNumber: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  return (
    <div className="flex h-screen">
      <div className="pt-8 lg:pt-0 overflow-y-auto h-full">
        <h1 className="font-display text-headline-sm text-primary px-4 mb-4">{t("title")}</h1>
        <ConversationList
          conversations={conversations.map((c) => ({
            id: c.id,
            customerName: c.customer.name,
            customerAvatar: c.customer.customerProfile?.avatar ?? null,
            orderNumber: c.order?.orderNumber ?? null,
            lastMessage: c.messages[0]?.body,
            lastMessageAt: c.lastMessageAt,
          }))}
          locale={locale}
        />
      </div>
      <div className="hidden lg:flex flex-1 items-center justify-center text-on-surface-variant">
        <div className="text-center">
          <Icon name="forum" size={40} className="mb-4" />
          <p>{t("selectConversation")}</p>
        </div>
      </div>
    </div>
  );
}
