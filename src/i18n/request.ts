import { getRequestConfig } from "next-intl/server";

export const defaultLocale = "en";
export const locales = ["en"]; // Add supported locales here

export async function getMessages(locale: string = defaultLocale) {
  // input locale choice here eg locale = locale[0] or pass locale as a prop
  try {
    return {
      locale,
      messages: (await import(`../../messages/${locale}.json`)).default,
    };
  } catch (error) {
    return {
      locale: defaultLocale,
      messages: (await import(`../../messages/${defaultLocale}.json`)).default,
    };
  }
}

// Keep the default export for Next.js
export default getRequestConfig(async () => {
  const { locale, messages } = await getMessages();
  return {
    locale,
    messages,
    timeZone: "UTC",
  };
});
