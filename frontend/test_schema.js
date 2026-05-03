import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function testUpdate() {
  const { data, error } = await supabase
    .from('schedules')
    .update({ hijri_date: 'Test' })
    .eq('id', 'non_existent_id') // We don't want to actually update, just test schema
    .select();

  if (error) {
    console.log("SCHEMA ERROR:", error.message);
  } else {
    console.log("SUCCESS: Column exists.");
  }
}

testUpdate();
