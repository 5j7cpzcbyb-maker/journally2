import React, { useState, useEffect } from 'react';
import { Plus, ChevronLeft, ChevronRight, CheckCircle, Circle, Trash2 } from 'lucide-react'; // Icons for the buttons
import { getDailyGoals, addGoal, toggleGoalCheck, deleteGoal } from './api';

export default function DailyPage({ userId }) {
  const [goals, setGoals] = useState([]);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());

  // This runs every time the selected date changes
  useEffect(() => {
    loadGoals();
  }, [selectedDate]);

  const loadGoals = async () => {
    const { data } = await getDailyGoals(userId);
    setGoals(data || []);
  };

  const handleAddGoal = async (e) => {
    e.preventDefault();
    if (!newGoalTitle) return;
    await addGoal(userId, newGoalTitle);
    setNewGoalTitle(''); // Clear the input box
    loadGoals(); // Refresh the list
  };

  // Helper to move the date back or forward
  const changeDate = (days) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
  };

  return (
    <div className="max-w-md mx-auto">
      {/* 1. DATE TOGGLE BAR */}
      <div className="flex justify-between items-center bg-white rounded-full p-2 mb-8 shadow-inner border-2 border-[#D45D21]">
        <button onClick={() => changeDate(-1)} className="p-2 hover:bg-orange-50 rounded-full">
          <ChevronLeft className="text-[#D45D21]" />
        </button>
        <span className="font-bold text-lg text-[#3E7C7D]">
          {selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
        </span>
        <button onClick={() => changeDate(1)} className="p-2 hover:bg-orange-50 rounded-full">
          <ChevronRight className="text-[#D45D21]" />
        </button>
      </div>

      {/* 2. ADD GOAL INPUT */}
      <form onSubmit={handleAddGoal} className="mb-8 flex gap-2">
        <input 
          type="text" 
          placeholder="New habit..." 
          value={newGoalTitle}
          onChange={(e) => setNewGoalTitle(e.target.value)}
          className="flex-1 p-4 rounded-xl border-2 border-[#3E7C7D] focus:outline-none focus:ring-2 ring-[#D45D21] bg-white/50"
        />
        <button type="submit" className="bg-[#D45D21] text-white p-4 rounded-xl shadow-lg hover:scale-105 transition-transform">
          <Plus />
        </button>
      </form>

      {/* 3. GOAL LIST */}
      <div className="space-y-4">
        {goals.map((goal) => (
          <div 
            key={goal.id} 
            className="flex items-center justify-between bg-[#3E7C7D] text-white p-5 rounded-2xl shadow-lg transform transition-all active:scale-95"
          >
            <div className="flex items-center gap-4">
              {/* Checkbox Logic */}
              <button onClick={() => toggleGoalCheck(userId, goal.id, selectedDate.toISOString().split('T')[0])}>
                {/* We'll add real 'completed' logic here in the next step! */}
                <Circle className="w-8 h-8 opacity-80" />
              </button>
              <span className="text-xl font-medium">{goal.title}</span>
            </div>
            
            {/* Delete Button (Soft Delete) */}
            <button onClick={() => deleteGoal(goal.id)} className="text-orange-200 hover:text-white">
              <Trash2 size={20} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
