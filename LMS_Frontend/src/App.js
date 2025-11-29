import React, { useState, useEffect } from 'react';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { Dashboard } from './components/Dashboard';
import { api } from './services/api';
import { KeyRound, CheckCircle, AlertCircle, Eye, EyeOff, Loader, BookOpen, X } from 'lucide-react';

// --- CSS STYLES (Login Background) ---
const appStyles = `
  @keyframes panSide {
    0% { background-position: 0% 50%; transform: scale(1.05); }
    100% { background-position: 100% 50%; transform: scale(1.15); }
  }
  
  .login-moving-bg {
    /* IMAGE 1: Classic Wooden Library */
    background-image: url('https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=2670&auto=format&fit=crop');
    background-size: cover;
    background-position: center;
    position: fixed;
    top: 0; left: 0; width: 100%; height: 100%;
    z-index: -1;
    /* 40s Pan Animation */
    animation: panSide 40s linear infinite alternate;
  }
`;

// --- 1. RESET PASSWORD SCREEN ---
const ResetPasswordScreen = ({ token, onDone }) => {
  const [formData, setFormData] = useState({ newPassword: '', confirmPassword: '' });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async () => {
    if (!formData.newPassword || !formData.confirmPassword) { setMessage({ type: 'error', text: 'Please fill both fields.' }); return; }
    if (formData.newPassword !== formData.confirmPassword) { setMessage({ type: 'error', text: 'Passwords do not match.' }); return; }
    
    const strongPwd = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if (!strongPwd.test(formData.newPassword)) {
      setMessage({ type: 'error', text: 'Password too weak (Need 8+ chars, Upper, Number, Special).' });
      return;
    }

    setLoading(true);
    try {
      const res = await api.resetPassword(token, formData.newPassword);
      const responseText = await res.text();
      
      if (res.ok) {
        setMessage({ type: 'success', text: 'Password Reset Successfully! Redirecting...' });
        setTimeout(() => onDone(), 2000); 
      } else {
        let errorMsg = responseText;
        try { errorMsg = JSON.parse(responseText).message || responseText; } catch(e) {}
        setMessage({ type: 'error', text: errorMsg || 'Reset failed.' });
      }
    } catch (e) { setMessage({ type: 'error', text: 'Connection Error.' }); } 
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 font-sans relative overflow-hidden">
      <style>{appStyles}</style>
      <div className="login-moving-bg"></div>
      <div className="fixed inset-0 z-0 bg-black/30 backdrop-blur-[2px]"></div>
      
      <div className="bg-white/90 p-8 rounded-2xl shadow-2xl w-full max-w-md border border-white/50 relative z-10 backdrop-blur-xl">
        <div className="text-center mb-6">
          <div className="bg-blue-100 p-3 rounded-full inline-flex mb-3"><KeyRound className="w-8 h-8 text-blue-600" /></div>
          <h2 className="text-2xl font-bold text-gray-800">Set New Password</h2>
        </div>
        {message.text && (<div className={`mb-4 p-3 rounded-lg text-sm flex items-center gap-2 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{message.text}</div>)}
        <div className="space-y-4">
          <div className="relative">
            <input type={showPass ? "text" : "password"} placeholder="New Password" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-700" value={formData.newPassword} onChange={(e) => setFormData({...formData, newPassword: e.target.value})} />
            <button onClick={() => setShowPass(!showPass)} className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600">{showPass ? <EyeOff className="w-5 h-5"/> : <Eye className="w-5 h-5"/>}</button>
          </div>
          <input type="password" placeholder="Confirm Password" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-700" value={formData.confirmPassword} onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})} />
          <button onClick={handleSubmit} disabled={loading} className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg flex justify-center items-center gap-2">{loading ? <Loader className="w-5 h-5 animate-spin"/> : "Update Password"}</button>
        </div>
      </div>
    </div>
  );
};

// --- 2. FORGOT PASSWORD MODAL ---
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
      if (res.ok) setMessage({ type: 'success', text: 'Reset link sent! Check your inbox.' });
      else setMessage({ type: 'error', text: txt });
    } catch (e) { setMessage({ type: 'error', text: 'Connection error' }); } 
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md relative shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X className="w-5 h-5"/></button>
        <div className="text-center mb-6"><h3 className="text-xl font-bold text-gray-800">Reset Password</h3><p className="text-sm text-gray-500 mt-1">Enter your email to receive a link.</p></div>
        {message.text && (<div className={`mb-4 p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{message.text}</div>)}
        <div className="space-y-4">
          <input type="email" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
          <button onClick={handleSubmit} disabled={loading} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex justify-center gap-2">{loading ? <Loader className="w-5 h-5 animate-spin"/> : "Send Reset Link"}</button>
          <button onClick={onClose} className="w-full py-2 text-gray-500 hover:text-gray-700">Back to Login</button>
        </div>
      </div>
    </div>
  );
};

// --- 3. MAIN APP COMPONENT ---
export default function App() {
  const [view, setView] = useState('login');
  const [user, setUser] = useState(null);
  const [resetToken, setResetToken] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const mode = params.get('mode');
    const path = window.location.pathname;

    if (token && (path === '/reset-password' || mode === 'reset')) {
        setResetToken(token);
        setView('reset'); 
        window.history.replaceState({}, document.title, "/");
    }
  }, []);

  const LoginComponent = ({ onLogin, onSwitchToRegister }) => {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showForgot, setShowForgot] = useState(false);
    const [showPass, setShowPass] = useState(false);

    const handleSubmit = async () => {
      if (!credentials.username || !credentials.password) { setError('Enter username and password'); return; }
      setLoading(true); setError('');
      try {
        const userData = await api.login(credentials);
        onLogin(userData);
      } catch (err) { setError(err.message || 'Login failed.'); } 
      finally { setLoading(false); }
    };

    return (
      <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden font-sans">
        {/* RESTORED BACKGROUND STYLE FOR LOGIN */}
        <style>{appStyles}</style>
        <div className="login-moving-bg"></div>
        <div className="fixed inset-0 z-0 bg-black/20 backdrop-blur-[1px]"></div>

        <div className="bg-white/90 rounded-2xl shadow-2xl w-full max-w-md p-8 relative z-10 backdrop-blur-xl border border-white/60">
          <div className="text-center mb-8"><div className="inline-flex p-3 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/30 mb-4"><BookOpen className="w-8 h-8 text-white" /></div><h2 className="text-3xl font-black text-gray-800">LMS_Classic</h2><p className="text-gray-500 mt-2 font-medium">Welcome back.</p></div>
          {error && <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm font-medium border border-red-100"><AlertCircle className="w-4 h-4 inline mr-2"/>{error}</div>}
          <div className="space-y-5">
            <input type="text" value={credentials.username} onChange={(e) => setCredentials({...credentials, username: e.target.value})} className="w-full px-4 py-3.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all" placeholder="Email or Username" />
            <div className="relative">
                <input type={showPass ? "text" : "password"} value={credentials.password} onChange={(e) => setCredentials({...credentials, password: e.target.value})} onKeyPress={(e) => e.key === 'Enter' && handleSubmit()} className="w-full px-4 py-3.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all" placeholder="Password" />
                <button onClick={() => setShowPass(!showPass)} className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600">{showPass ? <EyeOff className="w-5 h-5"/> : <Eye className="w-5 h-5"/>}</button>
            </div>
            <div className="flex justify-end"><button onClick={() => setShowForgot(true)} className="text-xs font-bold text-blue-600 hover:underline">Forgot Password?</button></div>
            <button onClick={handleSubmit} disabled={loading} className="w-full bg-gray-900 text-white py-3.5 rounded-xl font-bold shadow-xl hover:bg-black transition-all flex justify-center items-center gap-2">{loading ? <Loader className="w-5 h-5 animate-spin"/> : 'Sign In'}</button>
          </div>
          <div className="mt-8 text-center"><button onClick={onSwitchToRegister} className="text-sm text-gray-500 font-semibold hover:text-gray-800">Don't have an account? <span className="text-blue-600">Register</span></button></div>
        </div>
        {showForgot && <ForgotPasswordModal onClose={() => setShowForgot(false)} />}
      </div>
    );
  };

  return (
    <>
      {view === 'reset' && <ResetPasswordScreen token={resetToken} onDone={() => setView('login')} />}
      {view === 'login' && <LoginComponent onLogin={(user) => { setUser(user); setView('dashboard'); }} onSwitchToRegister={() => setView('register')} />}
      {view === 'register' && <Register onBack={() => setView('login')} />}
      {view === 'dashboard' && user && <Dashboard user={user} onLogout={() => { setUser(null); setView('login'); }} />}
    </>
  );
}