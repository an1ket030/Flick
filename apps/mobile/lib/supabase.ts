import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://toykeccxzlhvuayeljlb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRveWtlY2N4emx0aHZ1YXllbGpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3NjIxNzUsImV4cCI6MjA5MTMzODE3NX0.typeJwM3iqtTNW0_mm_DjtRZG0xdqb9blrK3UPqHgnA';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
