import xlsx from 'xlsx';

const workbook = xlsx.readFile('../Jadwal_Waktu_Sholat.xlsx');
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = xlsx.utils.sheet_to_json(worksheet, { defval: "" });

console.log("Row 1 (Data):", data[1]);
