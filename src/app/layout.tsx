import { Toaster } from "@/components/ui/sonner";
import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import { getMessages } from "@/i18n/request";
import Providers from "./providers";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});

export const metadata: Metadata = {
  title: "Open Format Rewards",
  description: "On-chain rewards for your community",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { locale, messages } = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${manrope.variable} antialiased`}>
        <Providers messages={messages} locale={locale}>
          <main>{children}</main>
        </Providers>
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
