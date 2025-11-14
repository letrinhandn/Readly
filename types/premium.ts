export type SubscriptionPlan = 'free' | 'monthly' | 'yearly';

export type SubscriptionStatus = {
  isPremium: boolean;
  plan: SubscriptionPlan;
  expiresAt: string | null;
  willRenew: boolean;
};

export type ShareThemeType = 'free' | 'premium';

export type ShareTheme = {
  id: string;
  name: string;
  description: string;
  type: ShareThemeType;
  previewUrl?: string;
};

export const FREE_SHARE_THEMES: ShareTheme[] = [
  {
    id: 'minimal-light',
    name: 'Minimal Light',
    description: 'Clean and simple light theme',
    type: 'free',
  },
  {
    id: 'minimal-dark',
    name: 'Minimal Dark',
    description: 'Sleek dark theme',
    type: 'free',
  },
  {
    id: 'fancy-gradient',
    name: 'Fancy Gradient Glow',
    description: 'Colorful gradient with glow effects',
    type: 'free',
  },
];

export const PREMIUM_SHARE_THEMES: ShareTheme[] = [
  {
    id: 'tech-green',
    name: 'Tech Green / Code Hacker',
    description: 'Technology green, neon, coder vibes',
    type: 'premium',
  },
  {
    id: 'vintage',
    name: 'Vintage Paper',
    description: 'Old paper, sepia, classic',
    type: 'premium',
  },
  {
    id: 'golden',
    name: 'Golden Prestige',
    description: 'Black and gold, luxurious',
    type: 'premium',
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk Neon',
    description: 'Neon purple/blue, futuristic',
    type: 'premium',
  },
  {
    id: 'nature',
    name: 'Nature Calm Green',
    description: 'Light green, relaxing',
    type: 'premium',
  },
  {
    id: 'watercolor',
    name: 'Watercolor Pastel',
    description: 'Watercolor, soft, artistic',
    type: 'premium',
  },
  {
    id: 'space',
    name: 'Space Galaxy',
    description: 'Universe, galaxy, cosmic',
    type: 'premium',
  },
  {
    id: 'retro',
    name: 'Retro Pixel',
    description: '8-bit pixel art',
    type: 'premium',
  },
  {
    id: 'anime',
    name: 'Anime/Manga',
    description: 'Manga/anime effects',
    type: 'premium',
  },
  {
    id: 'sunset',
    name: 'Sunset Mood',
    description: 'Yellow/pink sunset tones',
    type: 'premium',
  },
];

export const ALL_SHARE_THEMES: ShareTheme[] = [
  ...FREE_SHARE_THEMES,
  ...PREMIUM_SHARE_THEMES,
];

export type PremiumFeature =
  | 'premium_share_themes'
  | 'advanced_analytics'
  | 'unlimited_books'
  | 'priority_support';

export const PREMIUM_FEATURES: Record<PremiumFeature, { name: string; description: string }> = {
  premium_share_themes: {
    name: 'Premium Share Themes',
    description: 'Access to 10 exclusive share card themes',
  },
  advanced_analytics: {
    name: 'Advanced Analytics',
    description: 'Deep insights into your reading habits',
  },
  unlimited_books: {
    name: 'Unlimited Books',
    description: 'Track as many books as you want',
  },
  priority_support: {
    name: 'Priority Support',
    description: 'Get help faster with priority support',
  },
};

export type RevenueCatProduct = {
  identifier: string;
  displayName: string;
  price: string;
  period: string;
};

export const REVENUECAT_CONFIG = {
  apiKey: 'test_EBCTTKAYreuszKiTMMyAjaLkcnF',
  entitlementId: 'Readly Premium',
  offeringId: 'default',
  products: {
    monthly: 'monthly',
    yearly: 'yearly',
  },
} as const;
