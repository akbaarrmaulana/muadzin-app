import { create } from 'zustand';
import { supabase } from '../lib/supabaseClient';

const useAuthStore = create((set) => ({
  user: null,
  session: null,
  loading: true,

  setUser: (user) => set({ user }),
  setSession: (session) => set({ session }),
  setLoading: (loading) => set({ loading }),

  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    
    // Ambil nama dari tabel muadzins sebagai cadangan
    const { data: profile } = await supabase.from('muadzins').select('name').eq('id', data.user.id).single();
    if (profile) {
      data.user.user_metadata = { ...data.user.user_metadata, name: profile.name };
    }

    set({ user: data.user, session: data.session });
    return data.user;
  },

  signUp: async (email, password, name) => {
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        data: { name: name }
      }
    });
    
    if (error) throw error;

    const user = data.user;
    if (user) {
      // 2. Insert data ke tabel muadzins (termasuk email)
      const { error: dbError } = await supabase.from('muadzins').insert([
        { id: user.id, name: name, email: email }
      ]);
      if (dbError) throw dbError;
    }
    
    set({ user: data.user, session: data.session });
    return user;
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    set({ user: null, session: null });
  },
}));

export default useAuthStore;
