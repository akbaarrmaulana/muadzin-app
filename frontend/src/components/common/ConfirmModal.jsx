import useScheduleStore from '../../store/useScheduleStore';

export default function ConfirmModal() {
  const { modalConfig, confirmClaim, cancelClaim } = useScheduleStore();

  if (!modalConfig.isOpen || !modalConfig.pendingData) return null;

  const { scheduleId, userId, oldMuadzin } = modalConfig.pendingData;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 transform transition-all scale-100">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        
        <h3 className="text-xl font-bold text-gray-900 mb-2">Gantikan Jadwal?</h3>
        <p className="text-gray-600 mb-6 leading-relaxed">
          Jadwal ini sudah diambil oleh <span className="font-bold text-gray-800">{oldMuadzin}</span>. 
          Apakah Anda yakin ingin menggantikannya dengan akun Anda?
        </p>
        
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={cancelClaim}
            className="px-4 py-3 text-sm font-bold text-gray-500 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
          >
            Batal
          </button>
          <button 
            onClick={() => confirmClaim(scheduleId, userId)}
            className="px-4 py-3 text-sm font-bold text-white bg-red-600 rounded-xl hover:bg-red-700 shadow-lg shadow-red-200 transition-all"
          >
            Ya, Gantikan
          </button>
        </div>
      </div>
    </div>
  );
}
