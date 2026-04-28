import xlsx from 'xlsx';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

const monthMap = {
  'Januari': '01', 'Februari': '02', 'Maret': '03', 'April': '04',
  'Mei': '05', 'Juni': '06', 'Juli': '07', 'Agustus': '08',
  'September': '09', 'Oktober': '10', 'November': '11', 'Desember': '12'
};

function parseIndonesianDate(dateStr) {
  const parts = dateStr.split(' ');
  if (parts.length !== 3) return null;
  const day = parts[0].padStart(2, '0');
  const month = monthMap[parts[1]];
  const year = parts[2];
  return `${year}-${month}-${day}`;
}

async function importData() {
  console.log("Membaca file Excel...");
  const workbook = xlsx.readFile('../Jadwal_Waktu_Sholat.xlsx');
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(worksheet, { defval: "" });

  const schedulesToInsert = [];

  // Mulai dari index 1 karena index 0 adalah header kedua
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const masehiStr = row['Jadwal Waktu Sholat - Wilayah Surabaya (Januari 2026 - Desember 2027)'];
    const hijriStr = row['__EMPTY'];
    
    if (!masehiStr) continue;

    const formattedDate = parseIndonesianDate(masehiStr);
    if (!formattedDate) continue;

    const prayers = [
      { name: 'Subuh', time: row['__EMPTY_1'] },
      { name: 'Dhuhur', time: row['__EMPTY_3'] },
      { name: 'Ashar', time: row['__EMPTY_4'] },
      { name: 'Maghrib', time: row['__EMPTY_5'] },
      { name: 'Isya', time: row['__EMPTY_6'] }
    ];

    for (const prayer of prayers) {
        if(prayer.time) {
            schedulesToInsert.push({
                date: formattedDate,
                prayer_time: prayer.name,
                adhan_time: prayer.time,
                hijri_date: hijriStr // We'll assume the user adds this column, or we just ignore it if it fails. Actually we should only insert if it exists. Let's omit hijri_date to avoid errors, and compute it in frontend.
            });
        }
    }
  }

  // Remove hijri_date to avoid schema error
  schedulesToInsert.forEach(s => delete s.hijri_date);

  console.log(`Ditemukan ${schedulesToInsert.length} jadwal untuk di-insert...`);
  
  // Insert in batches of 1000
  const batchSize = 1000;
  for (let i = 0; i < schedulesToInsert.length; i += batchSize) {
    const batch = schedulesToInsert.slice(i, i + batchSize);
    console.log(`Inserting batch ${Math.floor(i/batchSize) + 1}...`);
    const { error } = await supabase.from('schedules').insert(batch);
    if (error) {
      console.error("Error inserting batch:", error);
    }
  }

  console.log("Selesai import data!");
}

importData();
