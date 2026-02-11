import React, { useState, useEffect } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { getAllGoalsHistory, getGoalLogs } from './api';

export default function SummaryPage({ userId }) {
  const [goals, setGoals] = useState([]);
  const [logs, setLogs] = useState([]);
  const [selectedGoalId, setSelectedGoalId] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      const { data: goalsData } = await getAllGoalsHistory(userId);
      const { data: logsData } = await getGoalLogs(userId);
      setGoals(goalsData || []);
      setLogs(logsData || []);
    };
    fetchData();
  }, [userId]);

  const last30Days = [...Array(30)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    return d.toISOString().split('T')[0];
  });

  // HELPER: Returns dynamic colors compatible with Light/Dark backgrounds
  const getDynamicStyle = (date) => {
    const isDark = document.documentElement.classList.contains('dark');
    const goalsExistedOnDate = goals.filter(g => date >= g.created_at.split('T')[0]);
    
    // Colors for specific states
    const colors = {
      notStarted: isDark ? 'rgb(75, 85, 99)' : 'rgb(156, 163, 175)', // gray-600 vs gray-400
      missed: isDark ? 'rgb(31, 41, 55)' : 'rgb(243, 244, 246)',    // gray-900 vs gray-100
      brandGreen: 'rgb(62, 124, 125)'
    };

    if (selectedGoalId !== 'all') {
      const goal = goals.find(g => g.id === selectedGoalId);
      const isBeforeCreation = goal && date < goal.created_at.split('T')[0];
      const isCompleted = logs.some(l => l.completed_at === date && l.goal_id === selectedGoalId);
      
      if (isBeforeCreation) return { backgroundColor: colors.notStarted };
      if (isCompleted) return { backgroundColor: colors.brandGreen };
      return { backgroundColor: colors.missed };
    }

    if (goalsExistedOnDate.length === 0) return { backgroundColor: colors.notStarted };

    const activeGoalsCount = goalsExistedOnDate.filter(g => !g.is_deleted).length;
    const completedOnDate = logs.filter(l => l.completed_at === date).length;

    if (activeGoalsCount === 0 || completedOnDate === 0) return { backgroundColor: colors.missed };
    
    const percentage = completedOnDate / activeGoalsCount;
    const alpha = 0.2 + (percentage * 0.8); 
    return { backgroundColor: `rgba(62, 124, 125, ${alpha})` };
  };

  const calculateCompletionRate = () => {
    if (goals.length === 0) return 0;
    const today = new Date();

    if (selectedGoalId === 'all') {
      let totalPotential = 0;
      goals.forEach(g => {
        const createdAt = new Date(g.created_at);
        const diffDays = Math.ceil(Math.abs(today - createdAt) / (1000 * 60 * 60 * 24)) || 1; 
        totalPotential += diffDays;
      });
      const totalActual = logs.length; 
      if (totalPotential === 0) return 0;
      return Math.min(Math.round((totalActual / totalPotential) * 100), 100);
    } else {
      const goal = goals.find(g => g.id === selectedGoalId);
      if (!goal) return 0;
      const createdAt = new Date(goal.created_at);
      const potentialDays = Math.ceil(Math.abs(today - createdAt) / (1000 * 60 * 60 * 24)) || 1;
      const actualCompletions = logs.filter(l => l.goal_id === selectedGoalId).length;
      return Math.min(Math.round((actualCompletions / potentialDays) * 100), 100);
    }
  };

  const completionRate = calculateCompletionRate();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-500 pb-32 px-4 pt-4">
      <div className="max-w-md mx-auto space-y-8">
        
        <div className="text-center">
          <h2 className="text-3xl font-bold text-[#3E7C7D] dark:text-white mb-4">Progress Gallery</h2>
          <select 
            className="w-full p-3 rounded-xl border-2 border-[#D45D21] bg-white dark:bg-gray-800 dark:text-white outline-none font-bold appearance-none transition-colors"
            value={selectedGoalId}
            onChange={(e) => setSelectedGoalId(e.target.value)}
          >
            <option value="all">Overall Combined Progress</option>
            {goals.filter(g => !g.is_deleted).map(goal => (
              <option key={goal.id} value={goal.id}>{goal.title}</option>
            ))}
          </select>
        </div>

        {/* HEATMAP GRID */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-xl border-b-8 border-[#D45D21] transition-colors">
          <div className="grid grid-cols-7 gap-2">
            {last30Days.map(date => (
              <div 
                key={date}
                style={getDynamicStyle(date)}
                className="h-10 w-10 rounded-lg border border-black/5 dark:border-white/5 transition-all duration-700"
              />
            ))}
          </div>
          
          {/* LEGEND */}
          <div className="mt-6 flex flex-wrap justify-center gap-x-4 gap-y-2">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 bg-gray-400 dark:bg-gray-600 rounded-sm" />
                <span className="text-[10px] font-bold text-gray-400 uppercase">Not Started</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 bg-gray-100 dark:bg-gray-900 rounded-sm" />
                <span className="text-[10px] font-bold text-gray-400 uppercase">Missed</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-12 h-3 rounded-sm bg-gradient-to-r from-[#3E7C7D]/20 to-[#3E7C7D]" />
                <span className="text-[10px] font-bold text-gray-400 uppercase">Progress</span>
              </div>
          </div>
        </div>

        {/* CONSISTENCY CARD */}
        <div className="bg-[#D45D21] text-white p-8 rounded-3xl shadow-lg text-center relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 opacity-10 rotate-12">
            <CheckCircle2 size={120} />
          </div>
          <p className="text-sm opacity-80 uppercase tracking-widest font-bold">Consistency Rate</p>
          <div className="flex items-center justify-center mt-2">
            <p className="text-6xl font-black">{completionRate}%</p>
          </div>
          <p className="mt-4 text-xs italic opacity-90 tracking-tight">
            {completionRate >= 80 ? "You're crushing it! 🔥" : 
             completionRate >= 50 ? "Over halfway there, keep it up! 👍" : 
             "Every small step counts. Let's grow! 🌱"}
          </p>
        </div>

      </div>
    </div>
  );
}
