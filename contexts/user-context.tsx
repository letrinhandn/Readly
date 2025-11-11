import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import supabase from '@/lib/supabase';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import { UserProfile } from '@/types/user';

const USER_PROFILE_KEY = 'readly_user_profile';

export const [UserProvider, useUser] = createContextHook(() => {
  const queryClient = useQueryClient();

  const profileQuery = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          console.log('Auth error getting user:', userError.message);
          throw userError;
        }
        
        if (!user) {
          console.log('No authenticated user found');
          throw new Error('No authenticated user');
        }

        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          console.log('Error fetching profile from Supabase:', error.message);
          throw error;
        }
        
        if (data) {
          console.log('Profile loaded from Supabase:', data.name);
          return data as UserProfile;
        }
      } catch (err) {
        console.log('Failed to load from Supabase, trying AsyncStorage:', err);
        const stored = await AsyncStorage.getItem(USER_PROFILE_KEY);
        if (stored) {
          console.log('Profile loaded from AsyncStorage');
          return JSON.parse(stored) as UserProfile;
        }
      }
      
      console.log('Using default profile');
      const defaultProfile: UserProfile = {
        id: Date.now().toString(),
        name: 'Reading Enthusiast',
        bio: 'Keep up the great reading habit!',
        profileImage: undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return defaultProfile;
    },
    retry: 1,
    retryDelay: 500,
  });

  const saveProfileM = useMutation({
    mutationFn: async (profile: UserProfile) => {
      try {
        const { error } = await supabase.from('user_profiles').upsert(profile);
        if (error) {
          console.log('Error saving to Supabase:', error.message);
          throw error;
        }
        console.log('Profile saved to Supabase successfully');
      } catch (err) {
        console.log('Saving to AsyncStorage instead:', err);
        await AsyncStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile));
      }
      return profile;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    },
  });
  const { mutate: saveProfile } = saveProfileM;

  const updateProfile = useCallback((updates: Partial<UserProfile>) => {
    const currentProfile = profileQuery.data;
    if (!currentProfile) return;

    const updatedProfile: UserProfile = {
      ...currentProfile,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    saveProfile(updatedProfile);
  }, [profileQuery.data, saveProfile]);

  return useMemo(() => ({
    profile: profileQuery.data,
    isLoading: profileQuery.isLoading,
    updateProfile,
    isSaving: saveProfileM.isPending,
  }), [profileQuery.data, profileQuery.isLoading, updateProfile, saveProfileM.isPending]);
});
