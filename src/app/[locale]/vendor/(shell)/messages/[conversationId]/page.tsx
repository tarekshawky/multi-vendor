import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { requireVendor } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Link } from "@/i18n/navigation";
import { Avatar } from "@/components/ui/Avatar";
import { ConversationList } from "@/components/vendor/messages/ConversationList";
import { sendMessage } from "@/server/actions/messages";
import { cn } from "@/lib/cn";
import { formatDateTime } from "@/lib/format";

export default async function ConversationThreadPage({
  params,
}: {
  params: Promise<{ locale: string; conversationId: string }>;
}) {
  const { locale, conversationId } = await params;
  const { vendor, user } = await requireVendor(locale);
  const t = await getTranslations("VendorMessages");

  const [conversations, activeConversation] = await Promise.all([
    prisma.conversation.findMany({
      where: { vendorId: vendor.id },
      orderBy: { lastMessageAt: "desc" },
      include: {
        customer: { include: { customerProfile: true } },
        order: { select: { orderNumber: true } },
        messages: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    }),
    prisma.conversation.findFirst({
      where: { id: conversationId, vendorId: vendor.id },
      include: {
        customer: { include: { customerProfile: true } },
        order: { select: { id: true, orderNumber: true } },
        messages: { orderBy: { createdAt: "asc" }, include: { sender: { select: { name: true } } } },
      },
    }),
  ]);

  if (!activeConversation) notFound();

  const sendAction = sendMessage.bind(null, conversationId);

  return (
    <div className="flex h-screen">
      <div className="hidden lg:block pt-0 overflow-y-auto h-full">
        <h1 className="font-display text-headline-sm text-primary px-4 py-4">{t("title")}</h1>
        <ConversationList
          conversations={conversations.map((c) => ({
            id: c.id,
            customerName: c.customer.name,
            customerAvatar: c.customer.customerProfile?.avatar ?? null,
            orderNumber: c.order?.orderNumber ?? null,
            lastMessage: c.messages[0]?.body,
            lastMessageAt: c.lastMessageAt,
          }))}
          activeId={conversationId}
          locale={locale}
        />
      </div>

      <div className="flex-1 flex flex-col h-full">
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/20">
          <div className="flex items-center gap-3">
            <Avatar src={activeConversation.customer.customerProfile?.avatar} name={activeConversation.customer.name} size={36} />
            <p className="font-body-md text-primary">{activeConversation.customer.name}</p>
          </div>
          {activeConversation.order && (
            <Link
              href={`/vendor/orders/${activeConversation.order.id}`}
              className="font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors"
            >
              {t("viewOrder")}
            </Link>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
          {activeConversation.messages.map((message) => {
            const isVendor = message.senderId === user.id;
            return (
              <div key={message.id} className={cn("flex", isVendor ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-sm px-4 py-3",
                    isVendor ? "bg-primary text-on-primary" : "bg-surface-container-lowest text-primary border border-outline-variant/20",
                  )}
                >
                  <p className="text-sm">{message.body}</p>
                  <p className={cn("text-[10px] mt-1", isVendor ? "text-on-primary/60" : "text-on-surface-variant")}>
                    {formatDateTime(message.createdAt, locale)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <form action={sendAction} className="flex items-center gap-3 px-6 py-4 border-t border-outline-variant/20">
          <input
            name="body"
            required
            placeholder={t("typeMessage")}
            className="input-editorial font-body-md text-sm text-primary flex-1"
          />
          <button
            type="submit"
            className="font-label-caps text-label-caps uppercase tracking-widest text-primary hover:opacity-70 transition-opacity"
          >
            {t("send")}
          </button>
        </form>
      </div>
    </div>
  );
}
