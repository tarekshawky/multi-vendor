import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { requireWriter } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { StoryEditForm } from "@/components/writer/StoryEditForm";

export default async function EditStoryPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const { user } = await requireWriter(locale);
  const t = await getTranslations("WriterStories");

  const story = await prisma.story.findFirst({ where: { id, authorId: user.id } });
  if (!story) notFound();

  return (
    <div className="px-margin-mobile md:px-margin-desktop py-12 max-w-container-max">
      <Breadcrumb items={[{ label: t("title"), href: "/writer/stories" }, { label: story.title }]} />
      <h1 className="font-display text-headline-lg text-primary mt-6 mb-12">{t("editStory")}</h1>
      <StoryEditForm story={story} />
    </div>
  );
}
