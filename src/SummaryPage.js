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
    // 1. Calculate how many goals actually existed on this date
    const goalsExistedOnDate = goals.filter(g => 
      date >= g.created_at.split('T')[0]
    );
    
    // 2. Logic for "Individual Goal" View
    if (selectedGoalId !== 'all') {
      const goal = goals.find(g => g.id === selectedGoalId);
      const isBeforeCreation = goal && date < goal.created_at.split('T')[0];
      const isCompleted = logs.some(l => l.completed_at === date && l.goal_id === selectedGoalId);
      
      if (isBeforeCreation) return "bg-gray-400"; // Dark Grey: Goal didn't exist
      if (isCompleted) return "bg-[#3E7C7D]";      // Green: Done
      return "bg-gray-100";                       // Light Grey: Missed
    }

    // 3. Logic for "Overall Combined Progress"
    // If NO goals existed at all on this day across the whole app
    if (goalsExistedOnDate.length === 0) return "bg-gray-400"; 

    const activeGoalsCount = goalsExistedOnDate.filter(g => !g.is_deleted).length;
    const completedOnDate = logs.filter(l => l.completed_at === date).length;

    if (activeGoalsCount === 0) return "bg-gray-100";
    
    const percentage = (completedOnDate / activeGoalsCount) * 100;

    if (percentage === 0) return "bg-gray-100";      // Light Grey: Missed tasks
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
    <div className="max-w-md mx-auto space-y-8 pb-32"> {/* Increased padding for nav bar */}
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

      <div className="bg-white p-6 rounded-3xl shadow-xl border-b-8 border-[#D45D21]">
        <div className="grid grid-cols-7 gap-2">
          {last30Days.map(date => (
            <div 
              key={date}
              title={date}
              className={`h-10 w-10 rounded-lg ${getShade(date)} transition-all duration-500 border border-black/5`}
            />
          ))}
        </div>
        
        <div className="mt-4 flex items-center justify-between">
            <div className="flex gap-2 items-center text-[10px] font-bold text-gray-400 uppercase">
                <div className="w-3 h-3 bg-gray-400 rounded-sm" />
                <span>Pre-Journally</span>
            </div>
            {selectedGoalId === 'all' && (
              <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase">
                <span>Less</span>
                <div className="w-3 h-3 bg-gray-100 rounded-sm" />
                <div className="w-3 h-3 bg-[#3E7C7D]/30 rounded-sm" />
                <div className="w-3 h-3 bg-[#3E7C7D]/60 rounded-sm" />
                <div className="w-3 h-3 bg-[#3E7C7D] rounded-sm" />
                <span>More</span>
              </div>
            )}
        </div>
      </div>

      <div className="bg-[#D45D21] text-white p-6 rounded-2xl shadow-lg text-center relative overflow-hidden">
        <div className="absolute -right-4 -bottom-4 opacity-10 rotate-12">
          <CheckCircle2 size={120} />
        </div>
        <p className="text-sm opacity-80 uppercase tracking-widest font-bold">
          Lifetime Success Rate
        </p>
        <div className="flex items-center justify-center gap-2">
          <p className="text-6xl font-black">{completionRate}%</p>
        </div>
        <p className="mt-2 text-xs italic opacity-90">
          Calculated from the first day you started tracking.
        </p>
      </div>
    </div>
  );
}
