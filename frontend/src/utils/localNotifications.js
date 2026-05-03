import { LocalNotifications } from '@capacitor/local-notifications';

// Helper to convert string UUID to a numeric ID for Capacitor
const stringToId = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
};

export const requestNotificationPermission = async () => {
  try {
    const status = await LocalNotifications.checkPermissions();
    if (status.display === 'granted') return true;
    
    const permission = await LocalNotifications.requestPermissions();
    return permission.display === 'granted';
  } catch (error) {
    console.error("Error requesting notification permission:", error);
    return false;
  }
};

export const schedulePrayerReminder = async (schedule) => {
  try {
    const { id, date, adhan_time, prayer_time } = schedule;
    
    if (!adhan_time || !date) return;

    // Parse date and time manually to ensure LOCAL time (avoiding UTC issues)
    const [year, m, d] = date.split('-').map(Number);
    const timeString = adhan_time.replace('.', ':'); // Support both : and .
    const [hours, minutes] = timeString.split(':').map(Number);
    
    // Month is 0-indexed in JS Date
    const prayerDate = new Date(year, m - 1, d, hours, minutes, 0);
    
    if (isNaN(prayerDate.getTime())) return;
    
    // Calculate reminder time: 15 minutes before
    const reminderTime = new Date(prayerDate.getTime() - 15 * 60 * 1000);
    
    // Don't schedule if the time is already in the past
    if (reminderTime <= new Date()) return;

    const notificationId = stringToId(id);

    // Create channel for Android 8+ compatibility
    await LocalNotifications.createChannel({
      id: 'muadzin-reminders',
      name: 'Pengingat Muadzin',
      importance: 5,
      description: 'Saluran untuk pengingat jadwal shalat',
      sound: 'beep.wav',
      visibility: 1
    });

    await LocalNotifications.schedule({
      notifications: [
        {
          title: `📢 Pengingat Muadzin: ${prayer_time}`,
          body: `15 menit lagi waktu ${prayer_time} (${adhan_time}). Mari bersiap ke Masjid.`,
          id: notificationId,
          schedule: { at: reminderTime },
          channelId: 'muadzin-reminders',
          actionTypeId: "",
          extra: null
        }
      ]
    });
    
    alert(`Berhasil! Alarm ${prayer_time} dijadwalkan pada jam ${reminderTime.getHours()}:${reminderTime.getMinutes().toString().padStart(2, '0')} (15 menit sebelum adzan).`);
  } catch (error) {
    console.error("Error scheduling notification:", error);
  }
};

export const cancelPrayerReminder = async (id) => {
  try {
    const notificationId = stringToId(id);
    await LocalNotifications.cancel({
      notifications: [{ id: notificationId }]
    });
    console.log(`Notification ${id} cancelled`);
  } catch (error) {
    console.error("Error cancelling notification:", error);
  }
};

export const scheduleTestNotification = async () => {
  try {
    const reminderTime = new Date(new Date().getTime() + 5000); // 5 seconds from now

    await LocalNotifications.schedule({
      notifications: [
        {
          title: "🧪 Pengetesan Notifikasi",
          body: "Berhasil! Ini adalah contoh pengingat yang akan Anda terima 15 menit sebelum adzan.",
          id: 999,
          schedule: { at: reminderTime },
          sound: 'beep.wav',
          actionTypeId: "",
          extra: null
        }
      ]
    });
    
    alert("Tes terjadwal! Silakan tunggu 5 detik...");
  } catch (error) {
    console.error("Error scheduling test notification:", error);
    alert("Gagal mengirim tes: " + error.message);
  }
};
