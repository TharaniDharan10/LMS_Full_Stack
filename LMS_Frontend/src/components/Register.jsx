import React, { useState } from 'react';
import { UserPlus, ArrowLeft, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { api } from '../services/api';

// ... (Keep CSS Styles same as before) ...
const registerStyles = `...`; 

// ... (CountryPhoneInput component remains same for UI) ...
const CountryPhoneInput = ({ value, onChange }) => {
  const countries = [
      { code: "+91", flag: "🇮🇳", limit: 10 },
      { code: "+1",  flag: "🇺🇸", limit: 10 },
      { code: "+44", flag: "🇬🇧", limit: 10 }
  ];
  // ... (Keep existing logic) ...
  // Just ensuring the mapping is clear:
  // value format is "+91-9876543210"
  // ...
  const initialCode = value && value.includes('-') ? value.split('-')[0] : "+91";
  const initialNum = value && value.includes('-') ? value.split('-')[1] : value || "";

  const [selectedCode, setSelectedCode] = useState(initialCode);
  const [number, setNumber] = useState(initialNum);

  const handleNumberChange = (e) => {
      const val = e.target.value.replace(/\D/g, '');
      const currentLimit = countries.find(c => c.code === selectedCode)?.limit || 10;
      
      // Visual Limit: Don't let them type more than limit
      if (val.length <= currentLimit) {
          setNumber(val);
          onChange(`${selectedCode}-${val}`); 
      }
  };

  return (
      <div className="flex gap-2">
          <div className="relative w-28">
            <select 
                value={selectedCode} 
                onChange={(e) => { setSelectedCode(e.target.value); setNumber(""); onChange(`${e.target.value}-`); }}
                className="w-full h-full pl-3 pr-2 py-3 bg-white border border-gray-200 rounded-xl text-gray-700 outline-none appearance-none cursor-pointer text-sm font-medium shadow-sm focus:border-blue-500"
            >
                {countries.map(c => <option key={c.code} value={c.code}>{c.flag} {c.code}</option>)}
            </select>
          </div>
          <input 
              type="text" 
              value={number}
              onChange={handleNumberChange}
              placeholder="Phone Number"
              className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-700 outline-none shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder-gray-400" 
          />
      </div>
  );
};

export const Register = ({ onBack }) => {
  const [formData, setFormData] = useState({
    userName: '', email: '', phoneNo: '', address: '', password: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    // 1. Email Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
        setMessage({ type: 'error', text: 'Invalid Email Format' });
        return;
    }

    // --- FIX: STRICT PHONE LENGTH VALIDATION ---
    if (!formData.phoneNo || !formData.phoneNo.includes('-')) {
        setMessage({ type: 'error', text: 'Please enter a valid phone number.' });
        return;
    }

    const [code, number] = formData.phoneNo.split('-');
    
    // Define limits based on code
    const limits = { "+91": 10, "+1": 10, "+44": 10 }; 
    const requiredLength = limits[code] || 10;

    if (!number || number.length !== requiredLength) {
        setMessage({ type: 'error', text: `Phone number for ${code} must be exactly ${requiredLength} digits.` });
        return;
    }
    // -------------------------------------------

    // 3. Strong Password Check
    const strongPwd = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if(!strongPwd.test(formData.password)) {
        setMessage({type:'error', text:'Password must be 8+ chars, with Uppercase, Number & Special Char (@$!%*?&)'});
        return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      const response = await api.registerStudent(formData);
      
      if (response.ok) {
        setMessage({ type: 'success', text: 'Registration Successful! Please check your email to verify account.' });
        setFormData({ userName: '', email: '', phoneNo: '', address: '', password: '' });
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
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
      <style>{registerStyles}</style>
      {/* Backgrounds */}
      <div className="fixed inset-0 z-0 library-bg"></div>
      <div className="fixed inset-0 z-0 bg-gradient-to-br from-blue-900/40 to-purple-900/40 backdrop-blur-[2px]"></div>

      <div className="relative z-10 w-full max-w-md">
        <div className="glass-card rounded-2xl p-8 sm:p-10 animate-fade-in">
          
          <div className="text-center mb-8">
            <div className="inline-flex p-3 rounded-full bg-blue-600 shadow-lg shadow-blue-600/30 mb-4">
                <UserPlus className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 tracking-tight">Student Registration</h2>
            <p className="text-gray-500 mt-2 text-sm">Join the Athenaeum archives today</p>
          </div>
          
          {message.text && (
            <div className={`flex items-start gap-3 px-4 py-3 rounded-xl mb-6 text-sm font-medium shadow-sm border ${
              message.type === 'success' 
                ? 'bg-green-50 border-green-200 text-green-700' 
                : 'bg-red-50 border-red-200 text-red-700'
            }`}>
              {message.type === 'success' ? <CheckCircle className="w-5 h-5 shrink-0"/> : <AlertCircle className="w-5 h-5 shrink-0"/>}
              <p className="mt-0.5">{message.text}</p>
            </div>
          )}
          
          <div className="space-y-4">
            <input type="text" placeholder="Username" value={formData.userName} onChange={(e) => setFormData({...formData, userName: e.target.value})} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-700 outline-none shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder-gray-400" />
            <input type="email" placeholder="Email Address" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-700 outline-none shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder-gray-400" />

            {/* UPDATED PHONE INPUT */}
            <CountryPhoneInput value={formData.phoneNo} onChange={(val) => setFormData({...formData, phoneNo: val})} />

            <input type="text" placeholder="Address" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-700 outline-none shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder-gray-400" />
            
            <div className="space-y-1">
                <input type="password" placeholder="Strong Password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} onKeyPress={(e) => e.key === 'Enter' && handleSubmit()} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-700 outline-none shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder-gray-400" />
                <p className="text-xs text-gray-400 ml-1">Min 8 chars, 1 Upper, 1 Number, 1 Special</p>
            </div>
            
            <button onClick={handleSubmit} disabled={loading} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-2">
              {loading ? <><Loader className="w-5 h-5 animate-spin"/> Creating Account...</> : 'Create Account'}
            </button>
          </div>
          
          <button onClick={onBack} className="w-full mt-6 flex items-center justify-center gap-2 text-gray-500 hover:text-gray-800 font-medium transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};