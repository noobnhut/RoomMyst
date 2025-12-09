import { supabase } from './supabase';
import { GeneratedContent, DatabaseItem } from '../types';

/**
 * CONTENT REPOSITORY SERVICES
 * Separated to ensure content logic is only loaded when needed (e.g. Dashboard)
 */

export const saveContent = async (topic: string, content: GeneratedContent): Promise<any> => {
  if (!supabase) {
    throw new Error("Supabase is not configured. Please add SUPABASE_URL and SUPABASE_KEY to your environment.");
  }

  // Get current user to attach ownership
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error("User must be logged in to save content.");

  const { data, error } = await supabase
    .from('generated_content')
    .insert([
      { 
        topic: topic, 
        data: content,
        user_id: user.id
      }
    ])
    .select();

  if (error) {
    console.error("Supabase Save Error:", JSON.stringify(error, null, 2));
    throw new Error(error.message || "Database insert failed");
  }
  return data;
};

export const updateContent = async (id: number, content: GeneratedContent): Promise<void> => {
  if (!supabase) throw new Error("Supabase is not configured.");

  const { error } = await supabase
    .from('generated_content')
    .update({ data: content })
    .eq('id', id);

  if (error) {
    console.error("Update Error:", error);
    throw new Error(error.message || "Failed to update item");
  }
};

export const deleteContent = async (id: number): Promise<void> => {
  if (!supabase) throw new Error("Supabase is not configured.");

  const { error } = await supabase
    .from('generated_content')
    .delete()
    .eq('id', id);

  if (error) {
    console.error("Delete Error:", error);
    throw new Error(error.message || "Failed to delete item");
  }
};

export const getSavedContents = async (): Promise<DatabaseItem[]> => {
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const { data, error } = await supabase
    .from('generated_content')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Supabase Fetch Error:", JSON.stringify(error, null, 2));
    throw new Error(error.message || "Failed to fetch history");
  }
  
  return data as DatabaseItem[];
};

export const getContentById = async (id: number): Promise<DatabaseItem> => {
  if (!supabase) throw new Error("Supabase is not configured.");

  const { data, error } = await supabase
    .from('generated_content')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    throw new Error(error.message || "Failed to fetch article");
  }

  return data as DatabaseItem;
};