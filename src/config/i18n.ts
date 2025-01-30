// Define the supported locales
export const locales = ['en'] as const;

// Define the default locale
export const defaultLocale = 'en';

// Type for supported locales
export type Locale = typeof locales[number];

// Type for translation namespaces
export type Namespace = 'common' | 'auth' | 'communities'; 