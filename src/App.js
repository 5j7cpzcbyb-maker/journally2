import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from './supabaseClient';
import DailyPage from './DailyPage';
import Auth from './Auth'; 
import SummaryPage from './SummaryPage'; // Ensure this is imported!
import CirclesPage from './CirclesPage';

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
          {/* DAILY PAGE LOGIC */}
          {currentPage === 'Daily' && (
            <motion.div 
              key="daily" 
              initial={{ opacity: 0, x: -20 }} 
              animate={{ opacity: 1, x: 0 }} 
              exit={{ opacity: 0, x: 20 }}
            >
              <DailyPage userId={user.id} />
            </motion.div>
          )}

          {/* SUMMARY PAGE LOGIC - This is where the new code goes! */}
          {currentPage === 'Summary' && (
            <motion.div 
              key="summary" 
              initial={{ opacity: 0, x: -20 }} 
              animate={{ opacity: 1, x: 0 }} 
              exit={{ opacity: 0, x: 20 }}
            >
              <SummaryPage userId={user.id} />
            </motion.div>
          )}

          {/* CIRCLES PAGE LOGIC */}
          {currentPage === 'Circles' && (
            <motion.div 
              key="circles" 
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }} 
              exit={{ opacity: 0, x: -20 }}
            >
              <CirclesPage userId={user.id} />
            </motion.div>
          )}
            
        </AnimatePresence>
      </main>

      {/* NAVIGATION */}
      <nav className="fixed bottom-0 w-full bg-white border-t-2 border-gray-200 flex justify-around items-center h-20 px-4">
        <button 
          onClick={() => setCurrentPage('Summary')}
          className={currentPage === 'Summary' ? 'text-[#D45D21] font-bold' : 'text-gray-400'}
        >
          Summary
        </button>
        
        <button 
          onClick={() => setCurrentPage('Daily')}
          className="bg-[#D45D21] text-white w-20 h-20 rounded-full -translate-y-6 border-8 border-[#F5E6CA] shadow-2xl flex items-center justify-center font-bold"
        >
          Daily
        </button>

        <button 
          onClick={() => setCurrentPage('Circles')}
          className={currentPage === 'Circles' ? 'text-[#D45D21] font-bold' : 'text-gray-400'}
        >
          Circles
        </button>
      </nav>
    </div>
  );
}
