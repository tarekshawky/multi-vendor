import { getTranslations } from "next-intl/server";
import { createStory } from "@/server/actions/stories";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default async function NewStoryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("WriterStories");

  return (
    <div className="px-margin-mobile md:px-margin-desktop py-12 max-w-container-max">
      <h1 className="font-display text-headline-lg text-primary mb-12">{t("newStory")}</h1>
      <form action={createStory} className="space-y-8 max-w-lg">
        <input type="hidden" name="locale" value={locale} />
        <div className="space-y-2">
          <label className="block font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant">
            {t("fieldTitle")}
          </label>
          <Input type="text" name="title" required placeholder={t("titlePlaceholder")} />
        </div>
        <Button type="submit" size="lg">
          {t("continue")}
        </Button>
      </form>
    </div>
  );
}
