export type ShareThemeType = 
  | 'minimal-light'
  | 'minimal-dark'
  | 'fancy-gradient'
  | 'tech-green'
  | 'vintage-paper'
  | 'golden-prestige'
  | 'cyberpunk-neon'
  | 'nature-calm'
  | 'watercolor-pastel'
  | 'space-galaxy'
  | 'retro-pixel'
  | 'anime-manga'
  | 'sunset-mood';

export interface ShareTheme {
  id: ShareThemeType;
  name: string;
  isPremium: boolean;
  colors: {
    background: string;
    cardBackground: string;
    primary: string;
    secondary: string;
    text: string;
    textSecondary: string;
    accent: string;
    border: string;
  };
  gradients?: {
    header?: string[];
    background?: string[];
    accent?: string[];
  };
  fonts?: {
    header?: string;
    body?: string;
  };
  effects?: {
    shadow?: boolean;
    glow?: boolean;
    pattern?: 'dots' | 'grid' | 'waves' | 'stars' | 'pixels' | 'manga-lines' | 'paper-texture';
    borderStyle?: 'solid' | 'dashed' | 'gradient' | 'glow';
  };
}

export const shareThemes: Record<ShareThemeType, ShareTheme> = {
  'minimal-light': {
    id: 'minimal-light',
    name: 'Minimal Light',
    isPremium: false,
    colors: {
      background: '#FFFFFF',
      cardBackground: '#FAFAFA',
      primary: '#2D3748',
      secondary: '#4A5568',
      text: '#1A202C',
      textSecondary: '#718096',
      accent: '#3B82F6',
      border: '#E2E8F0',
    },
    effects: {
      shadow: true,
    },
  },
  'minimal-dark': {
    id: 'minimal-dark',
    name: 'Minimal Dark',
    isPremium: false,
    colors: {
      background: '#0F172A',
      cardBackground: '#1E293B',
      primary: '#F1F5F9',
      secondary: '#CBD5E1',
      text: '#F8FAFC',
      textSecondary: '#94A3B8',
      accent: '#60A5FA',
      border: '#334155',
    },
    effects: {
      shadow: true,
    },
  },
  'fancy-gradient': {
    id: 'fancy-gradient',
    name: 'Fancy Gradient Glow',
    isPremium: false,
    colors: {
      background: '#FFFFFF',
      cardBackground: '#FFFFFF',
      primary: '#8B5CF6',
      secondary: '#EC4899',
      text: '#1F2937',
      textSecondary: '#6B7280',
      accent: '#F59E0B',
      border: '#E5E7EB',
    },
    gradients: {
      header: ['#8B5CF6', '#EC4899', '#F59E0B'],
      accent: ['#8B5CF6', '#EC4899'],
    },
    effects: {
      shadow: true,
      glow: true,
    },
  },
  'tech-green': {
    id: 'tech-green',
    name: 'Tech Green / Code Hacker',
    isPremium: true,
    colors: {
      background: '#000000',
      cardBackground: '#0A0E0F',
      primary: '#00FF41',
      secondary: '#00CC33',
      text: '#00FF41',
      textSecondary: '#00CC33',
      accent: '#00FF88',
      border: '#003311',
    },
    effects: {
      shadow: true,
      glow: true,
      pattern: 'grid',
      borderStyle: 'glow',
    },
  },
  'vintage-paper': {
    id: 'vintage-paper',
    name: 'Vintage Paper',
    isPremium: true,
    colors: {
      background: '#F4EBD9',
      cardBackground: '#EDE0CE',
      primary: '#5D4E37',
      secondary: '#8B7355',
      text: '#3E2F1F',
      textSecondary: '#6B5D4F',
      accent: '#A0826D',
      border: '#C4B5A0',
    },
    effects: {
      shadow: false,
      pattern: 'paper-texture',
    },
  },
  'golden-prestige': {
    id: 'golden-prestige',
    name: 'Golden Prestige',
    isPremium: true,
    colors: {
      background: '#0A0A0A',
      cardBackground: '#1A1A1A',
      primary: '#FFD700',
      secondary: '#FFA500',
      text: '#FFFFFF',
      textSecondary: '#D4AF37',
      accent: '#FFE55C',
      border: '#4A3F1A',
    },
    gradients: {
      header: ['#FFD700', '#FFA500', '#FF8C00'],
      accent: ['#FFD700', '#FFA500'],
    },
    effects: {
      shadow: true,
      glow: true,
      borderStyle: 'gradient',
    },
  },
  'cyberpunk-neon': {
    id: 'cyberpunk-neon',
    name: 'Cyberpunk Neon',
    isPremium: true,
    colors: {
      background: '#0D0221',
      cardBackground: '#1A0B2E',
      primary: '#FF006E',
      secondary: '#8338EC',
      text: '#FFFFFF',
      textSecondary: '#D4A5FF',
      accent: '#00F0FF',
      border: '#4A148C',
    },
    gradients: {
      header: ['#FF006E', '#8338EC', '#00F0FF'],
      background: ['#1A0B2E', '#0D0221'],
    },
    effects: {
      shadow: true,
      glow: true,
      pattern: 'grid',
      borderStyle: 'glow',
    },
  },
  'nature-calm': {
    id: 'nature-calm',
    name: 'Nature Calm Green',
    isPremium: true,
    colors: {
      background: '#F0F7F0',
      cardBackground: '#E8F5E9',
      primary: '#2E7D32',
      secondary: '#66BB6A',
      text: '#1B5E20',
      textSecondary: '#4CAF50',
      accent: '#81C784',
      border: '#C8E6C9',
    },
    effects: {
      shadow: true,
      pattern: 'waves',
    },
  },
  'watercolor-pastel': {
    id: 'watercolor-pastel',
    name: 'Watercolor Pastel',
    isPremium: true,
    colors: {
      background: '#FFF8F0',
      cardBackground: '#FFF3E6',
      primary: '#FF9AA2',
      secondary: '#B5EAD7',
      text: '#5D4E6D',
      textSecondary: '#9A8BA5',
      accent: '#FFB7B2',
      border: '#E2CFC4',
    },
    gradients: {
      header: ['#FF9AA2', '#FFB7B2', '#FFDAC1', '#E2F0CB', '#B5EAD7', '#C7CEEA'],
    },
    effects: {
      shadow: true,
    },
  },
  'space-galaxy': {
    id: 'space-galaxy',
    name: 'Space Galaxy',
    isPremium: true,
    colors: {
      background: '#000814',
      cardBackground: '#001D3D',
      primary: '#FFC300',
      secondary: '#003566',
      text: '#FFFFFF',
      textSecondary: '#8ECAE6',
      accent: '#FFD60A',
      border: '#023E8A',
    },
    gradients: {
      header: ['#001D3D', '#003566', '#023E8A'],
      background: ['#000814', '#001D3D'],
    },
    effects: {
      shadow: true,
      glow: true,
      pattern: 'stars',
    },
  },
  'retro-pixel': {
    id: 'retro-pixel',
    name: 'Retro Pixel',
    isPremium: true,
    colors: {
      background: '#2D2D2D',
      cardBackground: '#3D3D3D',
      primary: '#00FF00',
      secondary: '#FFFF00',
      text: '#FFFFFF',
      textSecondary: '#00FFFF',
      accent: '#FF00FF',
      border: '#555555',
    },
    effects: {
      shadow: false,
      pattern: 'pixels',
      borderStyle: 'solid',
    },
  },
  'anime-manga': {
    id: 'anime-manga',
    name: 'Anime/Manga',
    isPremium: true,
    colors: {
      background: '#FFFFFF',
      cardBackground: '#FFF9F5',
      primary: '#FF69B4',
      secondary: '#9370DB',
      text: '#2C2C2C',
      textSecondary: '#6B6B6B',
      accent: '#FFB6C1',
      border: '#FFE4E1',
    },
    effects: {
      shadow: true,
      pattern: 'manga-lines',
      borderStyle: 'solid',
    },
  },
  'sunset-mood': {
    id: 'sunset-mood',
    name: 'Sunset Mood',
    isPremium: true,
    colors: {
      background: '#FFF8E7',
      cardBackground: '#FFE5D0',
      primary: '#FF6B35',
      secondary: '#F7931E',
      text: '#5D3A1A',
      textSecondary: '#8B5A2B',
      accent: '#FFC857',
      border: '#FFD4A3',
    },
    gradients: {
      header: ['#FF6B35', '#F7931E', '#FFC857', '#FFE66D'],
    },
    effects: {
      shadow: true,
    },
  },
};

export const freeThemes: ShareThemeType[] = ['minimal-light', 'minimal-dark', 'fancy-gradient'];
export const premiumThemes: ShareThemeType[] = [
  'tech-green',
  'vintage-paper',
  'golden-prestige',
  'cyberpunk-neon',
  'nature-calm',
  'watercolor-pastel',
  'space-galaxy',
  'retro-pixel',
  'anime-manga',
  'sunset-mood',
];
