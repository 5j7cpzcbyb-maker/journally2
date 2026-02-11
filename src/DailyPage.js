import React, { useState, useEffect } from 'react';
import { Plus, ChevronLeft, ChevronRight, CheckCircle, Circle, Trash2 } from 'lucide-react';
import { getDailyGoals, addGoal, toggleGoalCheck, deleteGoal, getGoalLogs } from './api';

export default function DailyPage({ userId }) {
  const [goals, setGoals] = useState([]);
  const [completedGoals, setCompletedGoals] = useState([]); // Tracks which IDs are checked
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Load both the habits and the checkmarks whenever the date changes
  useEffect(() => {
    loadGoals();
  }, [selectedDate, userId]);

  const loadGoals = async () => {
    const dateStr = selectedDate.toISOString().split('T')[0];
    
    // 1. Fetch the habits
    const { data: goalsData } = await getDailyGoals(userId);
    // 2. Fetch all completion logs
    const { data: logsData } = await getGoalLogs(userId);
    
    setGoals(goalsData || []);
    
    // 3. Filter logs to find which goals were finished on THIS specific day
    const doneOnThisDate = logsData
      ?.filter(log => log.completed_at === dateStr)
      .map(log => log.goal_id) || [];
    
    setCompletedGoals(doneOnThisDate);
  };

  const handleAddGoal = async (e) => {
    e.preventDefault();
    if (!newGoalTitle) return;
    await addGoal(userId, newGoalTitle);
    setNewGoalTitle('');
    loadGoals();
  };

  const handleToggle = async (goalId) => {
    const dateStr = selectedDate.toISOString().split('T')[0];
    
    // Send to Supabase
    const { status, error } = await toggleGoalCheck(userId, goalId, dateStr);

    if (error) {
      alert("Error: " + error.message);
      return;
    }

    // Update the screen immediately (Snappy UI)
    if (status === 'checked') {
      setCompletedGoals(prev => [...prev, goalId]);
    } else {
      setCompletedGoals(prev => prev.filter(id => id !== goalId));
    }
  };

  const handleDelete = async (goalId) => {
    if (window.confirm("Are you sure you want to remove this habit?")) {
      await deleteGoal(goalId);
      loadGoals();
    }
  };

  const changeDate = (days) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
  };

  return (
    <div className="max-w-md mx-auto">
      {/* DATE NAVIGATION */}
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

      {/* INPUT FORM */}
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

      {/* HABIT LIST */}
      <div className="space-y-4">
        {goals.map((goal) => {
          const isCompleted = completedGoals.includes(goal.id);

          return (
            <div 
              key={goal.id} 
              className={`flex items-center justify-between p-5 rounded-2xl shadow-lg transition-all transform active:scale-95 ${
                isCompleted ? 'bg-gray-200 opacity-60' : 'bg-[#3E7C7D] text-white'
              }`}
            >
              <div className="flex items-center gap-4">
                <button onClick={() => handleToggle(goal.id)}>
                  {isCompleted ? (
                    <CheckCircle className="w-8 h-8 text-[#3E7C7D]" />
                  ) : (
                    <Circle className="w-8 h-8 opacity-80" />
                  )}
                </button>
                <span className={`text-xl font-medium ${isCompleted ? 'line-through text-gray-500' : ''}`}>
                  {goal.title}
                </span>
              </div>
              
              <button onClick={() => handleDelete(goal.id)} className={`${isCompleted ? 'text-gray-400' : 'text-orange-200'} hover:text-red-400`}>
                <Trash2 size={20} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
