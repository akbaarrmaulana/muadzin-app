import { useEffect, useState, useRef } from 'react';
import useScheduleStore from '../../store/useScheduleStore';

export default function DateNavigator() {
  const { selectedDate, setSelectedDate } = useScheduleStore();
  const [days, setDays] = useState([]);
  const dateInputRef = useRef(null);

  // Fungsi untuk menghasilkan 7 hari di sekitar tanggal yang dipilih
  useEffect(() => {
    const generateDays = (centerDate) => {
      const dates = [];
      const baseDate = new Date(centerDate);
      
      // Ambil 3 hari sebelum dan 3 hari sesudah selectedDate
      for (let i = -3; i <= 3; i++) {
        const d = new Date(baseDate);
        d.setDate(baseDate.getDate() + i);
        dates.push(d.toISOString().split('T')[0]);
      }
      return dates;
    };

    setDays(generateDays(selectedDate));
  }, [selectedDate]);

  const formatDayName = (dateStr) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('id-ID', { weekday: 'short' }).format(date);
  };

  const formatDayNumber = (dateStr) => {
    const date = new Date(dateStr);
    return date.getDate();
  };

  const handleCalendarClick = () => {
    // Memaksa browser membuka pemilih tanggal
    if (dateInputRef.current) {
      dateInputRef.current.showPicker();
    }
  };

  return (
    <div className="flex items-center glass-panel sticky top-[64px] z-40 my-4 rounded-2xl mx-4 lg:mx-0 shadow-sm border border-white/60">
      <div className="flex-1 overflow-x-auto flex space-x-3 p-3 scrollbar-hide" style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
        {days.map((date) => {
          const isActive = date === selectedDate;
          return (
            <button
              key={date}
              onClick={() => setSelectedDate(date)}
              className={`flex flex-col items-center justify-center min-w-[4rem] p-2.5 rounded-2xl transition-all duration-300 ${
                isActive 
                  ? 'bg-gradient-to-br from-mosque-500 to-mosque-700 text-white shadow-lg shadow-mosque-500/30 scale-105' 
                  : 'bg-white/50 text-gray-600 hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-100'
              }`}
            >
              <span className={`text-[10px] uppercase font-bold tracking-wider ${isActive ? 'text-mosque-100' : 'text-gray-400'}`}>
                {formatDayName(date)}
              </span>
              <span className={`text-xl font-extrabold mt-0.5 ${isActive ? 'text-white' : 'text-gray-800'}`}>
                {formatDayNumber(date)}
              </span>
            </button>
          );
        })}
      </div>
      
      <div className="px-4 border-l border-gray-200/50 flex items-center justify-center">
        <button 
          onClick={handleCalendarClick}
          className="p-3 text-mosque-600 hover:text-white hover:bg-mosque-500 rounded-xl transition-all bg-mosque-50 shadow-sm relative"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <input 
            ref={dateInputRef}
            type="date" 
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full invisible"
          />
        </button>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}} />
    </div>
  );
}
