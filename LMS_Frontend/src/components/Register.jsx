import React, { useState } from 'react';
import { api } from '../services/api';

export const Register = ({ onBack }) => {
  const [formData, setFormData] = useState({
    userName: '', email: '', phoneNo: '', address: '', password: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    // Basic validation
    if (!formData.userName || !formData.email || !formData.password) {
      setMessage({ type: 'error', text: 'Please fill in all required fields' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      // Always register as Student here
      const response = await api.registerStudent(formData);
      
      if (response.ok) {
        setMessage({ type: 'success', text: 'Student registered successfully! Redirecting...' });
        setFormData({ userName: '', email: '', phoneNo: '', address: '', password: '' });
        setTimeout(() => onBack(), 2000);
      } else {
        const error = await response.text();
        setMessage({ type: 'error', text: error || 'Registration failed' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Connection error. Make sure backend is running.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Student Registration</h2>
        
        {message.text && (
          <div className={`px-4 py-3 rounded-lg mb-4 ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-700' 
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
            {message.text}
          </div>
        )}
        
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Username"
            value={formData.userName}
            onChange={(e) => setFormData({...formData, userName: e.target.value})}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="tel"
            placeholder="Phone Number"
            value={formData.phoneNo}
            onChange={(e) => setFormData({...formData, phoneNo: e.target.value})}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="text"
            placeholder="Address"
            value={formData.address}
            onChange={(e) => setFormData({...formData, address: e.target.value})}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
          
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </div>
        
        <button
          onClick={onBack}
          className="w-full mt-4 text-indigo-600 hover:text-indigo-700 font-medium"
        >
          Back to Login
        </button>
      </div>
    </div>
  );
};