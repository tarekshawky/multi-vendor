import { getTranslations } from "next-intl/server";
import { LoginForm } from "@/components/auth/LoginForm";

export default async function LoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}) {
  const { locale } = await params;
  const { callbackUrl, error } = await searchParams;
  const t = await getTranslations("Auth");

  return (
    <main className="flex min-h-screen items-center justify-center px-margin-mobile">
      <div className="w-full max-w-sm">
        <h1 className="font-display text-headline-lg text-primary mb-2 text-center">{t("signIn")}</h1>
        <p className="text-on-surface-variant text-sm text-center mb-8">{t("welcomeBack")}</p>
        <LoginForm locale={locale} callbackUrl={callbackUrl} initialError={error === "accountSuspended" ? "accountSuspended" : undefined} />
      </div>
    </main>
  );
}
