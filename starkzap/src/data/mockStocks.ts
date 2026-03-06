export interface Investment {
  symbol: string;
  name: string;
  value: number;
  changePercent: number;
  logoUrl: string;
  currency: string;
}

export interface DefiAsset {
  symbol: string;
  name: string;
  price: number;
  apy: number;
  changePercent: number;
  logoUrl: string;
  currency: string;
  holdings: number;
  stakedAmount: number;
}

export interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
  logoUrl: string;
  currency: string;
}

export interface Bond {
  name: string;
  yield: number;
  maturity: string;
  price: number;
  currency: string;
}

export interface Derivative {
  name: string;
  type: string;
  underlying: string;
  price: number;
  changePercent: number;
  currency: string;
  logoUrl: string;
}

const getLogoUrl = (domain: string) =>
  `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;

export const investments: Investment[] = [
  {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    value: 1245.8,
    changePercent: 1.23,
    logoUrl: getLogoUrl('apple.com'),
    currency: '€',
  },
  {
    symbol: 'IWDA',
    name: 'iShares MSCI World',
    value: 3520.0,
    changePercent: 0.45,
    logoUrl: getLogoUrl('ishares.com'),
    currency: '€',
  },
  {
    symbol: 'NVDA',
    name: 'NVIDIA Corp.',
    value: 890.5,
    changePercent: 3.67,
    logoUrl: getLogoUrl('nvidia.com'),
    currency: '€',
  },
  {
    symbol: 'MSFT',
    name: 'Microsoft Corp.',
    value: 1678.3,
    changePercent: -0.34,
    logoUrl: getLogoUrl('microsoft.com'),
    currency: '€',
  },
];

export const totalPortfolioValue = investments.reduce((sum, inv) => sum + inv.value, 0);
export const portfolioChangePercent = 1.24;

export const portfolioChartData = [
  4800, 4850, 4780, 4920, 5010, 5080, 5020, 5150, 5200, 5180, 5250, 5334.6,
  5280, 5350, 5400, 5380, 5450, 5500, 5480, 5550, 5600, 5580, 5650, 5700,
  5680, 5750, 5800, 5780, 5850, 5900,
];

export const btcYieldChartData = [
  100, 100.5, 101, 101.8, 102.3, 102.8, 103.2, 103.5, 104, 104.3, 104.8,
  105.2, 105.5, 106, 106.3, 106.8, 107.2, 107.5, 108, 108.3, 108.8, 109.2,
  109.5, 110, 110.3, 110.8, 111.2, 111.5, 112, 112.5,
];

export const topMovers: StockQuote[] = [
  {
    symbol: 'TSLA',
    name: 'Tesla Inc.',
    price: 248.5,
    changePercent: 5.67,
    logoUrl: getLogoUrl('tesla.com'),
    currency: '$',
  },
  {
    symbol: 'AMZN',
    name: 'Amazon',
    price: 178.2,
    changePercent: 3.45,
    logoUrl: getLogoUrl('amazon.com'),
    currency: '$',
  },
  {
    symbol: 'META',
    name: 'Meta Platforms',
    price: 505.8,
    changePercent: -2.1,
    logoUrl: getLogoUrl('meta.com'),
    currency: '$',
  },
  {
    symbol: 'GOOGL',
    name: 'Alphabet',
    price: 141.3,
    changePercent: 1.89,
    logoUrl: getLogoUrl('google.com'),
    currency: '$',
  },
];

export const trending: StockQuote[] = [
  {
    symbol: 'AAPL',
    name: 'Apple',
    price: 189.84,
    changePercent: 1.23,
    logoUrl: getLogoUrl('apple.com'),
    currency: '$',
  },
  {
    symbol: 'NVDA',
    name: 'NVIDIA',
    price: 875.28,
    changePercent: 3.67,
    logoUrl: getLogoUrl('nvidia.com'),
    currency: '$',
  },
  {
    symbol: 'MSFT',
    name: 'Microsoft',
    price: 415.6,
    changePercent: -0.34,
    logoUrl: getLogoUrl('microsoft.com'),
    currency: '$',
  },
  {
    symbol: 'AMZN',
    name: 'Amazon',
    price: 178.2,
    changePercent: 3.45,
    logoUrl: getLogoUrl('amazon.com'),
    currency: '$',
  },
];

export const stocks: StockQuote[] = [
  {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    price: 189.84,
    changePercent: 1.23,
    logoUrl: getLogoUrl('apple.com'),
    currency: '$',
  },
  {
    symbol: 'NVDA',
    name: 'NVIDIA Corp.',
    price: 875.28,
    changePercent: 3.67,
    logoUrl: getLogoUrl('nvidia.com'),
    currency: '$',
  },
  {
    symbol: 'MSFT',
    name: 'Microsoft Corp.',
    price: 415.6,
    changePercent: -0.34,
    logoUrl: getLogoUrl('microsoft.com'),
    currency: '$',
  },
  {
    symbol: 'GOOGL',
    name: 'Alphabet Inc.',
    price: 141.3,
    changePercent: 1.89,
    logoUrl: getLogoUrl('google.com'),
    currency: '$',
  },
  {
    symbol: 'TSLA',
    name: 'Tesla Inc.',
    price: 248.5,
    changePercent: 5.67,
    logoUrl: getLogoUrl('tesla.com'),
    currency: '$',
  },
  {
    symbol: 'AMZN',
    name: 'Amazon.com',
    price: 178.2,
    changePercent: 3.45,
    logoUrl: getLogoUrl('amazon.com'),
    currency: '$',
  },
];

export const bonds: Bond[] = [
  { name: 'US Treasury 10Y', yield: 4.25, maturity: '2034', price: 98.5, currency: '$' },
  { name: 'German Bund 10Y', yield: 2.35, maturity: '2034', price: 99.2, currency: '€' },
  { name: 'UK Gilt 10Y', yield: 3.95, maturity: '2034', price: 97.8, currency: '£' },
  { name: 'Japan Gov 10Y', yield: 0.85, maturity: '2034', price: 100.1, currency: '¥' },
];

export const derivatives: Derivative[] = [
  {
    name: 'AAPL Call 200',
    type: 'Call',
    underlying: 'AAPL',
    price: 12.5,
    changePercent: 8.3,
    currency: '$',
    logoUrl: getLogoUrl('apple.com'),
  },
  {
    name: 'NVDA Put 800',
    type: 'Put',
    underlying: 'NVDA',
    price: 45.2,
    changePercent: -3.1,
    currency: '$',
    logoUrl: getLogoUrl('nvidia.com'),
  },
  {
    name: 'SPY Call 500',
    type: 'Call',
    underlying: 'SPY',
    price: 8.9,
    changePercent: 2.4,
    currency: '$',
    logoUrl: getLogoUrl('spglobal.com'),
  },
  {
    name: 'TSLA Call 300',
    type: 'Call',
    underlying: 'TSLA',
    price: 15.6,
    changePercent: 12.1,
    currency: '$',
    logoUrl: getLogoUrl('tesla.com'),
  },
];
