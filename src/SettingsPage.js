import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { Moon, Sun, Save, Lock } from 'lucide-react';

export default function SettingsPage({ userId }) {
  const [loading, setLoading] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  // 1. Load profile and apply current theme to the document
  useEffect(() => {
    async function getProfile() {
      const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
      if (data) {
        setFirstName(data.first_name);
        setLastName(data.last_name);
        setIsDarkMode(data.is_dark_mode);
        // Apply the theme immediately on load
        if (data.is_dark_mode) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    }
    getProfile();
  }, [userId]);

  // 2. Helper to toggle the actual HTML class
  const toggleThemeClass = (darkModeActive) => {
    if (darkModeActive) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  
  const handleToggleChange = () => {
    const nextMode = !isDarkMode;
    setIsDarkMode(nextMode);
    toggleThemeClass(nextMode); // Change the UI color immediately
  };

  // 3. Update Name and Theme in Database
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

  const handlePasswordUpdate = async () => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) alert(error.message);
    else alert('Password changed!');
  };

  return (
    // Added dark:bg-gray-900 to the container
    <div className="max-w-md mx-auto space-y-6 pb-20 px-4 mt-4 transition-colors duration-300">
      <h2 className="text-3xl font-bold text-[#3E7C7D] dark:text-white text-center">Settings</h2>

      {/* PERSONAL INFO SECTION */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-xl border-t-8 border-[#3E7C7D] transition-colors">
        <label className="block text-sm font-bold text-gray-400 dark:text-gray-500 mb-2">NAME</label>
        <div className="flex gap-2 mb-4">
          <input 
            className="w-1/2 p-3 border-2 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-xl outline-none focus:border-[#3E7C7D]" 
            value={firstName} 
            onChange={(e) => setFirstName(e.target.value)} 
            placeholder="First" 
          />
          <input 
            className="w-1/2 p-3 border-2 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-xl outline-none focus:border-[#3E7C7D]" 
            value={lastName} 
            onChange={(e) => setLastName(e.target.value)} 
            placeholder="Last" 
          />
        </div>
        
        <label className="block text-sm font-bold text-gray-400 dark:text-gray-500 mb-2">APPEARANCE</label>
        <button 
          onClick={handleToggleChange}
          className="flex items-center justify-between w-full p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border-2 dark:border-gray-700 mb-6 hover:border-[#3E7C7D] transition-all"
        >
          <span className="font-bold text-gray-700 dark:text-gray-300">
            {isDarkMode ? 'Dark Mode' : 'Light Mode'}
          </span>
          {isDarkMode ? <Moon className="text-[#3E7C7D]" /> : <Sun className="text-orange-400" />}
        </button>

        <button 
          onClick={updateProfile}
          disabled={loading}
          className="w-full bg-[#3E7C7D] text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all flex justify-center items-center gap-2"
        >
          <Save size={18}/> {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* SECURITY SECTION */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-xl border-t-8 border-[#D45D21] transition-colors">
        <h3 className="font-bold dark:text-white mb-4 flex items-center gap-2"><Lock size={18}/> Update Password</h3>
        <input 
          type="password" 
          className="w-full p-3 border-2 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-xl mb-4 outline-none focus:border-[#D45D21]" 
          placeholder="New Password" 
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <button 
          onClick={handlePasswordUpdate}
          className="w-full bg-[#D45D21] text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all"
        >
          Change Password
        </button>
      </div>
    </div>
  );
}
