import { getTranslations } from "next-intl/server";
import { RegisterForm } from "@/components/auth/RegisterForm";

export default async function RegisterPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations("Auth");

  return (
    <main className="flex min-h-screen items-center justify-center px-margin-mobile">
      <div className="w-full max-w-sm">
        <h1 className="font-display text-headline-lg text-primary mb-2 text-center">{t("createAccount")}</h1>
        <p className="text-on-surface-variant text-sm text-center mb-8">{t("joinCopy")}</p>
        <RegisterForm locale={locale} />
      </div>
    </main>
  );
}
