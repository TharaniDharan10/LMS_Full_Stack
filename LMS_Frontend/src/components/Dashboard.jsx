import  { useState, useEffect, useRef } from 'react';
import { BookOpen, LogOut, Search, Plus, Book, ArrowLeftRight, UserPlus, Clock, Trash2, Sparkles, User, Feather, X, QrCode, Download, TrendingUp, Users, PieChart as PieIcon, Edit2, ShieldCheck, Wallet, Camera, MessageSquare, Send, Sun, Moon, Image as ImageIcon, FileText, Star, Award} from 'lucide-react'; 
import { api } from '../services/api';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { QRCodeCanvas } from 'qrcode.react'; 
import { QrReader } from 'react-qr-reader'; 

// --- 1. CSS STYLES ---
const dashboardStyles = `
  @keyframes moveThrough { 0% { transform: scale(1.1); } 100% { transform: scale(1.3); } }
  .library-aisle-bg {
    background-image: url('https://images.unsplash.com/photo-1521587760476-6c12a4b040da?q=80&w=2070&auto=format&fit=crop');
    background-size: cover; background-position: center; animation: moveThrough 60s linear infinite alternate;
  }
  .firefly { position: absolute; width: 3px; height: 3px; background: #fbbf24; border-radius: 50%; box-shadow: 0 0 8px 2px rgba(252, 211, 77, 0.6); opacity: 0; animation: float 8s ease-in-out infinite; }
  @keyframes float { 0%, 100% { transform: translateY(0) translateX(0); opacity: 0; } 20%, 80% { opacity: 1; } 50% { transform: translateY(-40px) translateX(20px); } }
  
  .custom-scroll::-webkit-scrollbar { width: 6px; }
  .custom-scroll::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); }
  .custom-scroll::-webkit-scrollbar-thumb { background: rgba(59, 130, 246, 0.3); border-radius: 10px; }
  
  .manuscript-paper {
    background-color: #fdf6e3; 
    background-image: 
        url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='rgba(139, 69, 19, 0.15)'%3E%3Cpath d='M12 2c-4.97 0-9 4.03-9 9 0 1.59.45 3.08 1.23 4.37L2.5 17.13c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0l1.74-1.74C7.34 18.65 9.56 20 12 20s4.66-1.35 6.35-3.2l1.74 1.74c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41l-1.73-1.76C20.55 14.08 21 12.59 21 11c0-4.97-4.03-9-9-9zm-3 12c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm6 0c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm6 0c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z'/%3E%3Cpath d='M14 11a2 2 0 1 1-4 0 2 2 0 0 1 4 0z' fill='black' opacity='0.1'/%3E%3Cpath d='M4 4l16 16' stroke='rgba(139, 69, 19, 0.15)' stroke-width='2'/%3E%3C/svg%3E"),
        radial-gradient(#dcc096 1px, transparent 1px);
    background-size: 50% auto, 20px 20px;
    background-repeat: no-repeat, repeat;
    background-position: center center, center;
    box-shadow: inset 0 0 40px 10px rgba(101, 67, 33, 0.5), 0 20px 50px rgba(0,0,0,0.8);
    border: 1px solid #8b4513;
    color: #3d2b1f;
    font-family: 'Georgia', serif;
  }

  @keyframes popIn { 0% { transform: scale(0); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
  .chat-bubble { animation: popIn 0.3s ease-out; }
`;

// --- 2. HELPER COMPONENTS ---

// 3D TILT COVER COMPONENT
const TiltCover = ({ src, onClick }) => {
    const cardRef = useRef(null);

    const handleMove = (e) => {
        const card = cardRef.current;
        if (!card) return;
        const { left, top, width, height } = card.getBoundingClientRect();
        const x = e.clientX - left;
        const y = e.clientY - top;
        const centerX = width / 2;
        const centerY = height / 2;
        const rotateX = ((y - centerY) / centerY) * -20; 
        const rotateY = ((x - centerX) / centerX) * 20;
        card.style.setProperty('--rx', `${rotateX}deg`);
        card.style.setProperty('--ry', `${rotateY}deg`);
    };

    const handleLeave = () => {
        const card = cardRef.current;
        if (card) {
            card.style.setProperty('--rx', `0deg`);
            card.style.setProperty('--ry', `0deg`);
        }
    };

    return (
        <div 
            ref={cardRef}
            className="w-32 h-full relative flex-none z-20 cursor-zoom-in perspective-container"
            onMouseMove={handleMove}
            onMouseLeave={handleLeave}
            onClick={onClick}
            style={{ perspective: '1000px' }}
        >
            <img 
                src={src} 
                alt="Cover" 
                className="w-full h-full object-cover rounded-r-2xl shadow-lg"
                style={{
                    transform: 'rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg)) scale(1.05)',
                    transition: 'transform 0.1s ease-out',
                    willChange: 'transform',
                    boxShadow: '0 15px 35px rgba(0,0,0,0.3)'
                }}
            />
        </div>
    );
};

const GlassCard = ({ children, className = "", onClick, darkMode }) => (
  <div 
    onClick={onClick} 
    className={`relative group rounded-2xl p-[1px] shadow-xl overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl ${onClick ? 'cursor-pointer' : ''} ${className}
      ${darkMode 
        ? 'bg-gradient-to-br from-cyan-900/40 via-blue-900/40 to-purple-900/40' 
        : 'bg-gradient-to-br from-white/60 via-blue-50/60 to-purple-50/60 border border-white/40'}`}
  >
    <div className={`relative h-full w-full backdrop-blur-xl rounded-2xl overflow-hidden transition-colors 
      ${darkMode ? 'bg-gray-900/80 hover:bg-gray-900/70' : 'bg-white/70 hover:bg-white/80'}`}>
      {darkMode && <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>}
      {children}
    </div>
  </div>
);

