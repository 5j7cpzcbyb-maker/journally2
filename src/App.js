import React, { useState, useEffect } from 'react'; // Added useEffect
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from './supabaseClient'; // We need this to check login status
import DailyPage from './DailyPage';

export default function App() {
  const [currentPage, setCurrentPage] = useState('Daily');
  const [user, setUser] = useState(null); // This holds the logged-in user info

  // This "Watcher" checks if someone is logged in when the app starts
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // This listens for when someone logs in or out
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const retroTheme = {
    background: "bg-[#F5E6CA]",
    accent: "text-[#D45D21]",
    primary: "bg-[#3E7C7D]",
    font: "'Lobster', cursive"
  };

  return (
    <div className={`min-h-screen ${retroTheme.background} text-gray-800`}>
      {/* 1. TOP TITLE */}
      <header className="pt-10 pb-6 text-center">
        <h1 className={`text-6xl ${retroTheme.accent}`} style={{ fontFamily: retroTheme.font }}>
          Journally
        </h1>
        {/* We use the user's name from their metadata if they are logged in */}
        <p className="mt-2 text-lg italic">
          Welcome, {user?.user_metadata?.first_name || 'Friend'}
        </p>
      </header>

      {/* 2. THE MAIN CONTENT AREA */}
      <main className="px-4 pb-32">
        <AnimatePresence mode="wait">
          {currentPage === 'Daily' && (
            <motion.div 
              key="daily" // Added a key for smoother animations
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {/* THE BIG CHANGE: We replaced the static <div> with our new component */}
              <DailyPage userId={user?.id} />
            </motion.div>
          )}

          {/* Placeholder for the other pages */}
          {currentPage === 'Summary' && (
             <motion.div key="summary" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h2 className="text-center text-2xl">Summary Page Coming Soon!</h2>
             </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* 3. BOTTOM NAVIGATION BAR */}
      <nav className="fixed bottom-0 w-full bg-white border-t-2 border-gray-200 flex justify-around items-center h-20 px-4">
        <button 
          onClick={() => setCurrentPage('Summary')} 
          className={currentPage === 'Summary' ? 'text-[#D45D21] font-bold' : 'text-gray-500'}
        >
          Summary
        </button>
        
        <button 
          onClick={() => setCurrentPage('Daily')}
          className="bg-[#D45D21] text-white w-20 h-20 rounded-full -translate-y-6 border-8 border-[#F5E6CA] shadow-2xl flex items-center justify-center font-bold text-lg"
        >
          Daily
        </button>

        <button 
          onClick={() => setCurrentPage('Circles')} 
          className={currentPage === 'Circles' ? 'text-[#D45D21] font-bold' : 'text-gray-500'}
        >
          Circles
        </button>
      </nav>
    </div>
  );
}
