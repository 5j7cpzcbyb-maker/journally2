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

  const getShade = (date) => {
    const goalsExistedOnDate = goals.filter(g => date >= g.created_at.split('T')[0]);
    
    if (selectedGoalId !== 'all') {
      const goal = goals.find(g => g.id === selectedGoalId);
      const isBeforeCreation = goal && date < goal.created_at.split('T')[0];
      const isCompleted = logs.some(l => l.completed_at === date && l.goal_id === selectedGoalId);
      
      if (isBeforeCreation) return "bg-gray-400"; 
      if (isCompleted) return "bg-[#3E7C7D]";      
      return "bg-gray-100";                       
    }

    if (goalsExistedOnDate.length === 0) return "bg-gray-400"; 

    const activeGoalsCount = goalsExistedOnDate.filter(g => !g.is_deleted).length;
    const completedOnDate = logs.filter(l => l.completed_at === date).length;

    if (activeGoalsCount === 0) return "bg-gray-100";
    
    const percentage = (completedOnDate / activeGoalsCount) * 100;

    if (percentage === 0) return "bg-gray-100";      
    if (percentage <= 33) return "bg-[#3E7C7D]/30";  
    if (percentage <= 66) return "bg-[#3E7C7D]/60";  
    return "bg-[#3E7C7D]";                           
  };

  const calculateCompletionRate = () => {
    if (goals.length === 0) return 0;
    const today = new Date();

    if (selectedGoalId === 'all') {
      let totalPotential = 0;
      goals.forEach(g => {
        const createdAt = new Date(g.created_at);
        const diffTime = Math.abs(today - createdAt);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1; 
        totalPotential += diffDays;
      });
      const totalActual = logs.length; 
      if (totalPotential === 0) return 0;
      return Math.min(Math.round((totalActual / totalPotential) * 100), 100);
    } else {
      const goal = goals.find(g => g.id === selectedGoalId);
      if (!goal) return 0;
      const createdAt = new Date(goal.created_at);
      const diffTime = Math.abs(today - createdAt);
      const potentialDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
      const actualCompletions = logs.filter(l => l.goal_id === selectedGoalId).length;
      return Math.min(Math.round((actualCompletions / potentialDays) * 100), 100);
    }
  };

  const completionRate = calculateCompletionRate();

  return (
    <div className="max-w-md mx-auto space-y-8 pb-32">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-[#3E7C7D] mb-4">Progress Gallery</h2>
        <select 
          className="w-full p-3 rounded-xl border-2 border-[#D45D21] bg-white outline-none font-bold text-[#D45D21]"
          value={selectedGoalId}
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
              className={`h-10 w-10 rounded-lg ${getShade(date)} border border-black/5`}
            />
          ))}
        </div>
        
        {/* CLEAN MINIMAL LEGEND */}
        <div className="mt-6 flex flex-wrap justify-center gap-x-4 gap-y-2">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-gray-400 rounded-sm" />
              <span className="text-[10px] font-bold text-gray-500 uppercase">Not Started</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-gray-100 rounded-sm" />
              <span className="text-[10px] font-bold text-gray-500 uppercase">Missed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-[#3E7C7D]/30 rounded-sm" />
              <span className="text-[10px] font-bold text-gray-500 uppercase">~30%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-[#3E7C7D]/60 rounded-sm" />
              <span className="text-[10px] font-bold text-gray-500 uppercase">~60%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-[#3E7C7D] rounded-sm" />
              <span className="text-[10px] font-bold text-gray-500 uppercase">100%</span>
            </div>
        </div>
      </div>

      {/* MOTIVATION STAT CARD */}
      <div className="bg-[#D45D21] text-white p-8 rounded-2xl shadow-lg text-center relative overflow-hidden">
        <div className="absolute -right-4 -bottom-4 opacity-10 rotate-12">
          <CheckCircle2 size={120} />
        </div>
        
        <p className="text-sm opacity-80 uppercase tracking-widest font-bold">
          Consistency Rate
        </p>
        
        <div className="flex items-center justify-center mt-2">
          <p className="text-6xl font-black">{completionRate}%</p>
        </div>

        <p className="mt-4 text-xs italic opacity-90 tracking-tight">
          {completionRate >= 80 ? "You're crushing it! 🔥" : 
           completionRate >= 50 ? "Halfway there, keep it up! 👍" : 
           "Every small step counts. Let's grow! 🌱"}
        </p>
      </div>
    </div>
  );
}
