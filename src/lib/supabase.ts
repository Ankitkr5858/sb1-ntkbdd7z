import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Function to fetch cities
export async function fetchCities() {
  try {
    const { data, error } = await supabase
      .from('cities')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching cities:', error);
    throw error;
  }
}

// Function to fetch user's rides
export async function fetchUserRides() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('rides')
      .select(`
        *,
        cities (
          name,
          state
        )
      `)
      .eq('user_id', user.id)
      .order('scheduled_time', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching rides:', error);
    throw error;
  }
}