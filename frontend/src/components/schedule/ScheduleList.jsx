import { useEffect } from 'react';
import useScheduleStore from '../../store/useScheduleStore';
import ScheduleCard from './ScheduleCard';

export default function ScheduleList() {
  const { selectedDate, schedules, fetchSchedules, loading } = useScheduleStore();
  
  useEffect(() => {
    fetchSchedules(selectedDate);
  }, [selectedDate, fetchSchedules]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (schedules.length === 0) {
    return (
      <div className="flex-1 p-6 flex flex-col items-center justify-center text-center">
        <div className="text-gray-300 mb-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <p className="text-gray-500 font-medium">Belum ada jadwal untuk tanggal ini.<br/><span className="text-xs text-gray-400">(Pastikan tabel 'schedules' di Supabase sudah terisi data)</span></p>
      </div>
    );
  }

  // Urutan shalat yang diinginkan
  const prayerOrder = ['Subuh', 'Dhuhur', 'Ashar', 'Maghrib', 'Isya'];

  // Mengambil tanggal Hijriyah langsung dari database
  const hijriDate = schedules[0]?.hijri_date || "Tanggal Hijriyah";

  return (
    <div className="flex-1 p-4 overflow-y-auto pb-20">
      <div className="text-center mb-4 pb-2 border-b border-gray-200">
        <h3 className="text-lg font-bold text-green-700">{hijriDate}</h3>
        <p className="text-xs text-gray-400">Penanggalan Hijriyah</p>
      </div>
      
      <div className="space-y-3">
        {prayerOrder.map(prayerName => {
        // Cari data jadwal untuk shalat ini
        const scheduleData = schedules.find(s => s.prayer_time === prayerName);
        if (!scheduleData) return null;
        
        return (
          <ScheduleCard 
            key={scheduleData.id} 
            prayer={prayerName} 
            data={scheduleData}
          />
        );
      })}
      </div>
    </div>
  );
}