const Fireflies = () => ( <div className="absolute inset-0 overflow-hidden pointer-events-none z-0"> {Array.from({ length: 15 }).map((_, i) => ( <div key={i} className="firefly" style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 10}s`, animationDuration: `${10 + Math.random() * 10}s` }} /> ))} </div> );

const ModalWrapper = ({ children, title, Icon, color, darkMode }) => (
    <div className={`fixed inset-0 z-[60] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in ${darkMode ? 'bg-black/80' : 'bg-black/30'}`}>
        <div className={`w-full max-w-md transform transition-all rounded-2xl shadow-2xl border relative overflow-hidden ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-white'}`}>
             <div className="p-8 relative z-10">
                <h3 className={`text-2xl font-bold mb-6 flex items-center gap-3 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    <Icon className={`w-6 h-6 ${color === 'green' ? 'text-green-500' : 'text-purple-500'}`} />{title}
                </h3>
                {children}
            </div>
        </div>
    </div>
);

const CountryPhoneInput = ({ value, onChange, darkMode }) => {
    const countries = [ { code: '+91', flag: '🇮🇳', len: 10 }, { code: '+1', flag: '🇺🇸', len: 10 }, { code: '+44', flag: '🇬🇧', len: 10 } ];
    const initialCode = value && value.includes('-') ? value.split('-')[0] : "+91";
    const initialNum = value && value.includes('-') ? value.split('-')[1] : value || "";
    const [code, setCode] = useState(initialCode);
    const [number, setNumber] = useState(initialNum);
    const handleNumChange = (e) => {
        const val = e.target.value.replace(/\D/g, '');
        const limit = countries.find(c => c.code === code)?.len || 10;
        if (val.length <= limit) { setNumber(val); onChange(`${code}-${val}`); }
    };
    return (
        <div className="flex gap-2">
            <select value={code} onChange={e=>{setCode(e.target.value); setNumber(""); onChange(`${e.target.value}-`)}} className={`w-24 px-2 py-2 rounded-lg border outline-none ${darkMode ? 'bg-black/30 border-white/10 text-white' : 'bg-gray-50 border-gray-300 text-gray-800'}`}>
                {countries.map(c => <option key={c.code} value={c.code} className="text-black">{c.flag} {c.code}</option>)}
            </select>
            <input type="text" placeholder="Phone" value={number} onChange={handleNumChange} className={`flex-1 px-4 py-2 rounded-lg border outline-none ${darkMode ? 'bg-black/30 border-white/10 text-white' : 'bg-gray-50 border-gray-300 text-gray-800'}`}/>
        </div>
    );
};

// --- 3. AI LIBRARIAN ---
const AILibrarian = ({ isOpen, toggle, books, darkMode }) => {
    const [messages, setMessages] = useState([{ text: "Greetings! I am the Archive Guardian.", sender: 'bot' }]);
    const [input, setInput] = useState('');
    const scrollRef = useRef(null);

    useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [messages, isOpen]);

    const handleSend = () => {
        if (!input.trim()) return;
        const userMsg = input.trim();
        setMessages(prev => [...prev, { text: userMsg, sender: 'user' }]);
        setInput('');
        setTimeout(() => {
            const reply = generateResponse(userMsg, books);
            setMessages(prev => [...prev, { text: reply, sender: 'bot' }]);
        }, 600);
    };

    const formatBookCard = (b) => {
        const statusIcon = (b.user !== null && b.user !== undefined) ? "🔴 Issued" : "🟢 Available";
        const author = b.author?.name || b.authorName || 'Unknown';
        return `📖 **${b.bookTitle}**\n✍️ By: ${author}\n🏷️ ${b.bookType}\nRunning Status: ${statusIcon}`;
    };

    const generateResponse = (rawMsg, libraryBooks) => {
        const msg = rawMsg.toLowerCase().trim();
        const cleanMsg = msg.replace(/[?.,!]/g, '');

        if (!libraryBooks || libraryBooks.length === 0) return "I cannot access the archives. Data not loaded.";

        // --- FIX 1: IMPROVED CONVERSATIONAL COMMANDS ---
        if (['bye', 'thanks', 'thank you', 'goodbye', 'got it'].some(w => cleanMsg.includes(w))) {
            return "You are welcome. May the archives be with you!";
        }
        
        // --- FIX 2: IMPROVED POLICY/FINE CHECK ---
        if (['fine', 'cost', 'charge', 'validity', 'due date', 'policy', 'late fee', 'how long', 'duration'].some(w => cleanMsg.includes(w))) {
            return "💰 Policy: Books are due in 14 days. Fines apply after that (e.g., ₹50/day).";
        }
        
        // --- FIX 3: Prioritize Greeting check for exact matches ONLY ---
        if (['hi', 'hello', 'hey', 'greetings'].some(w => msg === w)) {
            return "Hello! How can I assist you today?";
        }
        
        // --- FIX 4: IMPROVED SEARCH KEYWORD EXTRACTION ---
        // Target specific phrases to know what to search for.
        let searchPhrase = rawMsg;
        if (msg.includes('who wrote') || msg.includes('author of')) {
            // If the query is "who wrote X", search for X.
            searchPhrase = msg.replace(/^(who wrote|who is the author of|author of|wrote|who is|by)/g, '').trim();
        } else if (['search', 'find', 'have'].some(w => msg.startsWith(w))) {
            // If the query is "find X", search for X.
            searchPhrase = msg.replace(/^(find|search|have|got)/g, '').trim();
        } else {
            // General query. Remove only articles/linking verbs for broad search.
            searchPhrase = cleanMsg.replace(/(is|the|book|available|a|an|me|does|have|about)/g, '').trim();
        }
        
        const searchKeywords = searchPhrase.toLowerCase();

        if (searchKeywords.length >= 2) {
            const matches = libraryBooks.filter(b => {
                const titleMatch = b.bookTitle.toLowerCase().includes(searchKeywords);
                const authorMatch = (b.author?.name || b.authorName || '').toLowerCase().includes(searchKeywords);
                return titleMatch || authorMatch;
            });
            
            if (matches.length > 0) {
                const limit = 3; 
                const display = matches.slice(0, limit).map(b => formatBookCard(b)).join('\n\n────────────────\n\n');
                return `Here is what I found for '${searchKeywords}':\n\n${display}`;
            }
        }
        
        // --- DEFAULT FALLBACK ---
        return `I couldn't find a match for '${searchKeywords}'. Please try asking for a specific title or author.`;
    };

    if (!isOpen) return (<button onClick={toggle} className="fixed bottom-6 right-6 p-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full shadow-2xl text-white z-50 hover:scale-110 transition-transform animate-bounce"><MessageSquare className="w-7 h-7" /></button>);

    return (
        <div className={`fixed bottom-6 right-6 w-80 md:w-96 h-[500px] z-50 flex flex-col rounded-2xl overflow-hidden border shadow-2xl ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="flex-none p-4 border-b border-white/10 flex justify-between items-center bg-gradient-to-r from-blue-600 to-purple-600">
                <div className="flex items-center gap-3"><Sparkles className="w-5 h-5 text-yellow-300"/><h4 className="font-bold text-white">AI Librarian</h4></div>
                <button onClick={toggle}><X className="w-5 h-5 text-white/80 hover:text-white"/></button>
            </div>
            <div ref={scrollRef} className={`flex-1 min-h-0 overflow-y-auto p-4 space-y-4 custom-scroll ${darkMode ? 'bg-black/20' : 'bg-gray-50'}`}>
                {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] p-3 text-sm shadow-sm rounded-2xl ${m.sender === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : (darkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-800 border border-gray-200') + ' rounded-tl-none'}`}>
                            <p className="whitespace-pre-line leading-relaxed">{m.text}</p>
                        </div>
                    </div>
                ))}
            </div>
            <div className={`flex-none p-3 border-t ${darkMode ? 'border-white/10 bg-black/20' : 'border-gray-200 bg-white'} flex gap-2`}>
                <input value={input} onChange={e => setInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSend()} placeholder="Ask about books..." className={`flex-1 border rounded-xl px-4 py-2.5 text-sm outline-none ${darkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-gray-100 border-gray-200 text-gray-800'}`} />
                <button onClick={handleSend} className="p-2.5 bg-blue-600 rounded-xl text-white hover:bg-blue-700 transition"><Send className="w-4 h-4"/></button>
            </div>
        </div>
    );
};

