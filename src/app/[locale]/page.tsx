import { useTranslations } from "next-intl";

export default function Home() {
  const t = useTranslations("Home");

  return (
    <main className="flex min-h-screen items-center justify-center px-margin-mobile md:px-margin-desktop">
      <h1 className="font-display text-display-lg-mobile md:text-display-lg text-primary text-center">
        {t("title")}
      </h1>
    </main>
  );
}
