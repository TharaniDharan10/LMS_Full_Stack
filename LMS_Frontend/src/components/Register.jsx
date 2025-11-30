import React, { useState } from 'react';
import { UserPlus, ArrowLeft, CheckCircle, AlertCircle, Loader, Send, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';

// --- STYLES ---
const registerStyles = `
  @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  .animate-fade-in { animation: fadeUp 0.6s ease-out forwards; }
  .library-bg {
    background-image: url('https://images.unsplash.com/photo-1568667256549-094345857637?q=80&w=2515&auto=format&fit=crop');
    background-size: cover; background-position: center;
  }
  .glass-card {
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(14px);
    border: 1px solid rgba(255, 255, 255, 0.6);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  }
`;

// --- HELPER: PHONE INPUT ---
const CountryPhoneInput = ({ value, onChange, disabled }) => {
  const countries = [ { code: "+91", flag: "🇮🇳", limit: 10 }, { code: "+1",  flag: "🇺🇸", limit: 10 }, { code: "+44", flag: "🇬🇧", limit: 10 } ];
  const initialCode = value && value.includes('-') ? value.split('-')[0] : "+91";
  const initialNum = value && value.includes('-') ? value.split('-')[1] : value || "";
  const [selectedCode, setSelectedCode] = useState(initialCode);
  const [number, setNumber] = useState(initialNum);

  const handleNumberChange = (e) => {
      const val = e.target.value.replace(/\D/g, '');
      const currentLimit = countries.find(c => c.code === selectedCode)?.limit || 10;
      if (val.length <= currentLimit) {
          setNumber(val);
          onChange(`${selectedCode}-${val}`); 
      }
  };

  return (
      <div className="flex gap-2">
          <div className="relative w-24">
            <select 
                value={selectedCode} 
                disabled={disabled}
                onChange={(e) => { setSelectedCode(e.target.value); setNumber(""); onChange(`${e.target.value}-`); }}
                className="w-full h-full pl-2 pr-1 py-3 bg-white border border-gray-200 rounded-xl text-gray-700 outline-none text-sm font-medium shadow-sm focus:border-blue-500 disabled:bg-gray-100"
            >
                {countries.map(c => <option key={c.code} value={c.code}>{c.flag} {c.code}</option>)}
            </select>
          </div>
          <input 
              type="text" value={number} onChange={handleNumberChange} disabled={disabled} placeholder="Phone Number"
              className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-700 outline-none shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder-gray-400 disabled:bg-gray-100" 
          />
      </div>
  );
};

export const Register = ({ onBack }) => {
  const [formData, setFormData] = useState({ userName: '', email: '', phoneNo: '', address: '', password: '' });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  // --- OTP STATE ---
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);

  // 1. SEND OTP (MOCK ECHO)
  const handleSendOtp = async () => {
    // Basic length check
    if (!formData.phoneNo || formData.phoneNo.length < 12) { 
        setMessage({ type: 'error', text: 'Invalid Phone Number' });
        return;
    }

    setOtpLoading(true);
    setMessage({ type: '', text: '' });

    try {
        const res = await api.sendOtp(formData.phoneNo);
        const data = await res.json(); 
        
        if (data.otp) {
            // --- AUTO-FILL MAGIC ---
            setOtp(data.otp); // <--- This fills the box automatically!
            setIsOtpSent(true);
            setMessage({ type: 'success', text: 'OTP Auto-filled for Demo Mode!' });
        } else {
            setMessage({ type: 'error', text: 'Failed to generate OTP.' });
        }
    } catch (e) {
        console.error(e);
        setMessage({ type: 'error', text: 'Connection failed.' });
    } finally {
        setOtpLoading(false);
    }
  };

  // 2. VERIFY OTP
  const handleVerifyOtp = async () => {
    if (!otp) return;
    setOtpLoading(true);
    try {
        const res = await api.verifyOtp(formData.phoneNo, otp);
        await res.text();
        
        if (res.ok) {
            setIsPhoneVerified(true);
            setMessage({ type: 'success', text: 'Phone Verified Successfully!' });
            setIsOtpSent(false); // Hide OTP box
        } else {
            setMessage({ type: 'error', text: 'Invalid OTP. Please try again.' });
        }
    } catch (e) {
        setMessage({ type: 'error', text: 'Verification failed.' });
    } finally {
        setOtpLoading(false);
    }
  };

  // 3. REGISTER
  const handleSubmit = async () => {
    if (!isPhoneVerified) {
        setMessage({ type: 'error', text: 'You must verify your phone number first.' });
        return;
    }
    
    // Email & Password Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) { setMessage({ type: 'error', text: 'Invalid Email' }); return; }
    const strongPwd = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if(!strongPwd.test(formData.password)) { setMessage({type:'error', text:'Password must be 8+ chars (Upper, Number, Special)'}); return; }

    setLoading(true);
    try {
      const response = await api.registerStudent(formData);
      if (response.ok) {
        setMessage({ type: 'success', text: 'Registration Successful! Redirecting...' });
        setFormData({ userName: '', email: '', phoneNo: '', address: '', password: '' });
        setTimeout(onBack, 2000);
      } else {
        const error = await response.text();
        setMessage({ type: 'error', text: error || 'Registration failed' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Server connection error.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
      <style>{registerStyles}</style>
      <div className="fixed inset-0 z-0 library-bg"></div>
      <div className="fixed inset-0 z-0 bg-gradient-to-br from-blue-900/40 to-purple-900/40 backdrop-blur-[2px]"></div>

      <div className="relative z-10 w-full max-w-md">
        <div className="glass-card rounded-2xl p-8 sm:p-10 animate-fade-in">
          
          <div className="text-center mb-6">
            <div className="inline-flex p-3 rounded-full bg-blue-600 shadow-lg shadow-blue-600/30 mb-4">
                <UserPlus className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 tracking-tight">Student Registration</h2>
          </div>
          
          {message.text && (
            <div className={`flex items-start gap-3 px-4 py-3 rounded-xl mb-6 text-sm font-medium shadow-sm border ${message.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
              {message.type === 'success' ? <CheckCircle className="w-5 h-5 shrink-0"/> : <AlertCircle className="w-5 h-5 shrink-0"/>}
              <p className="mt-0.5">{message.text}</p>
            </div>
          )}
          
          <div className="space-y-4">
            <input type="text" placeholder="Username" value={formData.userName} onChange={(e) => setFormData({...formData, userName: e.target.value})} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-700 outline-none shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder-gray-400" />
            <input type="email" placeholder="Email Address" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-700 outline-none shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder-gray-400" />

           {/* --- PHONE & OTP SECTION --- */}
            <div className="space-y-2 p-3 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex items-center gap-2">
                    <div className="flex-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase ml-1 mb-0.5 block">Phone Number</label>
                        <CountryPhoneInput value={formData.phoneNo} onChange={(val) => setFormData({...formData, phoneNo: val})} disabled={isPhoneVerified} />
                    </div>
                    
                    {/* SMALLER VERIFICATION BUTTON */}
                    {!isPhoneVerified && !isOtpSent && (
                        <button 
                            onClick={handleSendOtp} 
                            disabled={otpLoading} 
                            className="h-[42px] mt-4 px-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center shadow-sm"
                            title="Get OTP"
                        >
                            {otpLoading ? <Loader className="w-4 h-4 animate-spin"/> : <Send className="w-4 h-4"/>}
                        </button>
                    )}
                    
                    {/* VERIFIED BADGE */}
                    {isPhoneVerified && (
                        <div className="h-[42px] mt-4 px-3 bg-green-100 text-green-600 rounded-lg border border-green-200 flex items-center justify-center">
                            <ShieldCheck className="w-5 h-5"/>
                        </div>
                    )}
                </div>

                {/* OTP INPUT (Auto-fills now) */}
                {isOtpSent && !isPhoneVerified && (
                    <div className="flex gap-2 animate-fade-in mt-2 items-center">
                        <input 
                            type="text" 
                            placeholder="OTP" 
                            value={otp} 
                            onChange={e=>setOtp(e.target.value)} 
                            className="w-24 px-2 py-2 border border-blue-300 rounded-lg outline-none text-center tracking-widest font-mono font-bold text-lg focus:ring-2 focus:ring-blue-500 bg-white" 
                        />
                        <button 
                            onClick={handleVerifyOtp} 
                            disabled={otpLoading} 
                            className="flex-1 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 text-sm shadow-sm"
                        >
                           {otpLoading ? '...' : 'Verify Now'}
                        </button>
                    </div>
                )}
            

                {/* OTP INPUT FIELD (Shown only when OTP sent but not verified) */}
                {isOtpSent && !isPhoneVerified && (
                    <div className="flex gap-2 animate-fade-in mt-2">
                        <input type="text" placeholder="Enter OTP" value={otp} onChange={e=>setOtp(e.target.value)} className="flex-1 px-4 py-2 border border-blue-300 rounded-lg outline-none text-center tracking-widest font-mono font-bold text-lg focus:ring-2 focus:ring-blue-500" />
                        <button onClick={handleVerifyOtp} disabled={otpLoading} className="px-6 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700">
                           {otpLoading ? '...' : 'Verify'}
                        </button>
                    </div>
                )}
            </div>
            {/* --------------------------- */}

            <input type="text" placeholder="Address" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-700 outline-none shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder-gray-400" />
            
            <div className="space-y-1">
                <input type="password" placeholder="Password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-700 outline-none shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder-gray-400" />
                <p className="text-[10px] text-gray-400 ml-1">Min 8 chars, 1 Upper, 1 Number, 1 Special</p>
            </div>
            
            <button 
                onClick={handleSubmit} 
                disabled={loading || !isPhoneVerified} 
                className={`w-full py-3.5 rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2 mt-2 
                ${isPhoneVerified 
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-blue-600/50 active:scale-[0.98]' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
            >
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