// --- 4. MODALS ---
const PdfReaderModal = ({ url, onClose }) => {
    if (!url) return null;
    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/95 backdrop-blur-lg animate-fade-in" onClick={onClose}>
            <div className="relative w-full max-w-5xl h-[90vh] bg-gray-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-gray-700" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b border-gray-700 bg-gray-800">
                    <h3 className="text-white font-bold flex items-center gap-2"><BookOpen className="w-5 h-5 text-blue-400"/> E-Book Reader</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><X className="w-6 h-6"/></button>
                </div>
                <iframe src={url} className="flex-1 w-full h-full bg-white" title="PDF Reader"></iframe>
            </div>
        </div>
    );
};

const EditProfileModal = ({ user, onClose, onUpdate, darkMode }) => {
    const [formData, setFormData] = useState({ name: user.name || '', phoneNo: user.phoneNo || '', address: user.address || '' });
    const [message, setMessage] = useState('');
    const handleSubmit = async () => { try { const res = await api.updateProfile(formData, user); if(res.ok) { const updatedUser = await res.json(); setMessage('Updated!'); onUpdate(updatedUser); setTimeout(onClose, 1500); } else { setMessage('Failed'); } } catch(e) { setMessage('Connection error'); } };
    const inputClass = `w-full px-4 py-2 rounded-lg border outline-none ${darkMode ? 'bg-black/30 border-white/10 text-white' : 'bg-gray-50 border-gray-300 text-gray-800'}`;
    return (<ModalWrapper title="Edit Profile" Icon={Edit2} color="purple" darkMode={darkMode}>{message && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded text-sm">{message}</div>}<div className="space-y-4"><div><label className="text-xs opacity-60">Full Name</label><input value={formData.name} onChange={e=>setFormData({...formData, name:e.target.value})} className={inputClass}/></div><div><label className="text-xs opacity-60">Phone</label><CountryPhoneInput value={formData.phoneNo} onChange={val=>setFormData({...formData, phoneNo:val})} darkMode={darkMode} /></div><div><label className="text-xs opacity-60">Address</label><input value={formData.address} onChange={e=>setFormData({...formData, address:e.target.value})} className={inputClass}/></div><div className="flex gap-2 mt-2"><button onClick={handleSubmit} className="flex-1 py-2 bg-purple-600 text-white rounded-lg font-bold">Save</button><button onClick={onClose} className={`flex-1 py-2 rounded-lg font-bold ${darkMode ? 'bg-white/10' : 'bg-gray-200'}`}>Cancel</button></div></div></ModalWrapper>);
};

// --- 4. MODALS ---

// --- NEW: IMAGE PREVIEW WITH 3D TILT ---
const ImagePreviewModal = ({ src, onClose }) => {
    const [rotate, setRotate] = useState({ x: 0, y: 0 });
    
    const handleMouseMove = (e) => {
        const { width, height, left, top } = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - left;
        const y = e.clientY - top;
        const xPct = (x / width) - 0.5;
        const yPct = (y / height) - 0.5;
        // Sensitivity: 25 degrees
        setRotate({ x: -yPct * 25, y: xPct * 25 });
    };

    if (!src) return null;
    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/95 backdrop-blur-lg animate-fade-in" onClick={onClose}>
            <div className="relative w-full max-w-xl flex justify-center perspective-[1000px]">
                <img 
                    src={src} 
                    alt="Full Cover" 
                    className="max-h-[85vh] max-w-full rounded-lg shadow-2xl object-contain transition-transform duration-75 ease-linear cursor-move"
                    style={{
                        transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) scale(1.05)`,
                        boxShadow: `${-rotate.y}px ${rotate.x}px 30px rgba(255,255,255,0.15)`
                    }}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={() => setRotate({x:0, y:0})}
                    onClick={(e) => e.stopPropagation()} 
                />
                <button onClick={onClose} className="absolute -top-12 right-0 p-2 bg-white/10 rounded-full text-white hover:bg-red-600 transition"><X className="w-8 h-8" /></button>
            </div>
        </div>
    );
};

const QrPrintModal = ({ book, onClose, darkMode }) => { 
    
    const downloadQr = () => { 
        const canvas = document.getElementById("qr-code-canvas"); 
        if(canvas) { 
            const pngUrl = canvas.toDataURL("image/png"); 
            const downloadLink = document.createElement("a"); 
            
            // --- NEW FILENAME LOGIC: BOOKNAME_AUTHOR_BOOKTYPE_BOOKNUMBER ---
            
            // 1. Get and clean data (removes spaces/special chars, limits length)
            const bookTitle = book.bookTitle || 'UnknownTitle';
            const authorName = book.author?.name || book.authorName || 'UnknownAuthor';
            
            const safeTitle = bookTitle.replace(/[^a-zA-Z0-9]/g, '').substring(0, 30);
            const safeAuthor = authorName.replace(/[^a-zA-Z0-9]/g, '').substring(0, 20);
            const safeType = book.bookType ? book.bookType.substring(0, 10) : 'GEN';
            const safeNo = book.bookNo;

            // 2. Set the download filename
            downloadLink.download = `${safeTitle}_${safeAuthor}_${safeType}_${safeNo}.png`; 
            
            // ---------------------------------------------------------------
            
            downloadLink.href = pngUrl; 
            
            document.body.appendChild(downloadLink); 
            downloadLink.click(); 
            document.body.removeChild(downloadLink); 
        } 
    }; 

    // Note: The original component had an issue where 'book' was not defined in the scope of downloadQr 
    // unless it was passed explicitly or defined as a closure. This structure is the correct way 
    // to use the component's prop variables within its helper functions.
    
    return (
        <ModalWrapper title="Print Label" Icon={QrCode} color="purple" darkMode={darkMode}>
            <div className="flex flex-col items-center justify-center space-y-6">
                <div className="bg-white p-4 rounded-xl shadow-lg transform hover:scale-105 transition duration-300">
                    <QRCodeCanvas id="qr-code-canvas" value={book.bookNo} size={200} level={"H"} includeMargin={true} />
                </div>
                <div className={`text-center ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    <h4 className="font-bold text-lg">{book.bookTitle}</h4>
                    <p className="opacity-60 font-mono text-sm mt-1">REF: {book.bookNo}</p>
                </div>
                <div className="flex gap-3 w-full">
                    <button onClick={downloadQr} className="flex-1 py-3 bg-green-600 hover:bg-green-500 rounded-xl font-bold text-white flex items-center justify-center gap-2">
                        <Download className="w-4 h-4"/> PNG
                    </button>
                    <button onClick={onClose} className={`flex-1 py-3 rounded-xl font-bold ${darkMode ? 'bg-white/10 text-white' : 'bg-gray-200 text-gray-800'}`}>
                        Close
                    </button>
                </div>
            </div>
        </ModalWrapper>
    ); 
};

const BookDetailModal = ({ book, onClose }) => { if(!book) return null; return (<div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in" onClick={onClose}><div className="w-full max-w-lg relative transform transition-all hover:scale-[1.01]" onClick={e=>e.stopPropagation()}><div className="manuscript-paper p-12 relative min-h-[650px] flex flex-col"><div className="text-center border-b-2 border-[#2a150a]/40 pb-4 mb-6 relative z-10"><h2 className="text-4xl font-bold uppercase tracking-widest leading-tight">{book.bookTitle}</h2><div className="flex justify-center items-center gap-2 mt-3 italic text-lg"><Feather className="w-5 h-5"/><span>{book.author?.name||book.authorName||'Unknown Author'}</span></div></div><div className="flex-grow overflow-y-auto custom-scroll pr-4 relative z-10"><h4 className="text-sm font-bold uppercase tracking-widest opacity-70 mb-3">Synopsis</h4><p className="text-xl leading-relaxed text-justify font-serif">{book.summary||"The pages of this ancient tome are too charred to read a summary..."}</p></div><div className="mt-8 pt-4 border-t border-[#2a150a]/40 flex justify-between text-base font-bold relative z-10"><span className="bg-[#2a150a]/10 px-3 py-1 rounded-sm">Ref: {book.bookNo}</span><span className="bg-[#2a150a]/10 px-3 py-1 rounded-sm">Cost: ₹{book.securityAmount}</span></div><button onClick={onClose} className="absolute top-6 right-6 text-[#2a150a] hover:text-red-900 transition-colors hover:scale-110 z-20"><X className="w-8 h-8" strokeWidth={3}/></button></div></div></div>); };
const AdminRegisterModal = ({ user, onClose, darkMode }) => { const [formData, setFormData] = useState({}); const [message, setMessage] = useState({}); const handleSubmit = async () => { try { const res = await api.registerAdmin(formData, user); if(res.ok){setMessage({type:'success',text:'Success'}); setTimeout(onClose,1000);} else {setMessage({type:'error',text:'Failed'});} } catch(e){setMessage({type:'error',text:'Error'});} }; const inputClass = `w-full px-4 py-2 rounded-lg border outline-none ${darkMode ? 'bg-black/30 border-white/10 text-white' : 'bg-gray-50 border-gray-300 text-gray-800'}`; return (<ModalWrapper title="New Admin" Icon={UserPlus} color="purple" darkMode={darkMode}><div className="space-y-3"><input placeholder="Name" className={inputClass} onChange={e=>setFormData({...formData,userName:e.target.value})}/><input placeholder="Email" className={inputClass} onChange={e=>setFormData({...formData,email:e.target.value})}/><CountryPhoneInput value={formData.phoneNo} onChange={val=>setFormData({...formData,phoneNo:val})} darkMode={darkMode}/><input placeholder="Address" className={inputClass} onChange={e=>setFormData({...formData,address:e.target.value})}/><input type="password" placeholder="Password" className={inputClass} onChange={e=>setFormData({...formData,password:e.target.value})}/><div className="flex gap-2 mt-4"><button onClick={handleSubmit} className="flex-1 py-2 bg-purple-600 text-white rounded-lg font-bold">Register</button><button onClick={onClose} className={`flex-1 py-2 rounded-lg font-bold ${darkMode ? 'bg-white/10' : 'bg-gray-200'}`}>Cancel</button></div></div></ModalWrapper>); };
const AddBookModal = ({ user, onClose, onSuccess, darkMode }) => { const [formData, setFormData] = useState({bookType:'PROGRAMMING'}); const [message, setMessage] = useState(''); const handleSubmit = async () => { try{const res=await api.addBook(user,{...formData, securityAmount:Number(formData.securityAmount)}); if(res.ok){setMessage('Added');setTimeout(()=>{onSuccess();onClose();},1000);}else{setMessage('Failed');}}catch(e){setMessage('Error');} }; const inputClass = `w-full px-4 py-2 rounded-lg border outline-none ${darkMode ? 'bg-black/30 border-white/10 text-white' : 'bg-gray-50 border-gray-300 text-gray-800'}`; return (<ModalWrapper title="Add Book" Icon={Plus} color="green" darkMode={darkMode}>{message && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded text-sm">{message}</div>}<div className="space-y-3"><input placeholder="Title" onChange={e=>setFormData({...formData,bookTitle:e.target.value})} className={inputClass}/><div className="flex gap-2"><input placeholder="Image URL" onChange={e=>setFormData({...formData,imageUrl:e.target.value})} className={`w-1/2 ${inputClass}`}/><input placeholder="PDF URL" onChange={e=>setFormData({...formData,pdfUrl:e.target.value})} className={`w-1/2 ${inputClass}`}/></div><div className="flex gap-2"><input placeholder="No" onChange={e=>setFormData({...formData,bookNo:e.target.value})} className={`w-1/2 ${inputClass}`}/><input placeholder="Price" onChange={e=>setFormData({...formData,securityAmount:e.target.value})} className={`w-1/2 ${inputClass}`}/></div><select onChange={e=>setFormData({...formData,bookType:e.target.value})} className={inputClass}><option value="PROGRAMMING">Programming</option><option value="HISTORY">History</option><option value="ENGLISH">English</option></select><input placeholder="Author" onChange={e=>setFormData({...formData,authorName:e.target.value})} className={inputClass}/><input placeholder="Author Email" onChange={e=>setFormData({...formData,authorEmail:e.target.value})} className={inputClass}/><textarea placeholder="Summary..." onChange={e=>setFormData({...formData,summary:e.target.value})} className={`h-20 ${inputClass}`}/><div className="flex gap-2"><button onClick={handleSubmit} className="flex-1 py-2 bg-green-600 text-white rounded-lg font-bold">Add</button><button onClick={onClose} className={`flex-1 py-2 rounded-lg font-bold ${darkMode ? 'bg-white/10' : 'bg-gray-200'}`}>Cancel</button></div></div></ModalWrapper>); };
const PaymentModal = ({ amount, onConfirm, onCancel }) => { const [processing, setProcessing] = useState(false); const handlePay = () => { setProcessing(true); setTimeout(() => { onConfirm(`pay_mock_${Math.random().toString(36).substr(2,9)}`); }, 2000); }; return (<div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"><div className="bg-white rounded-2xl w-full max-w-sm p-6 relative"><h3 className="text-xl font-bold mb-4 text-black">Total: ₹{amount}</h3><button onClick={handlePay} disabled={processing} className="w-full py-3 bg-blue-600 text-white rounded font-bold">{processing ? "Processing..." : "Pay Now"}</button><button onClick={onCancel} className="w-full mt-2 text-gray-500">Cancel</button></div></div>); };
const TransactionModal = ({ type, user, isAdmin, initialBookNo, onClose, onSuccess, books, darkMode }) => { const [formData, setFormData] = useState({userEmail:isAdmin?'':(user.email||user.username),bookNo:initialBookNo||''}); const [message, setMessage] = useState(''); const [showPayment, setShowPayment] = useState(false); const [amountToPay, setAmountToPay] = useState(0); const [scanMode, setScanMode] = useState(false); const handleScanResult = (result) => { if (result) { const audio = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg'); audio.play().catch(e=>{}); setFormData(prev => ({ ...prev, bookNo: result?.text })); setScanMode(false); setMessage({ type: 'success', text: `Scanned: ${result?.text}` }); } }; const initiateTransaction = () => { if(!formData.userEmail || !formData.bookNo) { setMessage({ type: 'error', text: 'Fill fields' }); return; } if (type === 'issue') { const targetBook = books?.find(b => b.bookNo === formData.bookNo); const price = targetBook ? targetBook.securityAmount : 200; setAmountToPay(price); setShowPayment(true); } else { processTransaction(null); } }; const processTransaction = async (paymentId) => { setShowPayment(false); setMessage({ type: 'info', text: 'Processing...' }); try { const endpoint = type === 'issue' ? api.issueBook : api.returnBook; const response = await endpoint(user, { ...formData, paymentId }); if (response.ok) { const data = await response.json(); setMessage({ type: 'success', text: `Success!` }); setTimeout(() => { onSuccess(); onClose(); }, 2000); } else { const err = await response.text(); try { setMessage({ type: 'error', text: JSON.parse(err).message || err }); } catch(e) { setMessage({ type: 'error', text: err || 'Failed' }); } } } catch (err) { setMessage({ type: 'error', text: 'Connection error' }); } }; const inputClass = `w-full px-4 py-2 rounded-lg border outline-none ${darkMode ? 'bg-black/30 border-white/10 text-white' : 'bg-gray-50 border-gray-300 text-gray-800'}`; return (<>{showPayment && <PaymentModal amount={amountToPay} onConfirm={processTransaction} onCancel={() => setShowPayment(false)} />}{!showPayment && (<ModalWrapper title={`${type} Book`} Icon={type==='issue'?Sparkles:ArrowLeftRight} color="green" darkMode={darkMode}>{message.text && <div className={`mb-4 p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{message.text}</div>}{scanMode ? (<div className="relative h-64 bg-black rounded-lg overflow-hidden mb-4 border-2 border-green-500 shadow-lg"><QrReader onResult={handleScanResult} constraints={{ facingMode: 'environment' }} containerStyle={{ width: '100%', height: '100%' }} videoStyle={{ objectFit: 'cover' }} /><button onClick={() => setScanMode(false)} className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-red-600/80 rounded-full text-white transition"><X className="w-4 h-4"/></button></div>) : (<div className="space-y-4"><input value={formData.userEmail} onChange={e => setFormData({...formData, userEmail: e.target.value})} readOnly={!isAdmin} className={`${inputClass} ${!isAdmin ? 'opacity-50' : ''}`} placeholder="Student Email" /><div className="flex gap-2"><input value={formData.bookNo} onChange={e => setFormData({...formData, bookNo: e.target.value})} className={inputClass} placeholder="Book No" />{isAdmin && !initialBookNo && <button onClick={() => setScanMode(true)} className="p-2.5 bg-purple-600 text-white rounded-lg"><Camera className="w-5 h-5"/></button>}</div><div className="flex gap-2 mt-4"><button onClick={initiateTransaction} className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-bold capitalize">{type === 'issue' ? 'Pay & Issue' : 'Return'}</button><button onClick={onClose} className={`flex-1 py-2 rounded-lg font-bold ${darkMode ? 'bg-white/10 text-white' : 'bg-gray-200 text-gray-800'}`}>Cancel</button></div></div>)}</ModalWrapper>)}</>);};

// --- 5. MAIN DASHBOARD ---
export const Dashboard = ({ user, onLogout }) => {
  const [currentUser, setCurrentUser] = useState(user);
  useEffect(() => { setCurrentUser(user); }, [user]);

  const [activeTab, setActiveTab] = useState('profile');
  const [darkMode, setDarkMode] = useState(true);
  const [books, setBooks] = useState([]);
  const [transactions, setTransactions] = useState([]); 
  const [analytics, setAnalytics] = useState(null); 
  
  const [searchTitle, setSearchTitle] = useState('');
  const [searchType, setSearchType] = useState('');
  const [searchAuthor, setSearchAuthor] = useState('');
  const [searchStatus, setSearchStatus] = useState('');

  const [loading, setLoading] = useState(false);
  const [modals, setModals] = useState({ add: false, trans: false, admin: false, editProfile: false });
  const [transactionType, setTransactionType] = useState('issue');
  const [selectedBookNo, setSelectedBookNo] = useState('');
  const [viewingBook, setViewingBook] = useState(null);
  const [previewImage, setPreviewImage] = useState(null); // FOR IMAGE MODAL
  const [readingPdf, setReadingPdf] = useState(null);
  const [qrBook, setQrBook] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const isAdmin = (currentUser.userType === 'ADMIN') || (currentUser.authorities && currentUser.authorities.includes('ADMIN'));

    useEffect(() => {
        fetchBooks(); 
        if (activeTab === 'transactions' || activeTab === 'profile') fetchTransactions();
        if (activeTab === 'analytics' && isAdmin) fetchAnalytics();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab, searchType, searchAuthor, searchStatus]);

  // --- FIX: Added Function to Calculate Due Time ---
  const calculateDueStatus = (issueDateStr) => {
    const issueDate = new Date(issueDateStr);
    const dueDate = new Date(issueDate);
    dueDate.setDate(issueDate.getDate() + 14); 
    const today = new Date();
    const diffTime = dueDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { text: `Overdue by ${Math.abs(diffDays)} days`, color: 'text-red-400' };
    if (diffDays === 0) return { text: "Due Today", color: 'text-orange-400' };
    return { text: `${diffDays} Days left`, color: 'text-green-400' };
  };

  const fetchBooks = async () => { setLoading(true); try { const res = await api.getBooks(currentUser, searchTitle, searchType, searchAuthor, searchStatus); if (res.ok) setBooks(await res.json()); } catch (e) {} finally { setLoading(false); } };
  const fetchTransactions = async () => { setLoading(true); try { const res = await api.getTransactions(currentUser); if (res.ok) setTransactions(await res.json()); } catch (e) {} finally { setLoading(false); } };
  const fetchAnalytics = async () => { setLoading(true); try { const res = await api.getAnalytics(currentUser); if (res.ok) setAnalytics(await res.json()); } catch (e) {} finally { setLoading(false); } };
  const deleteBook = async (no) => { if(window.confirm(`Delete ${no}?`)) { await api.deleteBook(currentUser, no); fetchBooks(); } };
  const getActiveLoans = () => transactions.filter(t => t.transactionStatus === 'ISSUED' && t.user?.email === currentUser.email);
  const getTotalFines = () => transactions.filter(t => t.user?.email === currentUser.email && t.fineAmount > 0).reduce((acc, t) => acc + t.fineAmount, 0);
  const getPieData = () => analytics?.booksByType ? Object.keys(analytics.booksByType).map(key => ({ name: key, value: analytics.booksByType[key] })) : [];
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
  const handleUserUpdate = (updatedUser) => { setCurrentUser(prev => ({ ...prev, ...updatedUser })); };
  
  const getBadges = () => {
      const returnedCount = transactions.filter(t => t.transactionStatus === 'RETURNED' && t.user?.email === currentUser.email).length;
      const badges = [];
      if (returnedCount >= 1) badges.push({ label: 'Novice', icon: <Star className="w-4 h-4 text-yellow-400" />, color: 'bg-yellow-500/20' });
      if (returnedCount >= 5) badges.push({ label: 'Bookworm', icon: <BookOpen className="w-4 h-4 text-blue-400" />, color: 'bg-blue-500/20' });
      if (returnedCount >= 10) badges.push({ label: 'Scholar', icon: <Award className="w-4 h-4 text-purple-400" />, color: 'bg-purple-500/20' });
      return badges;
  };

  const handleCardAction = (book) => {
      const isMyBook = book.user?.email === currentUser.email;
      const isIssued = book.user !== null && book.user !== undefined;
      if (isAdmin && isIssued) { setTransactionType('return'); } else { setTransactionType('issue'); }
      setSelectedBookNo(book.bookNo);
      setModals({ ...modals, trans: true });
  };

  return (
    <div className={`min-h-screen relative overflow-hidden font-sans transition-colors duration-500 flex flex-col ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
      <style>{dashboardStyles}</style>
      <div className="fixed inset-0 z-0 library-aisle-bg"></div>
      <div className={`fixed inset-0 z-0 transition-colors duration-500 ${darkMode ? 'bg-black/80' : 'bg-white/50'}`}></div>
      {darkMode && <Fireflies />}

      <div className="relative z-10 flex flex-col min-h-screen overflow-y-auto">
        <header className={`sticky top-0 z-40 backdrop-blur-md border-b transition-colors flex-none ${darkMode ? 'bg-black/20 border-white/10' : 'bg-white/70 border-black/10'}`}>
          <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-4"><div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg text-white"><BookOpen className="w-6 h-6" /></div><div><h1 className="text-2xl font-black tracking-tight">LMS_Classic</h1><div className="flex items-center gap-2 text-xs font-medium opacity-70">{currentUser.name||currentUser.username}<span className="px-1.5 py-0.5 rounded border">{isAdmin?'ADMIN':'SCHOLAR'}</span></div></div></div>
            <div className="flex items-center gap-3"><button onClick={() => setDarkMode(!darkMode)} className={`p-2 rounded-full transition ${darkMode ? 'bg-white/10 text-yellow-300' : 'bg-black/5 text-orange-500'}`}>{darkMode ? <Sun className="w-5 h-5"/> : <Moon className="w-5 h-5"/>}</button><button onClick={onLogout} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 transition-all"><LogOut className="w-4 h-4" /> Exit</button></div>
          </div>
        </header>

        <main className="flex-grow max-w-7xl mx-auto w-full px-6 py-8">
          <GlassCard className="inline-flex mb-8 !rounded-xl !p-1" darkMode={darkMode}>
            <div className="p-1 flex gap-1">
              {['profile', 'books', 'transactions', ...(isAdmin ? ['analytics'] : [])].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm transition-all capitalize ${activeTab === tab ? 'bg-blue-600 text-white shadow-lg' : 'hover:bg-black/5 opacity-70'}`}>
                  {tab}
                </button>
              ))}
            </div>
          </GlassCard>

          {activeTab === 'profile' && (
              <div className="space-y-6 animate-fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <GlassCard className="md:col-span-1" darkMode={darkMode}>
                          <div className="p-8 flex flex-col items-center text-center">
                              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 p-1 mb-4 shadow-2xl relative group">
                                  <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center overflow-hidden"><User className="w-10 h-10 text-white"/></div>
                              </div>
                              <h2 className="text-2xl font-bold">{currentUser.name || currentUser.username}</h2>
                              <p className="text-blue-500 text-sm mb-6">{currentUser.email}</p>
                              {/* FIX: RESTORED PROFILE DETAILS */}
                              {!isAdmin && (
                                  <div className="flex flex-wrap justify-center gap-2 mb-6">
                                      {getBadges().length === 0 ? <span className="text-xs opacity-50 italic">Return books to earn badges!</span> : getBadges().map((b, i) => (
                                          <div key={i} className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border border-white/10 ${b.color} text-white`}>{b.icon}{b.label}</div>
                                      ))}
                                  </div>
                              )}
                              <div className="w-full space-y-3 mb-6">
                                  <div className={`flex justify-between text-sm p-3 rounded-lg border ${darkMode ? 'bg-white/5 border-white/5' : 'bg-gray-50 border-gray-200'}`}><span className="opacity-60">Role</span><span className="font-semibold">{isAdmin ? "Administrator" : "Scholar"}</span></div>
                                  <div className={`flex justify-between text-sm p-3 rounded-lg border ${darkMode ? 'bg-white/5 border-white/5' : 'bg-gray-50 border-gray-200'}`}><span className="opacity-60">Phone</span><span className="font-semibold">{currentUser.phoneNo || "N/A"}</span></div>
                                  <div className={`flex justify-between text-sm p-3 rounded-lg border ${darkMode ? 'bg-white/5 border-white/5' : 'bg-gray-50 border-gray-200'}`}><span className="opacity-60">Address</span><span className="font-semibold">{currentUser.address || "N/A"}</span></div>
                              </div>
                              <button onClick={() => setModals({...modals, editProfile: true})} className="w-full py-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-lg text-sm font-bold transition flex items-center justify-center gap-2 text-blue-500"><Edit2 className="w-4 h-4"/> Edit Profile</button>
                          </div>
                      </GlassCard>
                      {!isAdmin && (
                        <div className="md:col-span-2 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <GlassCard darkMode={darkMode} className="min-h-[140px] transition-transform hover:-translate-y-1 hover:shadow-blue-500/20"><div className="p-8 flex flex-wrap items-center justify-between h-full"><div><p className="text-xs uppercase tracking-wider opacity-60 mb-1">Books Held</p><h3 className="text-4xl font-bold">{getActiveLoans().length}</h3></div><div className="p-4 bg-blue-500/20 rounded-xl"><Book className="w-8 h-8 text-blue-500"/></div></div></GlassCard>
                                <GlassCard darkMode={darkMode} className="min-h-[140px] transition-transform hover:-translate-y-1 hover:shadow-red-500/20"><div className="p-8 flex flex-wrap items-center justify-between h-full"><div><p className="text-xs uppercase tracking-wider opacity-60 mb-1">Unpaid Fines</p><h3 className="text-4xl font-bold text-red-500">₹{getTotalFines()}</h3></div><div className="p-4 bg-red-500/20 rounded-xl"><Wallet className="w-8 h-8 text-red-500"/></div></div></GlassCard>
                            </div>
                            <GlassCard darkMode={darkMode}><div className="p-6 pb-2 border-b border-white/10 mb-2"><h3 className="font-bold text-lg flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-green-500"/> Active Loans</h3></div><div className="overflow-x-auto custom-scroll"><table className="w-full text-left"><thead className={`text-xs uppercase font-bold ${darkMode ? 'bg-black/20 text-gray-400' : 'bg-gray-50 text-gray-500'}`}><tr><th className="px-6 py-3">Book</th><th className="px-6 py-3">Issued On</th><th className="px-6 py-3 text-right">Due Status</th></tr></thead><tbody className="text-sm divide-y divide-white/5">{getActiveLoans().length === 0 ? <tr><td colSpan="3" className="p-6 text-center opacity-50">No active loans.</td></tr> : getActiveLoans().map(t => { const status = calculateDueStatus(t.createdOn); return (<tr key={t.id} className="hover:bg-white/5"><td className="px-6 py-3 font-medium">{t.book?.bookTitle}</td><td className="px-6 py-3 opacity-70">{new Date(t.createdOn).toLocaleDateString()}</td><td className={`px-6 py-3 text-right font-bold ${status.color}`}>{status.text}</td></tr>); })}</tbody></table></div></GlassCard>
                        </div>
                      )}
                      {isAdmin && <div className="md:col-span-2"><GlassCard darkMode={darkMode} className="h-full flex items-center justify-center text-center p-10"><div><h3 className="text-xl font-bold mb-2">Administrator Access</h3><p className="opacity-60">You have full control over the library system.</p></div></GlassCard></div>}
                  </div>
              </div>
          )}

          {activeTab === 'books' && (
            <div className="space-y-8 animate-fade-in">
              <GlassCard className="!p-0" darkMode={darkMode}><div className="p-4 flex flex-wrap gap-4 items-center justify-between"><div className="flex flex-1 gap-3 min-w-[280px] flex-wrap"><div className="relative flex-1 min-w-[150px]"><Search className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50 w-4 h-4"/><input placeholder="Title..." value={searchTitle} onChange={e => setSearchTitle(e.target.value)} className={`w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm outline-none ${darkMode ? 'bg-black/30 border-white/10' : 'bg-gray-50 border-gray-300'}`} /></div><input placeholder="Author..." value={searchAuthor} onChange={e => setSearchAuthor(e.target.value)} className={`px-4 py-2.5 border rounded-lg text-sm outline-none min-w-[150px] ${darkMode ? 'bg-black/30 border-white/10' : 'bg-gray-50 border-gray-300'}`} /><select value={searchType} onChange={e => setSearchType(e.target.value)} className={`px-4 py-2.5 border rounded-lg text-sm outline-none cursor-pointer ${darkMode ? 'bg-black/30 border-white/10' : 'bg-gray-50 border-gray-300'}`}><option value="">All Types</option><option value="PROGRAMMING">Programming</option><option value="HISTORY">History</option><option value="ENGLISH">English</option></select><select value={searchStatus} onChange={e => setSearchStatus(e.target.value)} className={`px-4 py-2.5 border rounded-lg text-sm outline-none cursor-pointer ${darkMode ? 'bg-black/30 border-white/10' : 'bg-gray-50 border-gray-300'}`}><option value="">Any Status</option><option value="AVAILABLE">Available</option><option value="ISSUED">Issued</option></select><button onClick={fetchBooks} className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-bold text-sm shadow-lg">Go</button></div>{isAdmin && <div className="flex gap-3 pl-4 border-l border-white/10"><button onClick={() => setModals({...modals, add: true})} className="p-2.5 bg-green-100 text-green-700 rounded-lg"><Plus className="w-5 h-5"/></button><button onClick={() => setModals({...modals, admin: true})} className="p-2.5 bg-purple-100 text-purple-700 rounded-lg"><UserPlus className="w-5 h-5"/></button></div>}</div></GlassCard>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? <div className="col-span-full text-center py-20 opacity-50">Scanning...</div> : books.map((book) => {
                  const isIssued = book.user !== null && book.user !== undefined;
                  const isMyBook = book.user?.email === currentUser.email;
                  const author = book.author?.name || book.authorName || 'Unknown';
                  let btnText = "Issue"; let btnClass = "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg"; let isDisabled = false;
                  if (isMyBook) { btnText = "Issued"; btnClass = "bg-green-600 text-white cursor-default"; isDisabled = true; }
                  else if (isIssued) { if(isAdmin) { btnText = "Return"; btnClass = "bg-purple-600 text-white shadow-lg hover:bg-purple-500"; } else { btnText = "Not Available"; btnClass = "bg-black/30 text-gray-500 cursor-not-allowed border border-white/5"; isDisabled = true; } }
                  
                  return (
                  <GlassCard key={book.id} onClick={() => setViewingBook(book)} darkMode={darkMode} className="hover:-translate-y-2 transition-transform duration-300 cursor-pointer">
                    <div className="p-6 flex flex-col h-full relative">
                        <div className="flex justify-between items-start mb-2 relative z-10">
                            <span className={`text-[10px] font-bold tracking-widest uppercase px-2 py-1 rounded border ${darkMode ? 'bg-blue-500/10 border-blue-500/20 text-blue-300' : 'bg-blue-100 border-blue-200 text-blue-700'}`}>{book.bookType}</span>
                            <div className="flex gap-1 items-center" onClick={(e) => e.stopPropagation()}>
                                {book.pdfUrl && (<button onClick={() => setReadingPdf(book.pdfUrl)} className={`p-1 transition-colors ${darkMode ? 'text-gray-400 hover:text-green-400' : 'text-gray-500 hover:text-green-600'}`} title="Read Book"><FileText className="w-4 h-4"/></button>)}
                                {book.imageUrl && (<button onClick={() => setPreviewImage(book.imageUrl)} className={`p-1 transition-colors ${darkMode ? 'text-gray-400 hover:text-blue-400' : 'text-gray-500 hover:text-blue-600'}`} title="View Cover"><ImageIcon className="w-4 h-4"/></button>)}
                                {isAdmin && (<button onClick={() => setQrBook(book)} className={`p-1 transition-colors ${darkMode ? 'text-gray-400 hover:text-purple-400' : 'text-gray-500 hover:text-purple-600'}`}><QrCode className="w-4 h-4"/></button>)}
                                {isAdmin && <button onClick={() => deleteBook(book.bookNo)} className={`p-1 transition-colors ${darkMode ? 'text-gray-400 hover:text-red-400' : 'text-gray-500 hover:text-red-600'}`}><Trash2 className="w-4 h-4"/></button>}
                            </div>
                        </div>
                        <h3 className={`text-xl font-bold leading-tight mb-1 relative z-10 ${darkMode?'text-white':'text-gray-900'}`}>{book.bookTitle}</h3><div className="flex items-center gap-2 mb-6 relative z-10 opacity-80"><Feather className="w-3 h-3" /><span className="text-sm font-semibold">{author}</span></div><div className="mt-auto pt-4 border-t border-gray-500/20 flex justify-between items-center text-xs opacity-70 relative z-10"><span>Ref: {book.bookNo}</span><span className="font-mono px-2 py-0.5 rounded bg-green-500/10 text-green-500">₹{book.securityAmount}</span></div><div onClick={(e) => e.stopPropagation()} className="relative z-10"><button onClick={() => !isDisabled && handleCardAction(book)} disabled={isDisabled} className={`w-full py-3 rounded-xl font-bold text-sm mt-4 transition-all flex items-center justify-center gap-2 ${btnClass}`}>{isIssued && isAdmin ? <ArrowLeftRight className="w-4 h-4"/> : (isDisabled ? <Clock className="w-4 h-4"/> : <Sparkles className="w-4 h-4"/>)} {btnText}</button></div></div></GlassCard>);
                })}
              </div>
            </div>
          )}

          {/* TRANSACTIONS & ANALYTICS (Same as before) */}
          {activeTab === 'transactions' && (<div className="space-y-6 animate-fade-in"><GlassCard className="!p-0" darkMode={darkMode}><div className="p-6 flex flex-wrap justify-between items-center gap-4"><div><h2 className="text-xl font-bold">Archives</h2><p className="text-sm opacity-60">Transaction history log.</p></div><div className="flex gap-3"><button onClick={() => { setTransactionType('issue'); setModals({...modals, trans: true}); }} className="px-5 py-2.5 bg-green-600 text-white rounded-xl font-bold text-sm shadow-lg flex items-center gap-2"><Plus className="w-4 h-4"/> Issue</button>{isAdmin && <button onClick={() => { setTransactionType('return'); setModals({...modals, trans: true}); }} className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-lg flex items-center gap-2"><ArrowLeftRight className="w-4 h-4"/> Return</button>}</div></div><div className="overflow-x-auto custom-scroll border-t border-gray-500/10"><table className="w-full text-left"><thead className={`text-xs uppercase font-bold ${darkMode?'bg-black/20 text-gray-400':'bg-gray-50 text-gray-500'}`}><tr><th className="px-6 py-4">ID</th><th className="px-6 py-4">Book</th>{isAdmin && <th className="px-6 py-4">User</th>}<th className="px-6 py-4">Status</th><th className="px-6 py-4">Date</th><th className="px-6 py-4 text-right">Fine</th></tr></thead><tbody className="text-sm divide-y divide-gray-500/10">{loading ? <tr><td colSpan="6" className="p-8 text-center">Loading...</td></tr> : transactions.map(t => (<tr key={t.id} className={darkMode?'hover:bg-white/5':'hover:bg-gray-50'}><td className="px-6 py-4 font-mono text-xs opacity-60">#{String(t.transactionId||t.id).substring(0,6)}</td><td className="px-6 py-4"><div className="font-medium">{t.book?.bookTitle}</div><div className="text-xs opacity-60">{t.book?.bookNo}</div></td>{isAdmin && <td className="px-6 py-4 text-blue-500">{t.user?.email}</td>}<td className="px-6 py-4"><span className={`px-2 py-1 text-[10px] font-bold rounded border ${t.transactionStatus==='ISSUED'?'bg-yellow-500/10 text-yellow-600 border-yellow-200':'bg-green-500/10 text-green-600 border-green-200'}`}>{t.transactionStatus}</span></td><td className="px-6 py-4 opacity-60 text-xs">{new Date(t.createdOn).toLocaleDateString()}</td><td className="px-6 py-4 text-right font-mono">{t.fineAmount || '-'}</td></tr>))}</tbody></table></div></GlassCard></div>)}
          {activeTab === 'analytics' && analytics && (<div className="space-y-8 animate-fade-in"><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"><GlassCard darkMode={darkMode}><div className="p-6 flex items-center justify-between h-full"><div><p className="text-sm opacity-60 uppercase tracking-wider">Total Books</p><h3 className="text-3xl font-bold mt-1">{analytics.totalBooks}</h3></div><div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl"><Book className="w-6 h-6"/></div></div></GlassCard><GlassCard darkMode={darkMode}><div className="p-6 flex items-center justify-between h-full"><div><p className="text-sm opacity-60 uppercase tracking-wider">Members</p><h3 className="text-3xl font-bold mt-1">{analytics.totalStudents}</h3></div><div className="p-3 bg-purple-500/10 text-purple-500 rounded-xl"><Users className="w-6 h-6"/></div></div></GlassCard><GlassCard darkMode={darkMode}><div className="p-6 flex items-center justify-between h-full"><div><p className="text-sm opacity-60 uppercase tracking-wider">Active Issues</p><h3 className="text-3xl font-bold mt-1">{analytics.activeIssues}</h3></div><div className="p-3 bg-yellow-500/10 text-yellow-500 rounded-xl"><Clock className="w-6 h-6"/></div></div></GlassCard><GlassCard darkMode={darkMode}><div className="p-6 flex items-center justify-between h-full"><div><p className="text-sm opacity-60 uppercase tracking-wider">KPI Status</p><h3 className="text-lg font-bold text-green-500 mt-1">Healthy</h3></div><div className="p-3 bg-green-500/10 text-green-500 rounded-xl"><TrendingUp className="w-6 h-6"/></div></div></GlassCard></div><div className="grid grid-cols-1 lg:grid-cols-2 gap-6"><GlassCard darkMode={darkMode}><div className="p-6 min-h-[300px]"><h3 className="text-lg font-bold mb-6 flex items-center gap-2"><PieIcon className="w-5 h-5 text-blue-500"/> Book Distribution</h3><ResponsiveContainer width="100%" height={250}><PieChart><Pie data={getPieData()} cx="50%" cy="50%" innerRadius={60} outerRadius={80} fill="#8884d8" paddingAngle={5} dataKey="value">{getPieData().map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}</Pie><Tooltip contentStyle={{backgroundColor: darkMode ? '#1f2937' : '#fff', borderColor: '#374151'}} /></PieChart></ResponsiveContainer></div></GlassCard></div></div>)}
        </main>
      </div>

      <AILibrarian isOpen={isChatOpen} toggle={() => setIsChatOpen(!isChatOpen)} books={books} darkMode={darkMode} />

      {modals.admin && <AdminRegisterModal user={currentUser} onClose={() => setModals({...modals, admin: false})} darkMode={darkMode} />}
      {modals.add && <AddBookModal user={currentUser} onClose={() => setModals({...modals, add: false})} onSuccess={fetchBooks} darkMode={darkMode} />}
      {modals.trans && <TransactionModal type={transactionType} user={currentUser} isAdmin={isAdmin} initialBookNo={selectedBookNo} onClose={() => { setModals({...modals, trans: false}); setSelectedBookNo(''); }} onSuccess={() => { fetchBooks(); fetchTransactions(); }} books={books} darkMode={darkMode} />} 
      {modals.editProfile && <EditProfileModal user={currentUser} onClose={() => setModals({...modals, editProfile: false})} onUpdate={handleUserUpdate} darkMode={darkMode} />}
      
      {viewingBook && <BookDetailModal book={viewingBook} onClose={() => setViewingBook(null)} />}
      {previewImage && <ImagePreviewModal src={previewImage} onClose={() => setPreviewImage(null)} />}
      {/* NEW: PDF READER */}
      {readingPdf && <PdfReaderModal url={readingPdf} onClose={() => setReadingPdf(null)} />}
      {qrBook && <QrPrintModal book={qrBook} onClose={() => setQrBook(null)} darkMode={darkMode} />}
    </div>
  );
};