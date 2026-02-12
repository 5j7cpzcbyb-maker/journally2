import React, { useState, useEffect } from 'react';
import { ChevronLeft, Users, Trophy, Trash2, LogOut, Plus, X, Check, Key, Copy } from 'lucide-react';
import { 
  getGroups, 
  getGroupMembers, 
  joinGroup, 
  leaveGroup, 
  deleteGroup,
  createGroup,
  joinGroupByCode 
} from './api';

export default function CirclesPage({ userId }) {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [isCreating, setIsCreating] = useState(false);
  const [isJoiningCode, setIsJoiningCode] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchGroups();
  }, [userId]);

  const fetchGroups = async () => {
    const { data } = await getGroups(userId);
    setGroups(data || []);
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return;
    const { data, error } = await createGroup(userId, newGroupName);
    if (!error) {
      setNewGroupName('');
      setIsCreating(false);
      fetchGroups();
    }
  };

  const handleJoinByCode = async () => {
    if (!inputCode.trim()) return;
    const { data, error } = await joinGroupByCode(userId, inputCode);
    if (error) alert(error);
    else {
      setInputCode('');
      setIsJoiningCode(false);
      fetchGroups();
    }
  };

  const handleSelectGroup = async (group) => {
    if (!group.is_member) return;
    setLoading(true);
    setSelectedGroup(group);
    const { data: memberData } = await getGroupMembers(group.id);
    setMembers(memberData || []);
    setLoading(false);
  };

  const handleJoinFromList = async (groupId) => {
    await joinGroup(groupId, userId);
    fetchGroups();
  };

  const handleLeave = async (e, groupId) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to leave this circle?")) {
      await leaveGroup(groupId, userId);
      setSelectedGroup(null);
      fetchGroups();
    }
  };

  const handleDelete = async (e, groupId) => {
    e.stopPropagation();
    if (window.confirm("DANGER: This will delete the group for everyone. This cannot be undone.")) {
      await deleteGroup(groupId, userId);
      setSelectedGroup(null);
      fetchGroups();
    }
  };

  const getMemberProgressStyle = (completed, total) => {
    if (total === 0) return { backgroundColor: 'rgb(243, 244, 246)' };
    const percentage = completed / total;
    const alpha = 0.2 + (percentage * 0.8);
    return { backgroundColor: `rgba(62, 124, 125, ${alpha})` };
  };

  // --- VIEW 1: Leaderboard & Personal Goals ---
  if (selectedGroup) {
    const isOwner = selectedGroup.owner_id === userId;
    const currentUserData = members.find(m => m.id === userId);
    
    // Sort squad by completion percentage
    const otherMembers = members
      .filter(m => m.id !== userId)
      .sort((a, b) => {
        const scoreA = a.total_habits > 0 ? a.completed_today / a.total_habits : 0;
        const scoreB = b.total_habits > 0 ? b.completed_today / b.total_habits : 0;
        return scoreB - scoreA;
      });

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-32 px-4 pt-4">
        <div className="max-w-md mx-auto space-y-6">
          {/* Header Actions */}
          <div className="flex justify-between items-center">
            <button onClick={() => setSelectedGroup(null)} className="flex items-center text-[#3E7C7D] dark:text-teal-400 font-bold gap-1">
              <ChevronLeft size={20} /> Back
            </button>
            
            {/* Logic Fix: Owner vs Member Controls */}
            {isOwner ? (
              <button onClick={(e) => handleDelete(e, selectedGroup.id)} className="text-red-500 flex items-center gap-1 text-[10px] font-black uppercase tracking-widest bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-xl">
                <Trash2 size={14} /> Delete Circle
              </button>
            ) : (
              <button onClick={(e) => handleLeave(e, selectedGroup.id)} className="text-gray-500 flex items-center gap-1 text-[10px] font-black uppercase tracking-widest bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-xl">
                <LogOut size={14} /> Leave Circle
              </button>
            )}
          </div>

          {/* 1. YOUR GOALS (Top Priority) */}
          {currentUserData && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-xl border-2 border-[#D45D21]">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-[10px] font-black text-[#D45D21] uppercase tracking-widest">
                    {isOwner ? "Founder's Progress" : "My Progress"}
                  </h3>
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                    {selectedGroup.name}
                  </h2>
                </div>
                <div className="bg-[#D45D21]/10 p-2 rounded-xl text-[#D45D21]">
                  <Trophy size={24} />
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-end">
                  <span className="text-4xl font-black text-gray-800 dark:text-white">
                    {currentUserData.total_habits > 0 
                      ? Math.round((currentUserData.completed_today / currentUserData.total_habits) * 100) 
                      : 0}%
                  </span>
                  <span className="text-xs font-bold text-gray-400 uppercase">
                    {currentUserData.completed_today} / {currentUserData.total_habits} Done
                  </span>
                </div>
                <div className="w-full h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#D45D21] transition-all duration-1000" 
                    style={{ width: `${(currentUserData.completed_today / (currentUserData.total_habits || 1)) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* 2. SQUAD SUMMARY */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <Users size={16} className="text-[#3E7C7D]" />
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">The Squad</h3>
              </div>
              <button 
                onClick={() => handleCopyCode(selectedGroup.join_code)}
                className="text-[10px] font-black text-[#3E7C7D] bg-[#3E7C7D]/10 px-2 py-1 rounded-md flex items-center gap-1"
              >
                CODE: {selectedGroup.join_code} {copied ? <Check size={10}/> : <Copy size={10}/>}
              </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="divide-y divide-gray-50 dark:divide-gray-700">
                {otherMembers.length > 0 ? (
                  otherMembers.map((member) => (
                    <div key={member.id} className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          style={getMemberProgressStyle(member.completed_today, member.total_habits)}
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-sm"
                        >
                          {member.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-gray-700 dark:text-gray-200 text-sm">{member.name}</p>
                          <p className="text-[10px] text-gray-400 font-bold uppercase">{member.completed_today} / {member.total_habits} Goals</p>
                        </div>
                      </div>
                      <p className="font-black text-[#3E7C7D] dark:text-teal-400">
                        {member.total_habits > 0 ? Math.round((member.completed_today / member.total_habits) * 100) : 0}%
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-gray-400 text-xs font-bold uppercase tracking-widest">
                    No other members yet
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- VIEW 2: List View ---
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-32 px-4 pt-4">
      <div className="max-w-md mx-auto space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-bold text-[#3E7C7D] dark:text-white">Circles</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Find your community</p>
          </div>
          <div className="flex gap-2">
            {!isJoiningCode && !isCreating && (
              <>
                <button onClick={() => setIsJoiningCode(true)} className="bg-white dark:bg-gray-800 text-[#3E7C7D] dark:text-teal-400 p-3 rounded-2xl shadow-sm">
                  <Key size={24} />
                </button>
                <button onClick={() => setIsCreating(true)} className="bg-[#3E7C7D] text-white p-3 rounded-2xl shadow-lg">
                  <Plus size={24} />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Modal-style Inputs for Join/Create */}
        {isJoiningCode && (
          <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-xl border-2 border-[#3E7C7D]">
            <p className="text-[10px] font-black text-[#3E7C7D] uppercase mb-2 ml-1">Enter Circle Code</p>
            <div className="flex gap-2">
              <input autoFocus maxLength={6} className="flex-1 bg-gray-50 dark:bg-gray-900 dark:text-white p-3 rounded-xl font-bold uppercase outline-none" placeholder="ABC123" value={inputCode} onChange={(e) => setInputCode(e.target.value)} />
              <button onClick={handleJoinByCode} className="bg-[#3E7C7D] text-white p-3 rounded-xl"><Check size={20} /></button>
              <button onClick={() => setIsJoiningCode(false)} className="bg-gray-100 dark:bg-gray-700 text-gray-400 p-3 rounded-xl"><X size={20} /></button>
            </div>
          </div>
        )}

        {isCreating && (
          <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-xl border-2 border-[#D45D21]">
            <p className="text-[10px] font-black text-[#D45D21] uppercase mb-2 ml-1">New Circle Name</p>
            <div className="flex gap-2">
              <input autoFocus className="flex-1 bg-gray-50 dark:bg-gray-900 dark:text-white p-3 rounded-xl font-bold outline-none" placeholder="e.g. Morning Runners" value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)} />
              <button onClick={handleCreateGroup} className="bg-[#D45D21] text-white p-3 rounded-xl"><Check size={20} /></button>
              <button onClick={() => setIsCreating(false)} className="bg-gray-100 dark:bg-gray-700 text-gray-400 p-3 rounded-xl"><X size={20} /></button>
            </div>
          </div>
        )}

        {/* Groups Grid */}
        <div className="grid gap-4">
          {groups.map(group => (
            <div
              key={group.id}
              onClick={() => handleSelectGroup(group)}
              className={`bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border-r-8 transition-all active:scale-95 ${
                group.is_member ? 'border-[#3E7C7D] cursor-pointer' : 'border-gray-200 dark:border-gray-700 opacity-80'
              }`}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${group.is_member ? 'bg-[#3E7C7D]/10 dark:bg-teal-900/30 text-[#3E7C7D] dark:text-teal-400' : 'bg-gray-100 dark:bg-gray-900 text-gray-400'}`}>
                    <Users size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 dark:text-white">{group.name}</p>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{group.member_count} Members</p>
                  </div>
                </div>
                {!group.is_member ? (
                  <button onClick={(e) => { e.stopPropagation(); handleJoinFromList(group.id); }} className="bg-[#D45D21] text-white px-4 py-2 rounded-lg text-xs font-black uppercase">Join</button>
                ) : (
                  <div className="text-[10px] font-black text-[#3E7C7D] dark:text-teal-400 uppercase bg-[#3E7C7D]/5 dark:bg-teal-900/20 px-2 py-1 rounded">Member</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
