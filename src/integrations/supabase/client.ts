// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://cmoptdsyxddjbfmpcbwd.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtb3B0ZHN5eGRkamJmbXBjYndkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQwMjc3NzcsImV4cCI6MjA1OTYwMzc3N30.D6OYkVG-6yhN6i2wtITQ0OWMFKc8Jdekax36p9uKqjo";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);