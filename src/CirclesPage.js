import React, { useState, useEffect } from 'react';
import { ChevronLeft, Users, Trophy } from 'lucide-react';
import { getGroups, getGroupMembers, getMemberLogsToday } from './api';

export default function CirclesPage({ userId }) {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch groups on mount
  useEffect(() => {
    const fetchGroups = async () => {
      const { data } = await getGroups(userId);
      setGroups(data || []);
    };
    fetchGroups();
  }, [userId]);

  // Fetch member progress when a group is selected
  const handleSelectGroup = async (group) => {
    setLoading(true);
    setSelectedGroup(group);
    
    // Fetch members and their activity for today
    const { data: memberData } = await getGroupMembers(group.id);
    setMembers(memberData || []);
    setLoading(false);
  };

  // Dynamic style helper (reusing your Summary logic)
  const getMemberProgressStyle = (completed, total) => {
    if (total === 0) return { backgroundColor: 'rgb(243, 244, 246)' };
    const percentage = completed / total;
    const alpha = 0.2 + (percentage * 0.8);
    return { backgroundColor: `rgba(62, 124, 125, ${alpha})` };
  };

  // VIEW 1: Group Detail / Leaderboard
  if (selectedGroup) {
    return (
      <div className="max-w-md mx-auto space-y-6 pb-32 px-4">
        <button 
          onClick={() => setSelectedGroup(null)}
          className="flex items-center text-[#3E7C7D] font-bold gap-1"
        >
          <ChevronLeft size={20} /> Back to Circles
        </button>

        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-[#3E7C7D]">{selectedGroup.name}</h2>
          <p className="text-gray-500 text-sm font-medium uppercase tracking-widest">Daily Progress Leaderboard</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border-b-8 border-[#D45D21] overflow-hidden">
          {loading ? (
            <div className="p-10 text-center text-gray-400 font-bold">Loading Squad...</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {members.map((member, index) => {
                const isUser = member.id === userId;
                return (
                  <div key={member.id} className="p-5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-black text-gray-300 w-4">{index + 1}</span>
                      <div className="relative">
                        {/* THE DYNAMIC PROGRESS GRAPHIC */}
                        <div 
                          style={getMemberProgressStyle(member.completed_today, member.total_habits)}
                          className="w-12 h-12 rounded-full border-2 border-white shadow-sm flex items-center justify-center text-white font-bold transition-all duration-1000"
                        >
                          {member.name.charAt(0)}
                        </div>
                        {member.completed_today === member.total_habits && (
                          <div className="absolute -top-1 -right-1 bg-yellow-400 rounded-full p-1 shadow-sm">
                            <Trophy size={10} className="text-white" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className={`font-bold ${isUser ? 'text-[#D45D21]' : 'text-gray-700'}`}>
                          {member.name} {isUser && "(You)"}
                        </p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase">
                          {member.completed_today} / {member.total_habits} Tasks Done
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-lg font-black text-[#3E7C7D]">
                        {member.total_habits > 0 
                          ? Math.round((member.completed_today / member.total_habits) * 100) 
                          : 0}%
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // VIEW 2: List of Circles
  return (
    <div className="max-w-md mx-auto space-y-8 pb-32 px-4">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-[#3E7C7D] mb-2">Your Circles</h2>
        <p className="text-gray-500 font-medium">Connect with your community</p>
      </div>

      <div className="grid gap-4">
        {groups.map(group => (
          <button
            key={group.id}
            onClick={() => handleSelectGroup(group)}
            className="bg-white p-6 rounded-2xl shadow-md border-r-8 border-[#3E7C7D] flex items-center justify-between hover:scale-[1.02] transition-transform active:scale-95"
          >
            <div className="flex items-center gap-4">
              <div className="bg-[#3E7C7D]/10 p-3 rounded-xl text-[#3E7C7D]">
                <Users size={24} />
              </div>
              <div className="text-left">
                <p className="font-bold text-gray-800 text-lg">{group.name}</p>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{group.member_count} Members</p>
              </div>
            </div>
            <div className="bg-gray-50 px-3 py-1 rounded-full text-[10px] font-black text-gray-400 uppercase">
              View Squad
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
