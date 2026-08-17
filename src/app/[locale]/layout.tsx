import type { Metadata } from "next";
import { Playfair_Display, Inter, Markazi_Text, Noto_Sans_Arabic } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { AuthSessionProvider } from "@/components/auth/AuthSessionProvider";
import "../globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "600"],
});

const markazi = Markazi_Text({
  variable: "--font-markazi",
  subsets: ["arabic"],
  weight: ["400", "600", "700"],
});

const notoSansArabic = Noto_Sans_Arabic({
  variable: "--font-noto-arabic",
  subsets: ["arabic"],
  weight: ["300", "400", "600"],
});

export const metadata: Metadata = {
  title: "VOGUE-CHIC Marketplace",
  description: "A high-end multi-vendor luxury fashion marketplace.",
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <html
      lang={locale}
      dir={dir}
      className={`${playfair.variable} ${inter.variable} ${markazi.variable} ${notoSansArabic.variable} antialiased`}
    >
      <body className="bg-background text-on-background font-body-md min-h-screen">
        <NextIntlClientProvider>
          <AuthSessionProvider>{children}</AuthSessionProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
