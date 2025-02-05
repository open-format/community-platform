import {getRequestConfig} from 'next-intl/server';

const defaultLocale = 'en'
const locales = ['en'] // Add supported locales here

export async function getMessages(locale: string = defaultLocale) {
  // place language choice here eg locale = locale[0]
  try {
    return {
      locale,
      messages: (await import(`../../messages/${locale}.json`)).default
    };
  } catch (error) {
    // Fallback to default locale if requested locale file doesn't exist
    return {
      locale: defaultLocale,
      messages: (await import(`../../messages/${defaultLocale}.json`)).default
    };
  }
}

export default getRequestConfig(async () => {
  return await getMessages();
});