/**
 * Format Indian Rupee currency nicely.
 * For example:
 * - 32000 -> ₹32,000 / mo or ₹32,000
 * - 21500000 -> ₹2.15 Cr
 * - 7500000 -> ₹75 Lakhs
 */
export function formatPrice(amount: number, listingType?: string): string {
  if (amount == null || isNaN(amount)) return '₹0';

  let formatted = '';
  if (amount >= 10000000) {
    const cr = (amount / 10000000).toFixed(2).replace(/\.00$/, '');
    formatted = `₹${cr} Cr`;
  } else if (amount >= 100000) {
    const lk = (amount / 100000).toFixed(2).replace(/\.00$/, '');
    formatted = `₹${lk} L`;
  } else {
    formatted = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  }

  if (listingType === 'rent' || listingType === 'pg') {
    return `${formatted} / mo`;
  }
  return formatted;
}

export function formatNumberIN(num: number): string {
  return new Intl.NumberFormat('en-IN').format(num);
}

export function formatBHK(bedrooms: number, propertyType?: string): string {
  if (propertyType === 'pg') {
    return 'Single / Sharing';
  }
  if (bedrooms === 0) {
    return 'Studio / 1 RK';
  }
  return `${bedrooms} BHK`;
}

export function formatFurnishing(furnishing: string): string {
  switch (furnishing) {
    case 'furnished':
      return 'Fully Furnished';
    case 'semi-furnished':
      return 'Semi Furnished';
    case 'unfurnished':
      return 'Unfurnished';
    default:
      return furnishing;
  }
}
