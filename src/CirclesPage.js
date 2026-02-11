import React, { useState, useEffect } from 'react';
import { ChevronLeft, Users, Trophy, Trash2, LogOut, Plus, X, Check } from 'lucide-react';
import { 
  getGroups, 
  getGroupMembers, 
  joinGroup, 
  leaveGroup, 
  deleteGroup,
  createGroup 
} from './api';

export default function CirclesPage({ userId }) {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // New State for Creating Groups
  const [isCreating, setIsCreating] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');

  useEffect(() => {
    fetchGroups();
  }, [userId]);

  const fetchGroups = async () => {
    const { data } = await getGroups(userId);
    setGroups(data || []);
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return;
    const { data, error } = await createGroup(userId, newGroupName);
    if (!error) {
      setNewGroupName('');
      setIsCreating(false);
      fetchGroups(); // Refresh list to show the new group
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

  const handleJoin = async (groupId) => {
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
    if (window.confirm("DANGER: This will delete the group for everyone. Proceed?")) {
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

  // VIEW 1: Leaderboard Detail
  if (selectedGroup) {
    return (
      <div className="max-w-md mx-auto space-y-6 pb-32 px-4 mt-4">
        <div className="flex justify-between items-center">
          <button onClick={() => setSelectedGroup(null)} className="flex items-center text-[#3E7C7D] font-bold gap-1">
            <ChevronLeft size={20} /> Back
          </button>
          
          {selectedGroup.owner_id === userId ? (
            <button onClick={(e) => handleDelete(e, selectedGroup.id)} className="text-red-400 flex items-center gap-1 text-xs font-bold uppercase">
              <Trash2 size={14} /> Delete Circle
            </button>
          ) : (
            <button onClick={(e) => handleLeave(e, selectedGroup.id)} className="text-gray-400 flex items-center gap-1 text-xs font-bold uppercase">
              <LogOut size={14} /> Leave
            </button>
          )}
        </div>

        <div className="text-center bg-white p-6 rounded-3xl shadow-sm border-2 border-[#3E7C7D]/10">
          <h2 className="text-3xl font-bold text-[#3E7C7D]">{selectedGroup.name}</h2>
          <div className="mt-2 inline-block bg-gray-100 px-3 py-1 rounded-full">
             <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
               Invite Code: <span className="text-[#D45D21] select-all">{selectedGroup.join_code}</span>
             </p>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border-b-8 border-[#D45D21] overflow-hidden">
          <div className="divide-y divide-gray-50">
            {members.map((member, index) => (
              <div key={member.id} className="p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div 
                    style={getMemberProgressStyle(member.completed_today, member.total_habits)}
                    className="w-12 h-12 rounded-full border-2 border-white shadow-sm flex items-center justify-center text-white font-black"
                  >
                    {member.name.charAt(0)}
                  </div>
                  <div>
                    <p className={`font-bold ${member.id === userId ? 'text-[#D45D21]' : 'text-gray-700'}`}>
                      {member.name} {member.id === userId && "★"}
                    </p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
                      {member.completed_today} / {member.total_habits} Done
                    </p>
                  </div>
                </div>
                <p className="text-lg font-black text-[#3E7C7D]">
                  {member.total_habits > 0 ? Math.round((member.completed_today / member.total_habits) * 100) : 0}%
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // VIEW 2: Group Discovery & Creation
  return (
    <div className="max-w-md mx-auto space-y-8 pb-32 px-4 mt-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-[#3E7C7D]">Circles</h2>
          <p className="text-gray-500 text-sm font-medium">Join a squad or start one</p>
        </div>
        
        {/* THE CREATE BUTTON */}
        {!isCreating && (
          <button 
            onClick={() => setIsCreating(true)}
            className="bg-[#3E7C7D] text-white p-3 rounded-2xl shadow-lg hover:rotate-90 transition-transform"
          >
            <Plus size={24} />
          </button>
        )}
      </div>

      {/* CREATION INPUT FIELD */}
      {isCreating && (
        <div className="bg-white p-4 rounded-2xl shadow-xl border-2 border-[#D45D21] animate-in fade-in zoom-in duration-300">
          <p className="text-xs font-black text-[#D45D21] uppercase mb-2 ml-1">New Circle Name</p>
          <div className="flex gap-2">
            <input 
              autoFocus
              className="flex-1 bg-gray-50 border-none outline-none p-3 rounded-xl font-bold text-gray-700 placeholder:text-gray-300"
              placeholder="e.g. 5AM Club"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
            />
            <button onClick={handleCreateGroup} className="bg-[#3E7C7D] text-white p-3 rounded-xl">
              <Check size={20} />
            </button>
            <button onClick={() => setIsCreating(false)} className="bg-gray-100 text-gray-400 p-3 rounded-xl">
              <X size={20} />
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {groups.map(group => (
          <div
            key={group.id}
            onClick={() => handleSelectGroup(group)}
            className={`bg-white p-5 rounded-2xl shadow-sm border-r-8 transition-all active:scale-95 ${
              group.is_member ? 'border-[#3E7C7D] cursor-pointer' : 'border-gray-200 opacity-80'
            }`}
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${group.is_member ? 'bg-[#3E7C7D]/10 text-[#3E7C7D]' : 'bg-gray-100 text-gray-400'}`}>
                  <Users size={20} />
                </div>
                <div>
                  <p className="font-bold text-gray-800">{group.name}</p>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{group.member_count} Members</p>
                </div>
              </div>

              {!group.is_member ? (
                <button 
                  onClick={(e) => { e.stopPropagation(); handleJoin(group.id); }}
                  className="bg-[#D45D21] text-white px-4 py-2 rounded-lg text-xs font-black uppercase"
                >
                  Join
                </button>
              ) : (
                <div className="text-[10px] font-black text-[#3E7C7D] uppercase bg-[#3E7C7D]/5 px-2 py-1 rounded">Joined</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
