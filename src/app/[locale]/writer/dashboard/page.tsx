import { getTranslations } from "next-intl/server";
import { requireWriter } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Link } from "@/i18n/navigation";
import { StatCard } from "@/components/ui/StatCard";
import { StatusPill } from "@/components/ui/StatusPill";
import { formatDate } from "@/lib/format";

export default async function WriterDashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const { user } = await requireWriter(locale);
  const t = await getTranslations("WriterDashboard");

  const [total, published, draft, recentStories] = await Promise.all([
    prisma.story.count({ where: { authorId: user.id } }),
    prisma.story.count({ where: { authorId: user.id, status: "PUBLISHED" } }),
    prisma.story.count({ where: { authorId: user.id, status: "DRAFT" } }),
    prisma.story.findMany({ where: { authorId: user.id }, orderBy: { updatedAt: "desc" }, take: 6 }),
  ]);

  return (
    <div className="px-margin-mobile md:px-margin-desktop py-12 max-w-container-max">
      <h1 className="font-display text-headline-lg text-primary mb-12">{t("greeting", { name: user.name ?? "" })}</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
        <StatCard label={t("totalStories")} value={String(total)} icon="auto_stories" inverted />
        <StatCard label={t("published")} value={String(published)} icon="visibility" />
        <StatCard label={t("drafts")} value={String(draft)} icon="edit_note" />
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant/20 p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-headline-sm text-headline-sm text-primary">{t("recentStories")}</h2>
          <Link href="/writer/stories" className="font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors">
            {t("viewAllStories")}
          </Link>
        </div>
        {recentStories.length === 0 ? (
          <p className="text-on-surface-variant text-center py-12">{t("empty")}</p>
        ) : (
          <div className="space-y-4">
            {recentStories.map((s) => (
              <Link
                key={s.id}
                href={`/writer/stories/${s.id}/edit`}
                className="flex items-center justify-between py-3 border-b border-outline-variant/20 last:border-0 hover:opacity-70 transition-opacity"
              >
                <div>
                  <p className="font-body-md text-primary">{s.title}</p>
                  <p className="text-xs text-on-surface-variant">{formatDate(s.updatedAt, locale)}</p>
                </div>
                <StatusPill label={s.status} tone={s.status === "PUBLISHED" ? "neutral" : "positive"} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
