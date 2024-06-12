import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

export const getPoems = async () => {
  const { data, error } = await supabase.from('poems').select('*');

  if (error) {
    throw error;
  }

  return data;
}
