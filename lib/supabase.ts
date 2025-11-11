import Constants from 'expo-constants';
import { createClient } from '@supabase/supabase-js';

const getEnv = (key: string) => {
  // prefer process.env, fallback to Expo constants if available
  // NOTE: ensure you expose env vars via app.config or eas build if needed
  // try common names used in .env
  return (
    (process.env as any)[key] ||
    (process.env as any)[`REACT_APP_${key}`] ||
    (process.env as any)[`EXPO_${key}`] ||
    // @ts-ignore
    Constants.expoConfig?.extra?.[key] ||
    (process.env as any)[key]
  );
};

const SUPABASE_URL = getEnv('SUPABASE_URL') || getEnv('SUPABASE_PUBLIC_URL') || '';
const SUPABASE_ANON_KEY = getEnv('SUPABASE_ANON_KEY') || getEnv('SUPABASE_PUBLIC_ANON_KEY') || '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('Supabase URL or ANON key missing. Using placeholder values.');
}

export const supabase = createClient(
  SUPABASE_URL || 'https://placeholder.supabase.co',
  SUPABASE_ANON_KEY || 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);

export default supabase;
