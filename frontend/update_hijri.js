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

async function updateHijriData() {
  console.log("Membaca file Excel...");
  const workbook = xlsx.readFile('../Jadwal_Waktu_Sholat.xlsx');
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(worksheet, { defval: "" });

  const dateToHijriMap = {};

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const masehiStr = row['Jadwal Waktu Sholat - Wilayah Surabaya (Januari 2026 - Desember 2027)'];
    const hijriStr = row['__EMPTY'];
    
    if (!masehiStr || !hijriStr) continue;

    const formattedDate = parseIndonesianDate(masehiStr);
    if (formattedDate) {
      dateToHijriMap[formattedDate] = hijriStr;
    }
  }

  console.log(`Ditemukan ${Object.keys(dateToHijriMap).length} tanggal Hijriyah dari Excel.`);
  console.log("Memperbarui database (Supabase)...");

  let updatedCount = 0;
  
  // Update per date to avoid massive API calls if possible
  for (const [date, hijriStr] of Object.entries(dateToHijriMap)) {
      const { error } = await supabase
        .from('schedules')
        .update({ hijri_date: hijriStr })
        .eq('date', date);
        
      if (error) {
          console.error(`Gagal update tanggal ${date}:`, error.message);
      } else {
          updatedCount++;
          if (updatedCount % 50 === 0) {
              console.log(`Progress: ${updatedCount} tanggal diperbarui...`);
          }
      }
  }

  console.log(`Selesai! Berhasil memperbarui ${updatedCount} tanggal.`);
}

updateHijriData();
