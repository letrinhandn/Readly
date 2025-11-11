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
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('No authenticated user');

        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        if (data) return data as UserProfile;
      } catch {
        const stored = await AsyncStorage.getItem(USER_PROFILE_KEY);
        if (stored) return JSON.parse(stored) as UserProfile;
      }
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
  });

  const saveProfileM = useMutation({
    mutationFn: async (profile: UserProfile) => {
      try {
        const { error } = await supabase.from('user_profiles').upsert(profile);
        if (error) throw error;
      } catch {
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
