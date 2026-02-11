// --- AUTHENTICATION ---
import { supabase } from './supabaseClient.js';
// 1. SIGN UP
// "metaData" passes the First/Last name to Supabase so our Trigger can save it.
export const signUpUser = async (email, password, firstName, lastName) => {
  const { data, error } = await supabase.auth.signUp({
    email: email,
    password: password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
      },
    },
  });
  return { data, error };
};

// 2. LOG IN
export const signInUser = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

// 3. LOG OUT
export const signOutUser = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

// 4. GET CURRENT USER PROFILE
// This fetches the "Theme" (Dark/Light) and Name for the header.
export const getUserProfile = async (userId) => {
  const { data, error } = await supabase
    .from('profiles') // Look at the 'profiles' table
    .select('*')
    .eq('id', userId) // Find the row where ID matches the logged-in user
    .single(); // We expect only one result
  return { data, error };
};

// --- GOALS (DAILY PAGE) ---

// 1. ADD A NEW GOAL
export const addGoal = async (userId, title) => {
  const { data, error } = await supabase
    .from('goals')
    .insert([
      { 
        user_id: userId, 
        title: title,
        is_deleted: false, // Default is active
        is_shared: false   // Default is private
      }
    ])
    .select();
  return { data, error };
};

// 2. FETCH GOALS FOR "DAILY" VIEW
// IMPORTANT: We filter out the "Ghosts" (deleted goals) here.
export const getDailyGoals = async (userId) => {
  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', userId)
    .eq('is_deleted', false) // Only show goals that haven't been deleted
    .order('created_at', { ascending: false }); // Newest goals at the top
  return { data, error };
};

// RESTORE A SOFT-DELETED GOAL
export const restoreGoal = async (goalId) => {
  const { error } = await supabase
    .from('goals')
    .update({ is_deleted: false })
    .eq('id', goalId);
  return { error };
};

// 3. CHECK / UNCHECK A GOAL
// This is tricky! If it's checked, we delete the log. If it's unchecked, we create a log.
// 'dateStr' should be "YYYY-MM-DD"
export const toggleGoalCheck = async (userId, goalId, dateStr) => {
  // First, check if it is ALREADY completed for this day
  const { data: existingLog } = await supabase
    .from('goal_logs')
    .select('*')
    .eq('goal_id', goalId)
    .eq('completed_at', dateStr)
    .maybeSingle(); // Returns null if not found, instead of crashing

  if (existingLog) {
    // SCENARIO A: It is checked. user wants to UNCHECK it.
    // We delete the log entry.
    const { error } = await supabase
      .from('goal_logs')
      .delete()
      .eq('id', existingLog.id);
    return { status: 'unchecked', error };
  } else {
    // SCENARIO B: It is unchecked. User wants to CHECK it.
    // We insert a new log entry.
    const { error } = await supabase
      .from('goal_logs')
      .insert([
        { 
          user_id: userId, 
          goal_id: goalId, 
          completed_at: dateStr,
          status: true 
        }
      ]);
    return { status: 'checked', error };
  }
};

// 4. SOFT DELETE (THE GHOST MAKER)
// We don't actually 'delete' the row, we just mark it as deleted.
export const deleteGoal = async (goalId) => {
  const { error } = await supabase
    .from('goals')
    .update({ is_deleted: true }) // Update the flag
    .eq('id', goalId);
  return { error };
};

// PERMANENTLY DELETE A GOAL
export const permanentDeleteGoal = async (goalId) => {
  const { error } = await supabase
    .from('goals')
    .delete()
    .eq('id', goalId);
  return { error };
};

// --- SUMMARY & HISTORY ---

// 1. FETCH ALL GOALS (Including Ghosts)
// For the dropdown menu on the Summary page.
export const getAllGoalsHistory = async (userId) => {
  const { data, error } = await supabase
    .from('goals')
    .select('*') // We do NOT filter by 'is_deleted' here! We want them all.
    .eq('user_id', userId);
  return { data, error };
};

// 2. FETCH PROGRESS (LOGS)
// This gets the green dots for the calendar.
export const getGoalLogs = async (userId) => {
  const { data, error } = await supabase
    .from('goal_logs')
    .select('goal_id, completed_at') // We just need to know WHICH goal and WHAT day
    .eq('user_id', userId);
  return { data, error };
};

// --- CIRCLES (GROUPS) ---

// HELPER: Generate a random 6-character code
const generateJoinCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

// 1. CREATE A GROUP
export const createGroup = async (userId, groupName) => {
  const joinCode = generateJoinCode();

  // Step A: Create the group row
  const { data: groupData, error: groupError } = await supabase
    .from('groups')
    .insert([{ 
      name: groupName, 
      created_by: userId, 
      join_code: joinCode 
    }])
    .select()
    .single();

  if (groupError) return { error: groupError };

  // Step B: Automatically add the creator as a member
  const { error: memberError } = await supabase
    .from('group_members')
    .insert([{ 
      group_id: groupData.id, 
      user_id: userId 
    }]);

  return { data: groupData, error: memberError };
};

// 2. JOIN A GROUP (USING CODE)
export const joinGroup = async (userId, codeInput) => {
  // Step A: Find the group with this code
  const { data: group, error: searchError } = await supabase
    .from('groups')
    .select('id, name')
    .eq('join_code', codeInput) // Look for the code
    .single();

  if (searchError || !group) return { error: 'Group not found!' };

  // Step B: Add user to 'group_members'
  const { error: joinError } = await supabase
    .from('group_members')
    .insert([{ 
      group_id: group.id, 
      user_id: userId 
    }]);

  return { data: group, error: joinError };
};

// 3. GET MY GROUPS
export const getMyGroups = async (userId) => {
  // This is a complex join! We want Group Names where I am a Member.
  const { data, error } = await supabase
    .from('group_members')
    .select(`
      group_id,
      groups:group_id ( name, join_code, created_by ) 
    `)
    .eq('user_id', userId);
  return { data, error };
};

