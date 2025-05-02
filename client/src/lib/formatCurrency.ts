// Utility for formatting currency based on locale
export function formatCurrency(amount: number, currency: string = 'INR'): string {
  const formatOptions: Intl.NumberFormatOptions = {
    style: 'currency',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  };
  
  // Set the correct currency code and locale
  switch (currency) {
    case 'USD':
      formatOptions.currency = 'USD';
      return new Intl.NumberFormat('en-US', formatOptions).format(amount);
    
    case 'GBP':
      formatOptions.currency = 'GBP';
      return new Intl.NumberFormat('en-GB', formatOptions).format(amount);
    
    case 'SGD':
      formatOptions.currency = 'SGD';
      return new Intl.NumberFormat('en-SG', formatOptions).format(amount);
    
    case 'INR':
    default:
      formatOptions.currency = 'INR';
      return new Intl.NumberFormat('en-IN', formatOptions).format(amount);
  }
}

// Get currency symbol for use in labels
export function getCurrencySymbol(currency: string = 'INR'): string {
  switch (currency) {
    case 'USD':
      return '$';
    case 'GBP':
      return '£';
    case 'SGD':
      return 'S$';
    case 'INR':
    default:
      return '₹';
  }
}

// Convert amount between currencies (simplified conversion rates)
export function convertCurrency(amount: number, fromCurrency: string, toCurrency: string): number {
  if (fromCurrency === toCurrency) return amount;
  
  // Simplified conversion rates (for demo purposes only)
  const rates: Record<string, Record<string, number>> = {
    'INR': {
      'USD': 0.012,
      'GBP': 0.0095,
      'SGD': 0.016
    },
    'USD': {
      'INR': 83.0,
      'GBP': 0.79,
      'SGD': 1.35
    },
    'GBP': {
      'INR': 105.0,
      'USD': 1.26,
      'SGD': 1.70
    },
    'SGD': {
      'INR': 61.5,
      'USD': 0.74,
      'GBP': 0.59
    }
  };
  
  // Convert to target currency
  return amount * (rates[fromCurrency]?.[toCurrency] || 1);
}