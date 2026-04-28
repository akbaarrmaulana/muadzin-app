import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuthStore();
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      await signUp(email, password, name);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full glass-panel rounded-3xl p-8 border border-white/50">
        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 mb-4 bg-white rounded-2xl shadow-sm p-2 overflow-hidden flex items-center justify-center">
            <img src="/logo_takmir.png" alt="Logo Takmir" className="w-full h-full object-contain" />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-800 tracking-tight">Daftar Muadzin</h2>
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-widest mt-1">Buat Akun Baru</p>
        </div>
        
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-6 text-sm border border-red-100 font-medium text-center">{error}</div>}
        
        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Nama Lengkap</label>
            <input 
              type="text" 
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Masukkan nama lengkap"
              className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-mosque-500 focus:border-transparent outline-none transition-all"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Email</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
              className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-mosque-500 focus:border-transparent outline-none transition-all"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-mosque-500 focus:border-transparent outline-none transition-all"
            />
          </div>
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-mosque-600 to-mosque-700 text-white font-bold py-3.5 px-4 rounded-2xl hover:shadow-lg hover:shadow-mosque-500/30 transition-all active:scale-95 disabled:opacity-50 mt-2 shadow-md"
          >
            {isLoading ? 'Sedang Mendaftar...' : 'Daftar Sekarang'}
          </button>
        </form>
        <p className="mt-8 text-center text-sm text-gray-600">
          Sudah punya akun? <Link to="/login" className="text-mosque-600 font-bold hover:underline">Login di sini</Link>
        </p>
      </div>
    </div>
  );
}
