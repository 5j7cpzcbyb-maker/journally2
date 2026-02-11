import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Copy, Check } from 'lucide-react';
import { createGroup, joinGroup, getMyGroups } from './api';

export default function CirclesPage({ userId }) {
  const [groups, setGroups] = useState([]);
  const [newGroupName, setNewGroupName] = useState('');
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [copied, setCopied] = useState(null);

  useEffect(() => {
    loadGroups();
  }, [userId]);

  const loadGroups = async () => {
    const { data } = await getMyGroups(userId);
    setGroups(data || []);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newGroupName) return;
    await createGroup(userId, newGroupName);
    setNewGroupName('');
    loadGroups();
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    const { error } = await joinGroup(userId, joinCodeInput.toUpperCase());
    if (error) alert(error);
    else {
      setJoinCodeInput('');
      loadGroups();
    }
  };

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="max-w-md mx-auto space-y-8 pb-20">
      <h2 className="text-3xl font-bold text-[#3E7C7D] text-center">Your Circles</h2>

      {/* CREATE A CIRCLE */}
      <div className="bg-white p-6 rounded-3xl shadow-xl border-t-8 border-[#3E7C7D]">
        <h3 className="font-bold mb-4 flex items-center gap-2"><Users size={20}/> Start a New Circle</h3>
        <form onSubmit={handleCreate} className="flex gap-2">
          <input 
            className="flex-1 p-3 rounded-xl border-2 border-gray-100 outline-none focus:border-[#3E7C7D]"
            placeholder="Circle Name (e.g. Family)"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
          />
          <button type="submit" className="bg-[#3E7C7D] text-white px-4 rounded-xl font-bold">Create</button>
        </form>
      </div>

      {/* JOIN A CIRCLE */}
      <div className="bg-white p-6 rounded-3xl shadow-xl border-t-8 border-[#D45D21]">
        <h3 className="font-bold mb-4 flex items-center gap-2"><UserPlus size={20}/> Join with Code</h3>
        <form onSubmit={handleJoin} className="flex gap-2">
          <input 
            className="flex-1 p-3 rounded-xl border-2 border-gray-100 outline-none focus:border-[#D45D21]"
            placeholder="6-Digit Code"
            value={joinCodeInput}
            onChange={(e) => setJoinCodeInput(e.target.value)}
          />
          <button type="submit" className="bg-[#D45D21] text-white px-4 rounded-xl font-bold">Join</button>
        </form>
      </div>

      {/* LIST OF MY CIRCLES */}
      <div className="space-y-4">
        {groups.map((item) => (
          <div key={item.group_id} className="bg-white p-5 rounded-2xl shadow-md border-l-8 border-[#3E7C7D] flex justify-between items-center">
            <div>
              <p className="font-bold text-lg text-gray-800">{item.groups?.name}</p>
              <p className="text-sm text-gray-400">Code: <span className="font-mono font-bold text-[#D45D21]">{item.groups?.join_code}</span></p>
            </div>
            <button 
              onClick={() => copyToClipboard(item.groups?.join_code)}
              className="p-2 bg-gray-50 rounded-lg hover:bg-gray-100"
            >
              {copied === item.groups?.join_code ? <Check size={18} className="text-green-600"/> : <Copy size={18} className="text-gray-400"/>}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
