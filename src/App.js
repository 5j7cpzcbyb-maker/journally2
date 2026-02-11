import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from './supabaseClient';
import DailyPage from './DailyPage';
import Auth from './Auth'; // Import the new Auth component

export default function App() {
  const [currentPage, setCurrentPage] = useState('Daily');
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const retroTheme = {
    background: "bg-[#F5E6CA]",
    accent: "text-[#D45D21]",
    font: "'Lobster', cursive"
  };

  // IF NOT LOGGED IN: Show only the Auth screen
  if (!user) {
    return (
      <div className={`min-h-screen ${retroTheme.background} p-4`}>
        <h1 className={`text-6xl text-center pt-20 ${retroTheme.accent}`} style={{ fontFamily: retroTheme.font }}>
          Journally
        </h1>
        <Auth />
      </div>
    );
  }

  // IF LOGGED IN: Show the main app
  return (
    <div className={`min-h-screen ${retroTheme.background} text-gray-800`}>
      <header className="pt-10 pb-6 text-center">
        <h1 className={`text-6xl ${retroTheme.accent}`} style={{ fontFamily: retroTheme.font }}>
          Journally
        </h1>
        <div className="flex justify-center items-center gap-4 mt-2">
          <p className="text-lg italic">Welcome, {user?.user_metadata?.first_name}</p>
          <button 
            onClick={() => supabase.auth.signOut()}
            className="text-xs bg-gray-200 px-2 py-1 rounded hover:bg-gray-300"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="px-4 pb-32">
        <AnimatePresence mode="wait">
          {currentPage === 'Daily' && (
            <motion.div key="daily" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <DailyPage userId={user.id} />
            </motion.div>
          )}
          {/* Add Summary and Circles components here later */}
        </AnimatePresence>
      </main>

      <nav className="fixed bottom-0 w-full bg-white border-t-2 border-gray-200 flex justify-around items-center h-20 px-4">
        <button onClick={() => setCurrentPage('Summary')}>Summary</button>
        <button 
          onClick={() => setCurrentPage('Daily')}
          className="bg-[#D45D21] text-white w-20 h-20 rounded-full -translate-y-6 border-8 border-[#F5E6CA] shadow-2xl flex items-center justify-center font-bold"
        >
          Daily
        </button>
        <button onClick={() => setCurrentPage('Circles')}>Circles</button>
      </nav>
    </div>
  );
}
