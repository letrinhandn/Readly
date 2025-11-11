export interface UserProfile {
  id: string;
  name: string;
  bio: string;
  age?: number;
  gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  profileImage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfileDB {
  id: string;
  name: string;
  bio: string;
  age?: number;
  gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  profile_image?: string;
  created_at: string;
  updated_at: string;
}

export function dbToProfile(dbProfile: UserProfileDB): UserProfile {
  return {
    id: dbProfile.id,
    name: dbProfile.name,
    bio: dbProfile.bio,
    age: dbProfile.age,
    gender: dbProfile.gender,
    profileImage: dbProfile.profile_image,
    createdAt: dbProfile.created_at,
    updatedAt: dbProfile.updated_at,
  };
}

export function profileToDb(profile: UserProfile): UserProfileDB {
  return {
    id: profile.id,
    name: profile.name,
    bio: profile.bio,
    age: profile.age,
    gender: profile.gender,
    profile_image: profile.profileImage,
    created_at: profile.createdAt,
    updated_at: profile.updatedAt,
  };
}
