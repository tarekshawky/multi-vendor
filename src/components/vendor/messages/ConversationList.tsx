import { Link } from "@/i18n/navigation";
import { Avatar } from "@/components/ui/Avatar";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/cn";

type ConversationListItem = {
  id: string;
  customerName: string;
  customerAvatar: string | null;
  orderNumber: string | null;
  lastMessage: string | undefined;
  lastMessageAt: Date;
};

export function ConversationList({
  conversations,
  activeId,
  locale,
}: {
  conversations: ConversationListItem[];
  activeId?: string;
  locale: string;
}) {
  return (
    <div className="w-full lg:w-80 shrink-0 border-e-0 lg:border-e border-outline-variant/20">
      {conversations.map((c) => (
        <Link
          key={c.id}
          href={`/vendor/messages/${c.id}`}
          className={cn(
            "flex items-center gap-3 py-4 px-4 border-b border-outline-variant/20 transition-colors",
            activeId === c.id ? "bg-surface-container-lowest" : "hover:bg-surface-container-lowest",
          )}
        >
          <Avatar src={c.customerAvatar} name={c.customerName} size={40} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <p className="font-body-md text-sm text-primary truncate">{c.customerName}</p>
              <span className="text-[10px] text-on-surface-variant whitespace-nowrap">
                {formatDateTime(c.lastMessageAt, locale)}
              </span>
            </div>
            {c.orderNumber && (
              <span className="font-label-caps text-[9px] uppercase tracking-widest text-on-surface-variant">
                #{c.orderNumber}
              </span>
            )}
            <p className="text-xs text-on-surface-variant truncate">{c.lastMessage}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
