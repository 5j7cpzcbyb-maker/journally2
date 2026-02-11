import React, { useState } from 'react';
import { signUpUser, signInUser } from './api';

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await signUpUser(email, password, firstName, lastName);
        if (error) throw error; // Jump to catch block
        alert('Check your email for a verification link!');
      } else {
        const { error } = await signInUser(email, password);
        if (error) throw error;
      }
    } catch (error) {
      alert(error.message);
    } finally {
      // THIS IS THE KEY: This runs no matter what, unfreezing the button.
      setLoading(false);
    }
  };
  
  return (
    <div className="max-w-md mx-auto mt-10 p-8 bg-white rounded-3xl shadow-2xl border-b-8 border-[#D45D21]">
      <h2 className="text-3xl font-bold text-[#3E7C7D] mb-6 text-center">
        {isSignUp ? 'Create Account' : 'Welcome Back'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {isSignUp && (
          <div className="flex gap-2">
            <input
              className="w-1/2 p-3 rounded-xl border-2 border-gray-200 focus:border-[#D45D21] outline-none"
              placeholder="First Name"
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
            <input
              className="w-1/2 p-3 rounded-xl border-2 border-gray-200 focus:border-[#D45D21] outline-none"
              placeholder="Last Name"
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>
        )}

        <input
          type="email"
          className="w-full p-3 rounded-xl border-2 border-gray-200 focus:border-[#D45D21] outline-none"
          placeholder="Email Address"
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          className="w-full p-3 rounded-xl border-2 border-gray-200 focus:border-[#D45D21] outline-none"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-[#D45D21] text-white font-bold rounded-xl shadow-lg hover:bg-[#b04a1a] transition-colors"
        >
          {loading ? 'Processing...' : isSignUp ? 'Sign Up' : 'Login'}
        </button>
      </form>

      <div className="mt-6 text-center space-y-2">
        <button 
          onClick={() => setIsSignUp(!isSignUp)}
          className="text-[#3E7C7D] font-medium hover:underline"
        >
          {isSignUp ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
        </button>
        
        {!isSignUp && (
          <p className="text-sm text-gray-400 cursor-pointer hover:text-gray-600">
            Forgot Password?
          </p>
        )}
      </div>
    </div>
  );
}
