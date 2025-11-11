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
