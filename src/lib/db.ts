import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.DB_URL!;
const supabaseKey = process.env.DB_KEY!;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase environment variables missing.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
