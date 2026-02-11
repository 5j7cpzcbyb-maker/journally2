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

  // Generate the last 30 days for the calendar
  const last30Days = [...Array(30)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    return d.toISOString().split('T')[0];
  }).reverse();

  return (
    <div className="max-w-md mx-auto space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-[#3E7C7D] mb-4">Progress Gallery</h2>
        
        {/* GOAL SELECTOR DROP DOWN */}
        <select 
          className="w-full p-3 rounded-xl border-2 border-[#D45D21] bg-white outline-none font-bold text-[#D45D21]"
          onChange={(e) => setSelectedGoalId(e.target.value)}
        >
          <option value="all">Overall Combined Progress</option>
          {goals.map(goal => (
            <option key={goal.id} value={goal.id}>{goal.title}</option>
          ))}
        </select>
      </div>

      {/* CALENDAR GRID */}
      <div className="bg-white p-6 rounded-3xl shadow-xl border-b-8 border-[#D45D21]">
        <div className="grid grid-cols-7 gap-2">
          {last30Days.map(date => {
            const isCompleted = logs.some(l => l.completed_at === date && (selectedGoalId === 'all' || l.goal_id === selectedGoalId));
            
            // Logic for "Dark Grey" (Before Goal Created)
            const goal = goals.find(g => g.id === selectedGoalId);
            const isBeforeCreation = goal && date < goal.created_at.split('T')[0];

            let bgColor = "bg-gray-100"; // Default: Missed/Future
            if (isCompleted) bgColor = "bg-[#3E7C7D]"; // Green: Success
            if (isBeforeCreation) bgColor = "bg-gray-400"; // Grey: Didn't exist yet

            return (
              <div 
                key={date}
                title={date}
                className={`h-10 w-10 rounded-lg ${bgColor} transition-colors duration-500`}
              />
            );
          })}
        </div>
        <div className="mt-6 flex justify-between text-xs font-bold uppercase tracking-widest text-gray-400">
          <span>30 Days Ago</span>
          <span>Today</span>
        </div>
      </div>

      {/* MOTIVATION STAT */}
      <div className="bg-[#D45D21] text-white p-6 rounded-2xl shadow-lg text-center">
        <p className="text-sm opacity-80 uppercase tracking-widest">Total Completions</p>
        <p className="text-5xl font-bold">{logs.length}</p>
      </div>
    </div>
  );
}
