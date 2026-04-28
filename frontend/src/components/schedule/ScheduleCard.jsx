import useScheduleStore from '../../store/useScheduleStore';
import useAuthStore from '../../store/useAuthStore';

export default function ScheduleCard({ prayer, data }) {
  const { user } = useAuthStore();
  const { claimSchedule, unclaimSchedule } = useScheduleStore();
  
  const muadzinName = data.muadzins?.name;
  const isMine = data.muadzin_id === user?.id;

  const handleClaim = () => {
    if (!user) return alert("Silakan login terlebih dahulu");
    claimSchedule(data.id, user.id);
  };

  return (
    <div className={`glass-card rounded-2xl p-5 relative overflow-hidden group ${isMine ? 'ring-2 ring-mosque-500 bg-gradient-to-br from-white to-mosque-50/50' : ''}`}>
      {/* Decorative gradient blob */}
      <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full blur-2xl transition-opacity duration-500 ${isMine ? 'bg-mosque-200/50 opacity-100' : 'bg-gray-200/30 opacity-0 group-hover:opacity-100'}`}></div>

      <div className="relative z-10">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-3">
            <div className={`w-2 h-8 rounded-full ${isMine ? 'bg-mosque-500' : 'bg-gray-200'}`}></div>
            <h3 className="font-extrabold text-gray-800 text-xl tracking-tight">{prayer}</h3>
            {isMine && <span className="text-[10px] bg-mosque-500 text-white px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider shadow-sm shadow-mosque-500/30">Milik Anda</span>}
          </div>
          <div className="bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-gray-100 shadow-sm">
            <span className="text-mosque-700 font-bold text-lg font-mono tracking-tighter">{data.adhan_time.slice(0,5)}</span>
          </div>
        </div>

        <div className="mt-2">
          {muadzinName ? (
            <div className="flex items-center justify-between bg-white/60 rounded-xl p-3 border border-gray-50">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm ${isMine ? 'bg-gradient-to-br from-mosque-100 to-mosque-200' : 'bg-gray-100'}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${isMine ? 'text-mosque-600' : 'text-gray-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Petugas Muadzin</p>
                  <p className={`font-bold ${isMine ? 'text-mosque-700' : 'text-gray-700'}`}>{muadzinName}</p>
                </div>
              </div>
              {isMine ? (
                <button 
                  onClick={() => unclaimSchedule(data.id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors border border-transparent hover:border-red-100"
                  title="Batalkan"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              ) : (
                <button 
                  onClick={handleClaim}
                  className="text-xs font-bold text-mosque-600 hover:text-white hover:bg-mosque-500 px-4 py-2 rounded-xl border border-mosque-200 transition-all shadow-sm"
                >
                  Gantikan
                </button>
              )}
            </div>
          ) : (
            <button 
              onClick={handleClaim}
              className="w-full group/btn py-4 border-2 border-dashed border-gray-200 rounded-xl hover:border-mosque-400 hover:bg-mosque-50 transition-all flex flex-col items-center justify-center space-y-1"
            >
              <div className="w-8 h-8 rounded-full bg-gray-50 group-hover/btn:bg-mosque-100 flex items-center justify-center transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 group-hover/btn:text-mosque-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <span className="text-sm font-bold text-gray-400 group-hover/btn:text-mosque-600 transition-colors">Ambil Jadwal</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
