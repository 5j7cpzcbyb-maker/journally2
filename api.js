// --- AUTHENTICATION ---

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
