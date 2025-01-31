import { Toaster } from "@/components/ui/sonner";
import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import { useTranslations } from 'next-intl';

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});

export const metadata: Metadata = {
  title: "Open Format Rewards",
  description: "On-chain rewards for your community",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const t = useTranslations('Index');

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>{t('title')}</title>
        <meta name="description" content={t('description')} />
      </head>
      <body className={`${manrope.variable} antialiased`}>
        <Providers>
          <main>{children}</main>
        </Providers>
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
