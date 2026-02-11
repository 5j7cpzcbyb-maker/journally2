import React, { useState, useEffect } from 'react';
import { Plus, ChevronLeft, ChevronRight, CheckCircle, Circle, Trash2, ArchiveRestore, ChevronDown, ChevronUp } from 'lucide-react';
import { getDailyGoals, addGoal, toggleGoalCheck, deleteGoal, getGoalLogs, getAllGoalsHistory, restoreGoal } from './api';

export default function DailyPage({ userId }) {
  const [goals, setGoals] = useState([]);
  const [archivedGoals, setArchivedGoals] = useState([]);
  const [completedGoals, setCompletedGoals] = useState([]);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showArchive, setShowArchive] = useState(false);

  useEffect(() => {
    loadGoals();
  }, [selectedDate, userId]);

  const loadGoals = async () => {
    const dateStr = selectedDate.toISOString().split('T')[0];
    
    // 1. Fetch active goals
    const { data: goalsData } = await getDailyGoals(userId);
    // 2. Fetch ALL goals to find the deleted ones for the archive
    const { data: allHistory } = await getAllGoalsHistory(userId);
    // 3. Fetch completion logs
    const { data: logsData } = await getGoalLogs(userId);
    
    setGoals(goalsData || []);
    setArchivedGoals(allHistory?.filter(g => g.is_deleted === true) || []);
    
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
    const { status, error } = await toggleGoalCheck(userId, goalId, dateStr);
    if (error) return alert(error.message);

    if (status === 'checked') {
      setCompletedGoals(prev => [...prev, goalId]);
    } else {
      setCompletedGoals(prev => prev.filter(id => id !== goalId));
    }
  };

  const handleDelete = async (goalId) => {
    await deleteGoal(goalId);
    loadGoals();
  };

  const handleRestore = async (goalId) => {
    await restoreGoal(goalId);
    loadGoals();
  };

  const changeDate = (days) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
  };

  return (
    <div className="max-w-md mx-auto space-y-8">
      {/* DATE NAVIGATION */}
      <div className="flex justify-between items-center bg-white rounded-full p-2 shadow-inner border-2 border-[#D45D21]">
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
      <form onSubmit={handleAddGoal} className="flex gap-2">
        <input 
          type="text" 
          placeholder="New habit..." 
          value={newGoalTitle}
          onChange={(e) => setNewGoalTitle(e.target.value)}
          className="flex-1 p-4 rounded-xl border-2 border-[#3E7C7D] focus:outline-none bg-white/50"
        />
        <button type="submit" className="bg-[#D45D21] text-white p-4 rounded-xl shadow-lg">
          <Plus />
        </button>
      </form>

      {/* ACTIVE HABIT LIST */}
      <div className="space-y-4">
        {goals.map((goal) => {
          const isCompleted = completedGoals.includes(goal.id);
          return (
            <div key={goal.id} className={`flex items-center justify-between p-5 rounded-2xl shadow-lg transition-all ${isCompleted ? 'bg-gray-200 opacity-60' : 'bg-[#3E7C7D] text-white'}`}>
              <div className="flex items-center gap-4">
                <button onClick={() => handleToggle(goal.id)}>
                  {isCompleted ? <CheckCircle className="w-8 h-8 text-[#3E7C7D]" /> : <Circle className="w-8 h-8 opacity-80" />}
                </button>
                <span className={`text-xl font-medium ${isCompleted ? 'line-through text-gray-500' : ''}`}>{goal.title}</span>
              </div>
              <button onClick={() => handleDelete(goal.id)} className="text-orange-200 hover:text-red-400">
                <Trash2 size={20} />
              </button>
            </div>
          );
        })}
      </div>

      {/* ARCHIVE SECTION */}
      {archivedGoals.length > 0 && (
        <div className="mt-12 border-t-2 border-dashed border-gray-300 pt-6">
          <button 
            onClick={() => setShowArchive(!showArchive)}
            className="flex items-center gap-2 text-gray-400 font-bold uppercase tracking-widest text-xs hover:text-[#3E7C7D] transition-colors"
          >
            {showArchive ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
            {showArchive ? 'Hide Archive' : `Show Archive (${archivedGoals.length})`}
          </button>

          {showArchive && (
            <div className="mt-4 space-y-2">
              {archivedGoals.map((goal) => (
                <div key={goal.id} className="flex items-center justify-between bg-white/50 p-3 rounded-xl border border-gray-200 text-gray-400 italic">
                  <span>{goal.title}</span>
                  <button 
                    onClick={() => handleRestore(goal.id)}
                    className="flex items-center gap-1 text-xs bg-gray-100 px-3 py-1 rounded-full hover:bg-[#3E7C7D] hover:text-white transition-all"
                  >
                    <ArchiveRestore size={14} /> Restore
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
