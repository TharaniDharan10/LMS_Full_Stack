import React, { useState, useEffect } from 'react';
import { BookOpen } from 'lucide-react';
import { api } from '../services/api';

export const Login = ({ onLogin, onSwitchToRegister }) => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    // 1. Validation Logic
    if (!credentials.username) {
      setError('Please enter username');
      return;
    }
    if (!credentials.password) {
      setError('Please enter password');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // 2. Perform Login
      const userData = await api.login(credentials);
      // 3. Trigger App State Update
      onLogin(userData);
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="flex items-center justify-center mb-6">
          <BookOpen className="w-12 h-12 text-indigo-600" />
        </div>
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">Library System</h2>
        <p className="text-center text-gray-600 mb-8">Sign in to manage your library</p>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Username or Email</label>
            <input
              type="text"
              value={credentials.username}
              onChange={(e) => setCredentials({...credentials, username: e.target.value})}
              onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Enter username"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              type="password"
              value={credentials.password}
              onChange={(e) => setCredentials({...credentials, password: e.target.value})}
              onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Enter password"
            />
          </div>
          
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </div>
        
        <div className="mt-6 text-center">
          <button
            onClick={onSwitchToRegister}
            className="text-indigo-600 hover:text-indigo-700 font-medium"
          >
            Don't have an account? Register
          </button>
        </div>
      </div>
    </div>
  );
};