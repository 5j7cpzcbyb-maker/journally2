import React, { useState, useEffect } from 'react';
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

  // Helper to determine the color shade based on completion percentage
  const getShade = (date) => {
    // 1. Logic for "Individual Goal" View
    if (selectedGoalId !== 'all') {
      const goal = goals.find(g => g.id === selectedGoalId);
      const isBeforeCreation = goal && date < goal.created_at.split('T')[0];
      const isCompleted = logs.some(l => l.completed_at === date && l.goal_id === selectedGoalId);

      if (isBeforeCreation) return "bg-gray-400"; // Grey: Didn't exist
      if (isCompleted) return "bg-[#3E7C7D]";      // Solid Green
      return "bg-gray-100";                       // Empty
    }

    // 2. Logic for "Overall Combined Progress" (Shading)
    const activeGoalsOnDate = goals.filter(g => date >= g.created_at.split('T')[0] && !g.is_deleted).length;
    const completedOnDate = logs.filter(l => l.completed_at === date).length;

    if (activeGoalsOnDate === 0) return "bg-gray-100";
    
    const percentage = (completedOnDate / activeGoalsOnDate) * 100;

    if (percentage === 0) return "bg-gray-100";
    if (percentage <= 33) return "bg-[#3E7C7D]/30";  // Light shade
    if (percentage <= 66) return "bg-[#3E7C7D]/60";  // Medium shade
    return "bg-[#3E7C7D]";                           // Full shade
  };

  const last30Days = [...Array(30)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    return d.toISOString().split('T')[0];
  }); // Removed .reverse() to flow left-to-right like a standard heatmap

  return (
    <div className="max-w-md mx-auto space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-[#3E7C7D] mb-4">Progress Gallery</h2>
        
        <select 
          className="w-full p-3 rounded-xl border-2 border-[#D45D21] bg-white outline-none font-bold text-[#D45D21]"
          onChange={(e) => setSelectedGoalId(e.target.value)}
        >
          <option value="all">Overall Combined Progress</option>
          {goals.filter(g => !g.is_deleted).map(goal => (
            <option key={goal.id} value={goal.id}>{goal.title}</option>
          ))}
        </select>
      </div>

      {/* CALENDAR GRID */}
      <div className="bg-white p-6 rounded-3xl shadow-xl border-b-8 border-[#D45D21]">
        <div className="grid grid-cols-7 gap-2">
          {last30Days.map(date => (
            <div 
              key={date}
              title={`${date} (${logs.filter(l => l.completed_at === date).length} habits)`}
              className={`h-10 w-10 rounded-lg ${getShade(date)} transition-all duration-500 border border-black/5`}
            />
          ))}
        </div>
        
        {/* LEGEND FOR SHADING */}
        {selectedGoalId === 'all' && (
          <div className="mt-4 flex items-center justify-end gap-2 text-[10px] font-bold text-gray-400 uppercase">
            <span>Less</span>
            <div className="w-3 h-3 bg-gray-100 rounded-sm" />
            <div className="w-3 h-3 bg-[#3E7C7D]/30 rounded-sm" />
            <div className="w-3 h-3 bg-[#3E7C7D]/60 rounded-sm" />
            <div className="w-3 h-3 bg-[#3E7C7D] rounded-sm" />
            <span>More</span>
          </div>
        )}

        <div className="mt-2 flex justify-between text-xs font-bold uppercase tracking-widest text-gray-400">
          <span>30 Days Ago</span>
          <span>Today</span>
        </div>
      </div>

      {/* MOTIVATION STAT */}
      // Helper to calculate the completion rate for the selected view
  const calculateCompletionRate = () => {
    const daysCount = 30;
    
    if (selectedGoalId === 'all') {
      // Calculate total potential checkmarks over 30 days
      // We only count days since each habit was actually created
      const totalPotential = last30Days.reduce((acc, date) => {
        const activeOnDate = goals.filter(g => 
          date >= g.created_at.split('T')[0] && !g.is_deleted
        ).length;
        return acc + activeOnDate;
      }, 0);

      const totalActual = logs.length; // All logs in history
      
      if (totalPotential === 0) return 0;
      return Math.round((totalActual / totalPotential) * 100);
    } else {
      // Calculate potential for a single specific habit
      const goal = goals.find(g => g.id === selectedGoalId);
      if (!goal) return 0;

      const creationDate = goal.created_at.split('T')[0];
      const potentialDays = last30Days.filter(date => date >= creationDate).length;
      const actualCompletions = logs.filter(l => l.goal_id === selectedGoalId).length;

      if (potentialDays === 0) return 0;
      return Math.round((actualCompletions / potentialDays) * 100);
    }
  };

  const completionRate = calculateCompletionRate();

  return (
    <div className="max-w-md mx-auto space-y-8">
      {/* ... previous Header and Grid code ... */}

      {/* UPDATED MOTIVATION STAT */}
      <div className="bg-[#D45D21] text-white p-6 rounded-2xl shadow-lg text-center relative overflow-hidden">
        {/* Subtle background icon for flare */}
        <div className="absolute -right-4 -bottom-4 opacity-10 rotate-12">
          <CheckCircle2 size={120} />
        </div>
        
        <p className="text-sm opacity-80 uppercase tracking-widest font-bold">
          {selectedGoalId === 'all' ? 'Overall Success Rate' : 'Habit Consistency'}
        </p>
        
        <div className="flex items-center justify-center gap-2">
          <p className="text-6xl font-black">{completionRate}%</p>
        </div>

        <p className="mt-2 text-xs italic opacity-90">
          {completionRate >= 80 ? "You're crushing it! 🔥" : 
           completionRate >= 50 ? "Halfway there, keep it up! 👍" : 
           "Every small step counts. Let's grow! 🌱"}
        </p>
      </div>
    </div>
  );
}
