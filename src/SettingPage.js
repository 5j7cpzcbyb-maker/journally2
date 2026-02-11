import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { Moon, Sun, Save, Lock } from 'lucide-react';

export default function SettingsPage({ userId }) {
  const [loading, setLoading] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  // 1. Load existing profile data when the page opens
  useEffect(() => {
    async function getProfile() {
      const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
      if (data) {
        setFirstName(data.first_name);
        setLastName(data.last_name);
        setIsDarkMode(data.is_dark_mode);
      }
    }
    getProfile();
  }, [userId]);

  // 2. Update Name and Theme
  const updateProfile = async () => {
    setLoading(true);
    const { error } = await supabase.from('profiles').update({
      first_name: firstName,
      last_name: lastName,
      is_dark_mode: isDarkMode
    }).eq('id', userId);
    
    if (error) alert(error.message);
    else alert('Profile updated!');
    setLoading(false);
  };

  // 3. Update Password
  const handlePasswordUpdate = async () => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) alert(error.message);
    else alert('Password changed!');
  };

  return (
    <div className="max-w-md mx-auto space-y-6 pb-10">
      <h2 className="text-3xl font-bold text-[#3E7C7D] text-center">Settings</h2>

      {/* PERSONAL INFO SECTION */}
      <div className="bg-white p-6 rounded-3xl shadow-xl border-t-8 border-[#3E7C7D]">
        <label className="block text-sm font-bold text-gray-400 mb-2">NAME</label>
        <div className="flex gap-2 mb-4">
          <input className="w-1/2 p-3 border-2 rounded-xl" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First" />
          <input className="w-1/2 p-3 border-2 rounded-xl" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last" />
        </div>
        
        {/* LIGHT / DARK MODE TOGGLE */}
        <label className="block text-sm font-bold text-gray-400 mb-2">APPEARANCE</label>
        <button 
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="flex items-center justify-between w-full p-3 bg-gray-50 rounded-xl border-2 mb-4 hover:border-[#3E7C7D]"
        >
          <span>{isDarkMode ? 'Dark Mode' : 'Light Mode'}</span>
          {isDarkMode ? <Moon className="text-[#3E7C7D]" /> : <Sun className="text-orange-400" />}
        </button>

        <button 
          onClick={updateProfile}
          disabled={loading}
          className="w-full bg-[#3E7C7D] text-white py-3 rounded-xl font-bold flex justify-center items-center gap-2"
        >
          <Save size={18}/> {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* SECURITY SECTION */}
      <div className="bg-white p-6 rounded-3xl shadow-xl border-t-8 border-[#D45D21]">
        <h3 className="font-bold mb-4 flex items-center gap-2"><Lock size={18}/> Update Password</h3>
        <input 
          type="password" 
          className="w-full p-3 border-2 rounded-xl mb-4" 
          placeholder="New Password" 
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <button 
          onClick={handlePasswordUpdate}
          className="w-full bg-[#D45D21] text-white py-3 rounded-xl font-bold"
        >
          Change Password
        </button>
      </div>
    </div>
  );
}
