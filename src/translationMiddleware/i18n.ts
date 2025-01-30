import createIntlMiddleware from 'next-intl/middleware';
import { defaultLocale, locales } from '../config/i18n';

export const i18nMiddleware = createIntlMiddleware({
  locales: locales,
  defaultLocale: defaultLocale,
  localePrefix: 'as-needed'
}); 