import useAuthStore from '../../store/useAuthStore';

export default function Header() {
  const { signOut, user } = useAuthStore();

  const handleLogout = async () => {
    if (window.confirm("Apakah Anda yakin ingin keluar?")) {
      await signOut();
    }
  };

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-gray-100/50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-mosque-500 to-mosque-700 rounded-xl flex items-center justify-center shadow-lg shadow-mosque-500/20">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div>
            <h1 className="text-l font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-mosque-700 to-mosque-500 tracking-tight">Muadzin Masjid Thaybah</h1>
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest -mt-1">Scheduler</p>
          </div>
        </div>

        {user && (
          <div className="flex items-center space-x-2">
            <button 
              onClick={handleLogout}
              className="flex items-center space-x-2 px-3 py-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100"
              title="Logout"
            >
              <span className="text-xs font-bold uppercase tracking-wider">Keluar</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
