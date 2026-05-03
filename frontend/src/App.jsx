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
        </div>
        <DateNavigator />
        <ScheduleList />
        <ConfirmModal />
      </div>
    </Layout>
  );
};

import { requestNotificationPermission } from './utils/localNotifications';

function App() {
  const { setUser, setSession, setLoading } = useAuthStore();

  useEffect(() => {
    // Request notification permissions
    const checkPermissions = async () => {
      const granted = await requestNotificationPermission();
      console.log("Notification permission granted:", granted);
    };
    checkPermissions();

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
