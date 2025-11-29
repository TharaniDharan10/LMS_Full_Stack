import React, { useState } from 'react';
import { BookOpen, KeyRound, Mail, ArrowLeft, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { api } from '../services/api';

// --- CSS STYLES ---
const loginStyles = `
  @keyframes moveThrough { 0% { transform: scale(1.0); } 100% { transform: scale(1.15); } }
  .library-bg {
    background-image: url('https://images.unsplash.com/photo-1568667256549-094345857637?q=80&w=2515&auto=format&fit=crop');
    background-size: cover; background-position: center; animation: moveThrough 60s linear infinite alternate;
  }
  .glass-card {
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.5);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  }
`;

// --- FORGOT PASSWORD MODAL ---
const ForgotPasswordModal = ({ onClose }) => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if(!email) { setMessage({type:'error', text:'Please enter email'}); return; }
    setLoading(true);
    try {
      const res = await api.forgotPassword(email);
      const txt = await res.text();
      if (res.ok) {
        setMessage({ type: 'success', text: 'Reset link sent! Check your email.' });
      } else {
        setMessage({ type: 'error', text: txt });
      }
    } catch (e) {
      setMessage({ type: 'error', text: 'Connection error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md relative shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><ArrowLeft className="w-5 h-5"/></button>
        <div className="text-center mb-6">
            <div className="bg-blue-100 p-3 rounded-full inline-flex mb-3"><KeyRound className="w-6 h-6 text-blue-600"/></div>
            <h3 className="text-xl font-bold text-gray-800">Reset Password</h3>
            <p className="text-sm text-gray-500 mt-1">Enter your email to receive a reset link.</p>
        </div>

        {message.text && (
          <div className={`mb-4 p-3 rounded-lg text-sm flex items-center gap-2 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {message.type==='success'?<CheckCircle className="w-4 h-4"/>:<AlertCircle className="w-4 h-4"/>} {message.text}
          </div>
        )}

        <div className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5"/>
            <input 
                type="email" placeholder="name@example.com" 
                value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>
          <button onClick={handleSubmit} disabled={loading} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all flex justify-center gap-2">
            {loading ? <Loader className="w-5 h-5 animate-spin"/> : "Send Reset Link"}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- MAIN LOGIN ---
export const Login = ({ onLogin, onSwitchToRegister }) => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);

  const handleSubmit = async () => {
    if (!credentials.username || !credentials.password) {
      setError('Please enter both username and password');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const userData = await api.login(credentials);
      onLogin(userData);
    } catch (err) {
      setError(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden font-sans">
      <style>{loginStyles}</style>
      <div className="fixed inset-0 z-0 library-bg"></div>
      <div className="fixed inset-0 z-0 bg-blue-900/30 backdrop-blur-[1px]"></div>

      <div className="relative z-10 w-full max-w-md">
        <div className="glass-card rounded-2xl p-8 sm:p-10 animate-fade-in">
          
          <div className="text-center mb-8">
            <div className="inline-flex p-3 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/30 mb-4">
                <BookOpen className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-black text-gray-800 tracking-tight">LMS_Classic</h2>
            <p className="text-gray-500 mt-2 text-sm font-medium">Welcome back, Scholar.</p>
          </div>
          
          {error && (
            <div className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm font-medium border border-red-100">
              <AlertCircle className="w-4 h-4 shrink-0"/> {error}
            </div>
          )}
          
          <div className="space-y-5">
            <div>
                <input
                    type="text" value={credentials.username} onChange={(e) => setCredentials({...credentials, username: e.target.value})}
                    className="w-full px-4 py-3.5 bg-white/80 border border-gray-200 rounded-xl text-gray-800 outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder-gray-400 font-medium"
                    placeholder="Email or Username"
                />
            </div>
            <div>
                <input
                    type="password" value={credentials.password} onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                    onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                    className="w-full px-4 py-3.5 bg-white/80 border border-gray-200 rounded-xl text-gray-800 outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder-gray-400 font-medium"
                    placeholder="Password"
                />
                <div className="flex justify-end mt-2">
                    <button onClick={() => setShowForgot(true)} className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline transition">
                        Forgot Password?
                    </button>
                </div>
            </div>
            
            <button onClick={handleSubmit} disabled={loading} className="w-full bg-gray-900 text-white py-3.5 rounded-xl font-bold shadow-xl hover:bg-black hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
              {loading ? <Loader className="w-5 h-5 animate-spin"/> : 'Sign In'}
            </button>
          </div>
          
          <div className="mt-8 text-center">
            <button onClick={onSwitchToRegister} className="text-sm text-gray-500 hover:text-gray-800 font-semibold transition">
              Don't have an account? <span className="text-blue-600">Register</span>
            </button>
          </div>
        </div>
      </div>

      {showForgot && <ForgotPasswordModal onClose={() => setShowForgot(false)} />}
    </div>
  );
};