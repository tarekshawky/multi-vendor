import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { buttonClasses } from "@/components/ui/Button";
import { stockImages, unsplash } from "@/lib/stock-images";

export default function HomePage() {
  const t = useTranslations("Home");

  return (
    <>
      {/* Hero editorial section */}
      <section className="w-full h-[80vh] md:h-[90vh] relative px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto flex items-center justify-center mb-section-gap">
        <div className="absolute inset-0 z-0 px-margin-mobile md:px-margin-desktop pt-8 pb-16">
          <div className="w-full h-full relative overflow-hidden bg-surface-container-high">
            <Image
              src={unsplash(stockImages.heroHome, { w: 1920, q: 80 })}
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          </div>
        </div>
        <div className="relative z-10 flex flex-col items-center text-center max-w-2xl bg-surface/30 backdrop-blur-sm p-8 md:p-12 border border-outline-variant/10 shadow-[0_4px_40px_rgba(0,0,0,0.02)]">
          <h1 className="font-display text-display-lg-mobile md:text-display-lg text-primary mb-6">
            {t("heroTitle")}
          </h1>
          <p className="font-body-lg text-body-lg text-primary mb-8 max-w-lg">{t("heroDescription")}</p>
          <Link href="/collections" className={buttonClasses("primary", "lg")}>
            {t("heroCta")}
          </Link>
        </div>
      </section>
    </>
  );
}
