import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { requireVendor } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { publishOrSaveCollection } from "@/server/actions/collections";
import { ProductCuration } from "@/components/vendor/collections/ProductCuration";

export default async function CollectionStep3Page({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const { vendor } = await requireVendor(locale);
  const t = await getTranslations("CollectionWizard");

  const collection = await prisma.collection.findFirst({ where: { id, vendorId: vendor.id } });
  if (!collection) notFound();

  const products = await prisma.product.findMany({
    where: { vendorId: vendor.id },
    orderBy: { createdAt: "desc" },
  });

  const publishAction = publishOrSaveCollection.bind(null, id);

  return (
    <div className="px-margin-mobile md:px-margin-desktop py-12 max-w-container-max">
      <div className="flex items-center gap-4 mb-12">
        <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-label-caps text-label-caps">
          3
        </div>
        <h1 className="font-headline-sm text-headline-sm text-primary">{t("step3Title")}</h1>
      </div>

      <form action={publishAction}>
        <input type="hidden" name="locale" value={locale} />
        <ProductCuration
          products={products.map((p) => ({ id: p.id, name: p.name, price: p.price.toString(), image: p.images[0] }))}
          initiallySelected={products.filter((p) => p.collectionId === id).map((p) => p.id)}
          currency={vendor.currency}
          locale={locale}
          status={collection.status}
          labels={{
            itemsSelected: t("itemsSelected"),
            totalValue: t("totalValue"),
            publish: t("publishCollection"),
            saveDraft: t("saveDraft"),
          }}
        />
      </form>
    </div>
  );
}
