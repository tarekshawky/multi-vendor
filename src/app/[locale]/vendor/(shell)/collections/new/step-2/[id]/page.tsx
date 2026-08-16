import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { requireVendor } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { updateCollectionVisuals } from "@/server/actions/collections";
import { ImageUploadField } from "@/components/vendor/ImageUploadField";
import { Textarea } from "@/components/ui/Textarea";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default async function CollectionStep2Page({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const { vendor } = await requireVendor(locale);
  const t = await getTranslations("CollectionWizard");

  const collection = await prisma.collection.findFirst({ where: { id, vendorId: vendor.id } });
  if (!collection) notFound();

  const updateAction = updateCollectionVisuals.bind(null, id);

  return (
    <div className="px-margin-mobile md:px-margin-desktop py-12 max-w-4xl">
      <div className="flex items-center gap-4 mb-12">
        <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-label-caps text-label-caps">
          2
        </div>
        <h1 className="font-headline-sm text-headline-sm text-primary">{t("step2Title")}</h1>
      </div>

      <form action={updateAction} className="space-y-12">
        <input type="hidden" name="locale" value={locale} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
          <div className="space-y-2">
            <label className="block font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant">
              {t("heroImage")}
            </label>
            <ImageUploadField
              name="heroImage"
              defaultValue={collection.heroImage}
              label={t("dropzoneLabel")}
              hint={t("dropzoneHint")}
            />
          </div>

          <div className="space-y-8">
            <div className="space-y-2">
              <label className="block font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant">
                {t("narrative")}
              </label>
              <Textarea
                name="editorialDescription"
                rows={6}
                defaultValue={collection.editorialDescription ?? ""}
                placeholder={t("narrativePlaceholder")}
              />
            </div>
            <div className="space-y-2">
              <label className="block font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant">
                {t("vibeTags")}
              </label>
              <Input name="tags" defaultValue={collection.tags.join(", ")} placeholder={t("vibeTagsPlaceholder")} />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" size="lg">
            {t("nextProductCatalog")}
          </Button>
        </div>
      </form>
    </div>
  );
}
