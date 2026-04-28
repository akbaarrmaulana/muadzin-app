import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/useAuthStore';
import { supabase } from './lib/supabaseClient';

import Layout from './components/layout/Layout';
import Header from './components/layout/Header';
import DateNavigator from './components/navigation/DateNavigator';
import ScheduleList from './components/schedule/ScheduleList';
import ConfirmModal from './components/common/ConfirmModal';

import Login from './pages/Login';
import Register from './pages/Register';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuthStore();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

import { subscribeUserToPush } from './utils/pushNotification';

const Dashboard = () => {
  const { user } = useAuthStore();

  return (
    <Layout>
      <Header />
      <div className="container mx-auto max-w-2xl px-4 lg:px-0">
        <div className="my-6 glass-panel rounded-2xl p-4 flex justify-between items-center bg-gradient-to-r from-mosque-50 to-white border-mosque-100/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-mosque-100 rounded-full flex items-center justify-center text-mosque-600 font-bold shadow-inner uppercase">
              {(user?.user_metadata?.name || user?.email)?.[0]}
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Ahlan Wa Sahlan,</p>
              <span className="text-sm font-bold text-gray-800">{user?.user_metadata?.name || user?.email}</span>
            </div>
          </div>
          <button
            onClick={() => subscribeUserToPush(user?.id)}
            className="flex items-center space-x-2 bg-gradient-to-r from-mosque-500 to-mosque-600 text-white px-3 py-2 rounded-xl font-bold hover:shadow-lg hover:shadow-mosque-500/30 transition-all active:scale-95 shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="text-xs">Aktifkan Notifikasi</span>
          </button>
        </div>
        <DateNavigator />
        <ScheduleList />
        <ConfirmModal />
      </div>
    </Layout>
  );
};

function App() {
  const { setUser, setSession, setLoading } = useAuthStore();

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const { data: profile } = await supabase.from('muadzins').select('name').eq('id', session.user.id).single();
        if (profile) {
          session.user.user_metadata = { ...session.user.user_metadata, name: profile.name };
        }
      }
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [setUser, setSession, setLoading]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
