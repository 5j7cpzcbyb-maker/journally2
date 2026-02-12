import { supabase } from './supabaseClient.js';

// --- THEME PREFERENCE ---

// Update user theme preference
export const updateTheme = async (userId, theme) => {
  return await supabase
    .from('profiles')
    .update({ theme: theme })
    .eq('id', userId);
};

// --- 1. AUTHENTICATION ---

export const signUpUser = async (email, password, firstName, lastName) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
      },
    },
  });
  return { data, error };
};

export const signInUser = async (email, password) => {
  return await supabase.auth.signInWithPassword({ email, password });
};

export const signOutUser = async () => {
  return await supabase.auth.signOut();
};

export const getUserProfile = async (userId) => {
  return await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
};

// --- 2. DAILY GOALS ---

export const addGoal = async (userId, title) => {
  return await supabase
    .from('goals')
    .insert([{ user_id: userId, title, is_deleted: false, is_shared: false }])
    .select();
};

export const getDailyGoals = async (userId) => {
  return await supabase
    .from('goals')
    .select('*')
    .eq('user_id', userId)
    .eq('is_deleted', false)
    .order('created_at', { ascending: false });
};

export const updateGoalTitle = async (goalId, newTitle) => {
  return await supabase.from('goals').update({ title: newTitle }).eq('id', goalId);
};

export const toggleGoalCheck = async (userId, goalId, dateStr) => {
  const { data: existingLog } = await supabase
    .from('goal_logs')
    .select('*')
    .eq('goal_id', goalId)
    .eq('completed_at', dateStr)
    .maybeSingle();

  if (existingLog) {
    const { error } = await supabase.from('goal_logs').delete().eq('id', existingLog.id);
    return { status: 'unchecked', error };
  } else {
    const { error } = await supabase.from('goal_logs').insert([
      { user_id: userId, goal_id: goalId, completed_at: dateStr, status: true }
    ]);
    return { status: 'checked', error };
  }
};

export const restoreGoal = async (goalId) => {
  return await supabase.from('goals').update({ is_deleted: false }).eq('id', goalId);
};

export const deleteGoal = async (goalId) => {
  return await supabase.from('goals').update({ is_deleted: true }).eq('id', goalId);
};

export const permanentDeleteGoal = async (goalId) => {
  await supabase.from('goal_logs').delete().eq('goal_id', goalId);
  return await supabase.from('goals').delete().eq('id', goalId);
};

// --- 3. SUMMARY & HISTORY ---

export const getAllGoalsHistory = async (userId) => {
  return await supabase.from('goals').select('*').eq('user_id', userId);
};

export const getGoalLogs = async (userId) => {
  return await supabase.from('goal_logs').select('goal_id, completed_at').eq('user_id', userId);
};

// --- 4. CIRCLES (GROUPS) ---

const generateJoinCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

export const createGroup = async (userId, groupName) => {
  const joinCode = generateJoinCode();
  const { data: groupData, error: groupError } = await supabase
    .from('groups')
    .insert([{ name: groupName, owner_id: userId, join_code: joinCode }])
    .select()
    .single();

  if (groupError) return { error: groupError };

  await supabase.from('group_members').insert([{ group_id: groupData.id, user_id: userId }]);
  return { data: groupData, error: null };
};

// Renamed to avoid duplication conflict
export const createGroup = async (userId, groupName) => {
  const joinCode = generateJoinCode();

  // FIX: Change 'owner_id' to 'created_by' to match your Supabase table
  const { data: groupData, error: groupError } = await supabase
    .from('groups')
    .insert([{ name: groupName, created_by: userId, join_code: joinCode }])
    .select()
    .single();

  if (groupError) return { error: groupError };

  // This part adds the creator to the members list
  await supabase.from('group_members').insert([{ group_id: groupData.id, user_id: userId }]);
  
  return { data: groupData, error: null };
};

// This is the one used by your "Join" button in the list
export const joinGroup = async (groupId, userId) => {
  return await supabase
    .from('group_members')
    .insert([{ group_id: groupId, user_id: userId }]);
};

export const getGroups = async (userId) => {
  const { data, error } = await supabase
    .from('groups')
    .select(`*, group_members(user_id)`);

  if (error) return { data: null, error };

  const formattedData = data.map(group => ({
    ...group,
    is_member: group.group_members.some(m => m.user_id === userId),
    member_count: group.group_members.length
  }));

  return { data: formattedData, error: null };
};

export const getGroupMembers = async (groupId) => {
  const today = new Date().toISOString().split('T')[0];
  const { data, error } = await supabase
    .from('group_members')
    .select(`
      user_id,
      profiles(name),
      goals(id, title, is_deleted),
      goal_logs(id, completed_at, goal_id)
    `)
    .eq('group_id', groupId);

  if (error) return { data: null, error };

  return {
    data: data.map(member => ({
      id: member.user_id,
      name: member.profiles?.name || "Anonymous",
      total_habits: member.goals?.filter(g => !g.is_deleted).length || 0,
      completed_today: member.goal_logs?.filter(l => l.completed_at === today).length || 0
    })),
    error: null
  };
};

export const leaveGroup = async (groupId, userId) => {
  return await supabase
    .from('group_members')
    .delete()
    .match({ group_id: groupId, user_id: userId });
};

export const deleteGroup = async (groupId, userId) => {
  return await supabase
    .from('groups')
    .delete()
    .match({ id: groupId, owner_id: userId });
};
