'use client';

import { useRouter } from 'next/navigation';
import { supabaseClient } from '@/lib/supabase';
import { useEffect, useState } from 'react';

export default function Header() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabaseClient.auth.getUser();
      setUser(user);
    };
    getUser();

    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange((event: string, session: any) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabaseClient.auth.signOut();
    router.push('/login');
  };

  if (!user) return null;

  return (
    <header className="flex justify-between items-center p-4 bg-gray-800 border-b border-gray-700">
      <h1 className="text-xl font-bold">تطبيق المخزون</h1>
      <button
        onClick={handleLogout}
        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
      >
        تسجيل الخروج
      </button>
    </header>
  );
}