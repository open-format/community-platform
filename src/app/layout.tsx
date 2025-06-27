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
	title: "Open Format - Your Web3 CommunityOS",
	description:
		"See everything. Reward what matters. Save hours each day. Open Format is your Web3 CommunityOS that provides actionable insights, data-driven recommendations, and one-click rewards for Discord and Telegram communities.",
	openGraph: {
		title: "Open Format - Your Web3 CommunityOS",
		description:
			"See everything. Reward what matters. Save hours each day. Open Format is your Web3 CommunityOS that provides actionable insights, data-driven recommendations, and one-click rewards for Discord and Telegram communities.",
		url: "https://www.openformat.tech/",
		type: "website",
		images: [
			{
				url: "https://openformat.tech/assets/socialPreview.jpg",
				width: 1200,
				height: 630,
				alt: "Open Format Social Preview",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "Open Format - Your Web3 CommunityOS",
		description:
			"See everything. Reward what matters. Save hours each day. Open Format is your Web3 CommunityOS that provides actionable insights, data-driven recommendations, and one-click rewards for Discord and Telegram communities.",
		images: ["https://openformat.tech/assets/socialPreview.jpg"],
		site: "@openformat",
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
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
