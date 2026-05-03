import { create } from 'zustand';
import { supabase } from '../lib/supabaseClient';
import { getTodayStr } from '../utils/dateUtils';
import { schedulePrayerReminder, cancelPrayerReminder } from '../utils/localNotifications';

const useScheduleStore = create((set, get) => ({
  schedules: [],
  loading: false,
  selectedDate: getTodayStr(),
  
  modalConfig: {
    isOpen: false,
    pendingData: null,
  },

  setSelectedDate: (date) => {
    set({ selectedDate: date });
    get().fetchSchedules(date);
  },

  // Ambil data jadwal dari Supabase berdasarkan tanggal
  fetchSchedules: async (date) => {
    set({ loading: true });
    const { data, error } = await supabase
      .from('schedules')
      .select(`
        *,
        muadzins (name)
      `)
      .eq('date', date);

    if (error) {
      console.error("Error fetching schedules:", error);
    } else {
      set({ schedules: data || [] });
      
      // Auto-sync notifications with a small delay for stability
      setTimeout(() => {
        try {
          const authData = localStorage.getItem('auth-storage');
          if (authData && data) {
            const parsed = JSON.parse(authData);
            const userId = parsed.state?.user?.id;
            if (userId) {
              data.forEach(s => {
                if (s.muadzin_id === userId) {
                  schedulePrayerReminder(s);
                }
              });
            }
          }
        } catch (e) {
          console.error("Auto-sync error:", e);
        }
      }, 500);
    }
    set({ loading: false });
  },

  // Fungsi untuk mengambil slot jadwal (Otomatis pakai User ID)
  claimSchedule: async (scheduleId, userId) => {
    const { data: existing } = await supabase
      .from('schedules')
      .select('muadzin_id, muadzins(name)')
      .eq('id', scheduleId)
      .single();

    if (existing?.muadzin_id && existing.muadzin_id !== userId) {
      // Jika sudah diisi orang lain, buka modal konfirmasi
      set({
        modalConfig: {
          isOpen: true,
          pendingData: { scheduleId, userId, oldMuadzin: existing.muadzins.name }
        }
      });
    } else {
      // Jika kosong atau milik sendiri, langsung update
      await get().confirmClaim(scheduleId, userId);
    }
  },

  confirmClaim: async (scheduleId, userId) => {
    const { error } = await supabase
      .from('schedules')
      .update({ muadzin_id: userId })
      .eq('id', scheduleId);

    if (error) {
      alert("Gagal mengambil jadwal: " + error.message);
    } else {
      // Schedule notification
      const schedule = get().schedules.find(s => s.id === scheduleId);
      if (schedule) {
        await schedulePrayerReminder(schedule);
      }

      set({ modalConfig: { isOpen: false, pendingData: null } });
      get().fetchSchedules(get().selectedDate);
    }
  },

  // Fungsi untuk membatalkan jadwal milik sendiri
  unclaimSchedule: async (scheduleId) => {
    const { error } = await supabase
      .from('schedules')
      .update({ muadzin_id: null })
      .eq('id', scheduleId);

    if (error) {
      alert("Gagal membatalkan jadwal: " + error.message);
    } else {
      // Cancel scheduled notification
      await cancelPrayerReminder(scheduleId);

      get().fetchSchedules(get().selectedDate);
    }
  },

  cancelClaim: () => {
    set({ modalConfig: { isOpen: false, pendingData: null } });
  }
}));

export default useScheduleStore;
