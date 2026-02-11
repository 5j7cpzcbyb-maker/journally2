import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutGrid, CheckCircle2, Users2 } from 'lucide-react'; // Icons for the new nav
import { supabase } from './supabaseClient';
import DailyPage from './DailyPage';
import Auth from './Auth'; 
import SummaryPage from './SummaryPage';
import CirclesPage from './CirclesPage';
import SettingsPage from './SettingsPage';

export default function App() {
  const [currentPage, setCurrentPage] = useState('Daily');
  const [user, setUser] = useState(null);
  const [showMenu, setShowMenu] = useState(false);

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

  // Define navigation items for the professional bar
  const navItems = [
    { id: 'Summary', label: 'Summary', icon: LayoutGrid },
    { id: 'Daily', label: 'Daily', icon: CheckCircle2, isCenter: true },
    { id: 'Circles', label: 'Circles', icon: Users2 },
  ];

  return (
    <div className={`min-h-screen ${retroTheme.background} text-gray-800`}>
      <header className="pt-10 pb-6 text-center relative px-6">
        <h1 className={`text-6xl ${retroTheme.accent}`} style={{ fontFamily: retroTheme.font }}>
          Journally
        </h1>
        
        {/* HAMBURGER BUTTON */}
        <button 
          onClick={() => setShowMenu(!showMenu)} 
          className="absolute right-6 top-12 text-[#3E7C7D] hover:scale-110 transition-transform"
        >
          <div className="space-y-1">
            <div className="w-8 h-1 bg-[#3E7C7D] rounded"></div>
            <div className="w-8 h-1 bg-[#3E7C7D] rounded"></div>
            <div className="w-8 h-1 bg-[#3E7C7D] rounded"></div>
          </div>
        </button>

        <p className="mt-2 text-lg italic">Welcome, {user?.user_metadata?.first_name}</p>

        {/* FLOATING MENU POP-OVER */}
        {showMenu && (
          <div className="absolute top-24 right-6 bg-white shadow-2xl rounded-2xl p-4 z-50 border-2 border-[#D45D21] w-40">
            <button 
              onClick={() => { setCurrentPage('Settings'); setShowMenu(false); }} 
              className="block w-full text-left p-2 hover:bg-orange-50 rounded font-bold text-[#3E7C7D]"
            >
              Settings
            </button>
            <hr className="my-2" />
            <button 
              onClick={() => supabase.auth.signOut()} 
              className="block w-full text-left p-2 text-red-500 hover:bg-red-50 rounded"
            >
              Logout
            </button>
          </div>
        )}
      </header>

      {/* Added more bottom padding (pb-40) so content doesn't get hidden by the floating bar */}
      <main className="px-4 pb-40">
        <AnimatePresence mode="wait">
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

          {currentPage === 'Settings' && (
            <motion.div 
              key="settings" 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -20 }}
            >
              <SettingsPage userId={user.id} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* MODERN FLOATING NAVIGATION */}
      <div className="fixed bottom-6 left-0 right-0 px-4 z-50">
        <nav className="max-w-md mx-auto bg-white/90 backdrop-blur-md border border-white/20 shadow-2xl rounded-[2.5rem] flex items-center justify-around p-2 h-20">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;

            if (item.isCenter) {
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id)}
                  className="relative -top-8 bg-[#D45D21] text-white p-5 rounded-full shadow-[0_10px_25px_rgba(212,93,33,0.5)] hover:scale-110 active:scale-95 transition-all duration-300 border-4 border-[#F5E6CA]"
                >
                  <Icon size={32} strokeWidth={2.5} />
                </button>
              );
            }

            return (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`flex flex-col items-center gap-1 px-6 transition-all duration-300 ${
                  isActive ? 'text-[#3E7C7D] scale-110' : 'text-gray-400 hover:text-[#3E7C7D]'
                }`}
              >
                <Icon size={24} strokeWidth={isActive ? 3 : 2} />
                <span className="text-[10px] font-bold uppercase tracking-widest">
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
