import { Toaster } from "@/components/ui/sonner";
import { getMessages } from "@/i18n/request";
import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});

export const metadata: Metadata = {
  title: "Intelligent Communities | Your Scary Smart Community Co-pilot",
  description:
    "No more guesswork. No more firefighting. Just the tools, speed and insight you need to build communities that don't just launch - but last.",
  openGraph: {
    title: "Intelligent Communities | Your Scary Smart Community Co-pilot",
    description:
      "No more guesswork. No more firefighting. Just the tools, speed and insight you need to build communities that don't just launch - but last.",
    images: [
      {
        url: "/images/og-image.png",
        alt: "Intelligent Communities",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Intelligent Communities | Your Scary Smart Community Co-pilot",
    description:
      "No more guesswork. No more firefighting. Just the tools, speed and insight you need to build communities that don't just launch - but last.",
    images: ["/images/og-image.png"],
  },
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
