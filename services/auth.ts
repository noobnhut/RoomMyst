import { User } from '@supabase/supabase-js';
import { supabase } from './supabase';
import { UserProfile } from '../types';

/**
 * AUTHENTICATION SERVICES
 * Separated from main supabase.ts to allow lazy loading of auth logic
 */

export const signUpWithEmail = async (email: string, password: string, fullname: string, encryptedApiKey: string) => {
  if (!supabase) throw new Error("Supabase not configured");

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullname,
        apikey: encryptedApiKey
      }
    }
  });

  if (error) throw error;
  return data;
};

export const signInWithEmail = async (email: string, password: string) => {
  if (!supabase) throw new Error("Supabase not configured");

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) throw error;
  return data;
};

export const signOut = async () => {
  if (!supabase) return;
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

/**
 * USER PROFILE SYNCHRONIZATION
 * Checks if user exists in 'users' table. If not, creates them.
 */
export const syncUserProfile = async (authUser: User): Promise<UserProfile> => {
  if (!supabase) throw new Error("Supabase not configured");

  // Construct default profile from auth metadata
  const fallbackProfile: UserProfile = {
    id: authUser.id,
    fullname: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'Creator',
    avatar: authUser.user_metadata?.avatar_url || '',
    apikey: authUser.user_metadata?.apikey || '' 
  };

  try {
    // 1. Check if user profile exists
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "Row not found"
      // If table doesn't exist (42P01) or other error, return fallback
      return fallbackProfile; 
    }

    if (existingUser) {
      return existingUser as UserProfile;
    }

    // 2. If not exists, insert new user
    const { data: insertedUser, error: insertError } = await supabase
      .from('users')
      .insert([fallbackProfile])
      .select()
      .single();

    if (insertError) {
      console.error("Error creating user profile in DB:", insertError);
      return fallbackProfile;
    }

    return insertedUser as UserProfile;

  } catch (e) {
    console.error("Unexpected error in syncUserProfile:", e);
    return fallbackProfile;
  }
};
