import { getTranslations } from "next-intl/server";
import { requireWriter } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Link } from "@/i18n/navigation";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { StatusPill } from "@/components/ui/StatusPill";
import { buttonClasses } from "@/components/ui/Button";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { deleteStory } from "@/server/actions/stories";
import { formatDate } from "@/lib/format";

type StoryRow = {
  id: string;
  title: string;
  status: string;
  updatedAt: Date;
};

export default async function WriterStoriesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const { user } = await requireWriter(locale);
  const t = await getTranslations("WriterStories");
  const tc = await getTranslations("AdminCommon");

  const stories = await prisma.story.findMany({
    where: { authorId: user.id },
    orderBy: { updatedAt: "desc" },
  });

  const rows: StoryRow[] = stories.map((s) => ({ id: s.id, title: s.title, status: s.status, updatedAt: s.updatedAt }));

  const columns: Column<StoryRow>[] = [
    {
      key: "title",
      header: t("storyTitle"),
      render: (r) => (
        <Link href={`/writer/stories/${r.id}/edit`} className="text-primary hover:underline">
          {r.title}
        </Link>
      ),
    },
    {
      key: "status",
      header: t("status"),
      render: (r) => <StatusPill label={r.status} tone={r.status === "PUBLISHED" ? "neutral" : "positive"} />,
    },
    { key: "updatedAt", header: t("lastUpdated"), render: (r) => formatDate(r.updatedAt, locale) },
    {
      key: "actions",
      header: "",
      align: "end",
      render: (r) => (
        <div className="flex items-center justify-end gap-4">
          <Link
            href={`/writer/stories/${r.id}/edit`}
            className="font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors"
          >
            {tc("edit")}
          </Link>
          <DeleteButton id={r.id} action={deleteStory} confirmMessage={t("confirmDelete", { title: r.title })} />
        </div>
      ),
    },
  ];

  return (
    <div className="px-margin-mobile md:px-margin-desktop py-12 max-w-container-max">
      <div className="flex items-center justify-between mb-12">
        <h1 className="font-display text-headline-lg text-primary">{t("title")}</h1>
        <Link href="/writer/stories/new" className={buttonClasses("primary", "md")}>
          {t("newStory")}
        </Link>
      </div>
      {rows.length === 0 ? (
        <p className="text-on-surface-variant text-center py-24">{t("empty")}</p>
      ) : (
        <div className="bg-surface-container-lowest border border-outline-variant/20 p-8">
          <DataTable columns={columns} rows={rows} rowKey={(r) => r.id} />
        </div>
      )}
    </div>
  );
}
