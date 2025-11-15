export type BadgeRarity = 
  | 'common' 
  | 'uncommon' 
  | 'rare' 
  | 'epic' 
  | 'legendary' 
  | 'mythic' 
  | 'godtier';

export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  rarity: BadgeRarity;
  iconUrl: string;
  category: 'time' | 'books' | 'genre' | 'author' | 'streak' | 'pages' | 'special' | 'reflection' | 'social' | 'events';
  criteria?: {
    type: 'time' | 'books_read' | 'genre' | 'author' | 'streak' | 'pages' | 'custom';
    value?: number | string;
    condition?: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface BadgeDefinitionDB {
  id: string;
  name: string;
  description: string;
  rarity: BadgeRarity;
  icon_url: string;
  category: string;
  criteria: any;
  created_at: string;
  updated_at: string;
}

export interface UserBadge {
  id: string;
  userId: string;
  badgeId: string;
  earnedAt: string;
  badge?: BadgeDefinition;
}

export interface UserBadgeDB {
  id: string;
  user_id: string;
  badge_id: string;
  earned_at: string;
  badge?: BadgeDefinitionDB;
}

export const BADGE_RARITY_COLORS: Record<BadgeRarity, { background: string; border: string; glow: string }> = {
  common: {
    background: '#3B82F6',
    border: '#60A5FA',
    glow: 'rgba(59, 130, 246, 0.3)',
  },
  uncommon: {
    background: '#10B981',
    border: '#34D399',
    glow: 'rgba(16, 185, 129, 0.3)',
  },
  rare: {
    background: '#8B5CF6',
    border: '#A78BFA',
    glow: 'rgba(139, 92, 246, 0.3)',
  },
  epic: {
    background: '#EC4899',
    border: '#F472B6',
    glow: 'rgba(236, 72, 153, 0.3)',
  },
  legendary: {
    background: '#F59E0B',
    border: '#FBBF24',
    glow: 'rgba(245, 158, 11, 0.4)',
  },
  mythic: {
    background: '#DC2626',
    border: '#FBBF24',
    glow: 'rgba(220, 38, 38, 0.4)',
  },
  godtier: {
    background: '#000000',
    border: '#F59E0B',
    glow: 'rgba(245, 158, 11, 0.5)',
  },
};

export function dbToBadgeDefinition(db: BadgeDefinitionDB): BadgeDefinition {
  return {
    id: db.id,
    name: db.name,
    description: db.description,
    rarity: db.rarity,
    iconUrl: db.icon_url,
    category: db.category as any,
    criteria: db.criteria,
    createdAt: db.created_at,
    updatedAt: db.updated_at,
  };
}

export function badgeDefinitionToDb(badge: BadgeDefinition): BadgeDefinitionDB {
  return {
    id: badge.id,
    name: badge.name,
    description: badge.description,
    rarity: badge.rarity,
    icon_url: badge.iconUrl,
    category: badge.category,
    criteria: badge.criteria,
    created_at: badge.createdAt,
    updated_at: badge.updatedAt,
  };
}

export function dbToUserBadge(db: UserBadgeDB): UserBadge {
  return {
    id: db.id,
    userId: db.user_id,
    badgeId: db.badge_id,
    earnedAt: db.earned_at,
    badge: db.badge ? dbToBadgeDefinition(db.badge) : undefined,
  };
}

export function userBadgeToDb(userBadge: UserBadge): UserBadgeDB {
  return {
    id: userBadge.id,
    user_id: userBadge.userId,
    badge_id: userBadge.badgeId,
    earned_at: userBadge.earnedAt,
  };
}
