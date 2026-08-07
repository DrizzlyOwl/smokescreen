/**
 * Locale-aware currency formatting utility.
 * Uses the browser's locale by default, with USD as the default currency.
 */

/**
 * Format a number as currency using the user's locale.
 * @param amount - The amount to format
 * @param currency - ISO 4217 currency code (default: 'USD')
 * @param locale - BCP 47 locale string (default: browser locale)
 */
export const formatCurrency = (
  amount: number,
  currency: string = 'USD',
  locale: string = navigator.language
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Format a number as currency per hour.
 * @param amount - The hourly rate
 * @param currency - ISO 4217 currency code (default: 'USD')
 * @param locale - BCP 47 locale string (default: browser locale)
 */
export const formatCurrencyPerHour = (
  amount: number,
  currency: string = 'USD',
  locale: string = navigator.language
): string => {
  return `${formatCurrency(amount, currency, locale)}/hr`;
};
