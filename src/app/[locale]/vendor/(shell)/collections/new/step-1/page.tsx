import { getTranslations } from "next-intl/server";
import { requireVendor } from "@/lib/session";
import { createDraftCollection } from "@/server/actions/collections";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";

export default async function CollectionStep1Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  await requireVendor(locale);
  const t = await getTranslations("CollectionWizard");

  return (
    <div className="px-margin-mobile md:px-margin-desktop py-12 max-w-3xl">
      <div className="flex items-center gap-4 mb-12">
        <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-label-caps text-label-caps">
          1
        </div>
        <h1 className="font-headline-sm text-headline-sm text-primary">{t("step1Title")}</h1>
      </div>

      <form action={createDraftCollection} className="space-y-12">
        <input type="hidden" name="locale" value={locale} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-2">
            <label className="block font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant">
              {t("collectionName")}
            </label>
            <Input name="name" placeholder={t("collectionNamePlaceholder")} required />
          </div>
          <div className="space-y-2">
            <label className="block font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant">
              {t("seasonYear")}
            </label>
            <Select name="season" defaultValue="Spring/Summer 2025">
              <option>Spring/Summer 2025</option>
              <option>Autumn/Winter 2025</option>
              <option>Resort 2025</option>
              <option>Pre-Fall 2025</option>
            </Select>
          </div>
        </div>
        <div className="space-y-2">
          <label className="block font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant">
            {t("editorialDescription")}
          </label>
          <Textarea name="editorialDescription" rows={4} placeholder={t("editorialDescriptionPlaceholder")} />
        </div>
        <div className="flex justify-end">
          <Button type="submit" size="lg">
            {t("next")}
          </Button>
        </div>
      </form>
    </div>
  );
}
