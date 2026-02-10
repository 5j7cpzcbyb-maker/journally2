import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// This file handles what you SEE on the screen

export default function App() {
  const [currentPage, setCurrentPage] = useState('Daily');

  // Styles for that 60s Retro Feel
  const retroTheme = {
    background: "bg-[#F5E6CA]", // Creamy parchment color
    accent: "text-[#D45D21]",     // Burnt Orange
    primary: "bg-[#3E7C7D]",    // Deep Teal
    font: "'Lobster', cursive"  // Retro script font
  };

  return (
    <div className={`min-h-screen ${retroTheme.background} text-gray-800`}>
      {/* 1. TOP TITLE: JOURNALLY */}
      <header className="pt-10 pb-6 text-center">
        <h1 className={`text-6xl ${retroTheme.accent}`} style={{ fontFamily: retroTheme.font }}>
          Journally
        </h1>
        <p className="mt-2 text-lg italic">Welcome, [Name]</p>
      </header>

      {/* 2. THE MAIN CONTENT AREA */}
      <main className="px-4 pb-32">
        <AnimatePresence mode="wait">
          {currentPage === 'Daily' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {/* Daily Goals List would go here */}
              <div className="bg-white p-6 rounded-2xl shadow-xl border-t-8 border-[#D45D21]">
                <h3 className="text-xl font-bold mb-4">Today's Habits</h3>
                <button className="w-full py-3 bg-[#3E7C7D] text-white rounded-lg font-bold">
                  + Add New Goal
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* 3. BOTTOM NAVIGATION BAR */}
      <nav className="fixed bottom-0 w-full bg-white border-t-2 border-gray-200 flex justify-around items-center h-20 px-4">
        <button onClick={() => setCurrentPage('Summary')} className="text-gray-500">Summary</button>
        
        {/* The BIG middle button */}
        <button 
          onClick={() => setCurrentPage('Daily')}
          className="bg-[#D45D21] text-white w-20 h-20 rounded-full -translate-y-6 border-8 border-[#F5E6CA] shadow-2xl flex items-center justify-center font-bold text-lg"
        >
          Daily
        </button>

        <button onClick={() => setCurrentPage('Circles')} className="text-gray-500">Circles</button>
      </nav>
    </div>
  );
}
