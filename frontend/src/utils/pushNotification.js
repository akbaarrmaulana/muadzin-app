const urlB64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');
  
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

export const subscribeUserToPush = async (userId) => {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    alert("Browser tidak mendukung notifikasi push");
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js');
    console.log('Service Worker registered');

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      alert("Izin notifikasi ditolak");
      return;
    }

    const applicationServerKey = urlB64ToUint8Array(import.meta.env.VITE_VAPID_PUBLIC_KEY);
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: applicationServerKey
    });

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    
    const response = await fetch(`${API_URL}/api/v1/push/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userId,
        subscription: subscription
      }),
    });

    if (response.ok) {
      alert("Notifikasi berhasil diaktifkan!");
    } else {
      console.error("Gagal menyimpan subscription di server");
      alert("Gagal mengaktifkan notifikasi di server");
    }
  } catch (error) {
    console.error('Error during subscription:', error);
    alert("Terjadi kesalahan saat mengaktifkan notifikasi");
  }
};
