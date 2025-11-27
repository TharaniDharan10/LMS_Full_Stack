import React, { useState, useEffect, useRef } from 'react';
import { BookOpen, LogOut, Search, Plus, Book, ArrowLeftRight, UserPlus, Clock, Trash2, Sparkles, User, Feather, X, QrCode, Download, TrendingUp, Users, PieChart as PieIcon, Edit2, ShieldCheck, Wallet, Camera, CreditCard, MessageSquare, Send } from 'lucide-react'; 
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
        url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='rgba(139, 69, 19, 0.15)'%3E%3Cpath d='M12 2c-4.97 0-9 4.03-9 9 0 1.59.45 3.08 1.23 4.37L2.5 17.13c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0l1.74-1.74C7.34 18.65 9.56 20 12 20s4.66-1.35 6.35-3.2l1.74 1.74c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41l-1.73-1.76C20.55 14.08 21 12.59 21 11c0-4.97-4.03-9-9-9zm-3 12c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm6 0c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z'/%3E%3Cpath d='M14 11a2 2 0 1 1-4 0 2 2 0 0 1 4 0z' fill='black' opacity='0.1'/%3E%3Cpath d='M4 4l16 16' stroke='rgba(139, 69, 19, 0.15)' stroke-width='2'/%3E%3C/svg%3E"),
        radial-gradient(#dcc096 1px, transparent 1px);
    background-size: 50% auto, 20px 20px;
    background-repeat: no-repeat, repeat;
    background-position: center center, center;
    box-shadow: inset 0 0 40px 10px rgba(101, 67, 33, 0.5), 0 20px 50px rgba(0,0,0,0.8);
    border: 1px solid #8b4513;
    color: #3d2b1f;
    font-family: 'Georgia', serif;
  }

  /* CHATBOT ANIMATIONS */
  @keyframes popIn { 0% { transform: scale(0); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
  .chat-bubble { animation: popIn 0.3s ease-out; }
`;

// --- 2. HELPER COMPONENTS ---
const GlassCard = ({ children, className = "", onClick }) => (
  <div onClick={onClick} className={`relative group rounded-2xl p-[1px] bg-gradient-to-br from-cyan-400/30 via-blue-500/30 to-purple-600/30 shadow-xl overflow-hidden ${onClick ? 'cursor-pointer' : ''} ${className}`}>
    <div className="relative h-full w-full bg-gray-900/70 backdrop-blur-xl rounded-2xl overflow-hidden transition-colors hover:bg-gray-900/60">
      <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>
      {children}
    </div>
  </div>
);

const Fireflies = () => ( <div className="absolute inset-0 overflow-hidden pointer-events-none z-0"> {Array.from({ length: 15 }).map((_, i) => ( <div key={i} className="firefly" style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 10}s`, animationDuration: `${10 + Math.random() * 10}s` }} /> ))} </div> );

const ModalWrapper = ({ children, title, Icon, color }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
        <GlassCard className="w-full max-w-md transform transition-all">
            <div className="p-8">
                <h3 className={`text-2xl font-bold mb-6 flex items-center gap-3 bg-clip-text text-transparent bg-gradient-to-r ${color === 'green' ? 'from-green-400 to-emerald-300' : 'from-purple-400 to-pink-300'}`}>
                    <Icon className={`w-6 h-6 ${color === 'green' ? 'text-green-400' : 'text-purple-400'}`} />{title}
                </h3>
                {children}
            </div>
        </GlassCard>
    </div>
);

// --- 3. UPGRADED AI LIBRARIAN (Brain 5.0 - Full Info & Better Search) ---
const AILibrarian = ({ isOpen, toggle, books }) => {
    const [messages, setMessages] = useState([
        { text: "Greetings! I am the Archive Guardian. Ask me about:\n• Books ('Ashoka', 'C++')\n• Authors ('Who wrote Ashoka?')\n• Policies ('Fines', 'Validity')", sender: 'bot' }
    ]);
    const [input, setInput] = useState('');
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

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

    // --- HELPER: FULL BOOK DETAILS CARD ---
    const formatBookCard = (b) => {
        const statusIcon = (b.user !== null && b.user !== undefined) ? "🔴 Issued" : "🟢 Available";
        const author = b.author?.name || b.authorName || 'Unknown';
        const summaryText = b.summary ? (b.summary.length > 120 ? b.summary.substring(0, 120) + "..." : b.summary) : "No summary available.";

        return `📖 **${b.bookTitle}**\n✍️ By: ${author}\n🏷️ ${b.bookType} | ₹${b.securityAmount}\n🔖 Ref: ${b.bookNo}\nRunning Status: ${statusIcon}\n\n📝 **Synopsis:**\n_${summaryText}_`;
    };

    // --- THE BRAIN 5.0 (Advanced Keyword Extraction) ---
    const generateResponse = (rawMsg, libraryBooks) => {
        const msg = rawMsg.toLowerCase().replace(/[?.,!]/g, '');

        if (!libraryBooks || libraryBooks.length === 0) return "I cannot access the archives. Data not loaded.";

        if (['hi', 'hello', 'hey', 'greetings', 'yo'].some(w => msg === w)) return "Hello! How can I assist you with the archives today?";
        if (['bye', 'goodbye', 'thanks', 'thank you'].some(w => msg.includes(w))) return "Farewell! Happy reading. 📜";

        if (msg.includes('fine') || msg.includes('cost') || msg.includes('penalty')) return "💰 Policy: Fines apply after 14 days (e.g., ₹50/day). Settlement = Security Deposit - Fine.";
        if (msg.includes('validity') || msg.includes('duration')) return "⏳ Validity: You can borrow a book for 14 days.";

        if (msg.includes('programming') || msg.includes('code')) {
            const matches = libraryBooks.filter(b => b.bookType === 'PROGRAMMING');
            return matches.length ? `💻 Programming:\n${matches.map(b => `• ${b.bookTitle}`).join('\n')}` : "No Programming books found.";
        }
        if (msg.includes('history')) {
            const matches = libraryBooks.filter(b => b.bookType === 'HISTORY');
            return matches.length ? `📜 History:\n${matches.map(b => `• ${b.bookTitle}`).join('\n')}` : "No History books found.";
        }

        const stopWords = ["give", "information", "info", "details", "about", "tell", "me", "show", "list", "who", "wrote", "written", "by", "is", "the", "book", "available", "search", "find", "does", "have", "a", "an", "of", "in", "archive", "library"];
        const coreKeywords = msg.split(' ').filter(word => !stopWords.includes(word));
        const cleanSearchTerm = coreKeywords.join(' ').trim();

        if (cleanSearchTerm.length >= 1) {
            const matches = libraryBooks.filter(b => {
                const titleMatch = b.bookTitle.toLowerCase().includes(cleanSearchTerm);
                const authorName = (b.author?.name || b.authorName || '').toLowerCase();
                const authorMatch = authorName.includes(cleanSearchTerm);
                const refMatch = b.bookNo.toLowerCase().includes(cleanSearchTerm);
                return titleMatch || authorMatch || refMatch;
            });

            if (matches.length > 0) {
                const limit = 2; 
                const display = matches.slice(0, limit).map(b => formatBookCard(b)).join('\n\n────────────────\n\n');
                const extra = matches.length > limit ? `\n\n...and ${matches.length - limit} more found.` : '';
                return `Here is the information for "${cleanSearchTerm}":\n\n${display}${extra}`;
            }
        }

        return `I searched for "${cleanSearchTerm || '...'}", but found nothing. Try asking for a specific Title or Author.`;
    };

    if (!isOpen) return (
        <button onClick={toggle} className="fixed bottom-6 right-6 p-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full shadow-2xl shadow-purple-500/40 text-white hover:scale-110 transition-transform z-50 animate-bounce">
            <MessageSquare className="w-7 h-7" />
        </button>
    );

    return (
        <div className="fixed bottom-6 right-6 w-80 md:w-96 h-[500px] z-50 flex flex-col rounded-2xl overflow-hidden border border-white/20 shadow-2xl backdrop-blur-xl bg-gray-900/90 animate-fade-in">
            <div className="flex-none p-4 border-b border-white/10 flex justify-between items-center bg-gradient-to-r from-blue-900/80 to-purple-900/80">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/10 rounded-full border border-white/20"><Sparkles className="w-4 h-4 text-yellow-300"/></div>
                    <div><h4 className="font-bold text-white text-sm">AI Librarian</h4><span className="text-[10px] text-green-300 flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span> Online</span></div>
                </div>
                <button onClick={toggle} className="p-1 hover:bg-white/10 rounded-full transition"><X className="w-5 h-5 text-gray-300 hover:text-white"/></button>
            </div>
            <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4 custom-scroll bg-black/20">
                {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] p-3.5 text-sm shadow-lg ${m.sender === 'user' ? 'bg-blue-600 text-white rounded-2xl rounded-tr-none' : 'bg-white/10 border border-white/10 text-gray-100 rounded-2xl rounded-tl-none'}`}>
                            <p className="whitespace-pre-line leading-relaxed">{m.text}</p>
                        </div>
                    </div>
                ))}
            </div>
            <div className="flex-none p-3 border-t border-white/10 bg-black/40 backdrop-blur-md flex gap-2">
                <input value={input} onChange={e => setInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSend()} placeholder="Ask about books..." className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-purple-500 focus:bg-black/40 transition-all placeholder-gray-500" />
                <button onClick={handleSend} className="p-2.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-white shadow-lg hover:opacity-90 transition active:scale-95"><Send className="w-4 h-4"/></button>
            </div>
        </div>
    );
};

// --- 4. MODALS ---

const EditProfileModal = ({ user, onClose, onUpdate }) => {
    const [formData, setFormData] = useState({ name: user.name || '', phoneNo: user.phoneNo || '', address: user.address || '' });
    const [message, setMessage] = useState('');
    const handleSubmit = async () => {
        try { const res = await api.updateProfile(formData, user); if(res.ok) { const updatedUser = await res.json(); setMessage('Updated!'); onUpdate(updatedUser); setTimeout(onClose, 1500); } else { setMessage('Failed'); } } catch(e) { setMessage('Connection error'); }
    };
    return (<ModalWrapper title="Edit Profile" Icon={Edit2} color="purple">{message && <div className="mb-4 p-3 bg-green-500/20 text-green-200 rounded text-sm">{message}</div>}<div className="space-y-4"><div><label className="text-xs text-gray-400">Full Name</label><input value={formData.name} onChange={e=>setFormData({...formData, name:e.target.value})} className="w-full px-4 py-2 bg-black/30 border border-white/10 rounded-lg text-white outline-none"/></div><div><label className="text-xs text-gray-400">Phone</label><input value={formData.phoneNo} onChange={e=>setFormData({...formData, phoneNo:e.target.value})} className="w-full px-4 py-2 bg-black/30 border border-white/10 rounded-lg text-white outline-none"/></div><div><label className="text-xs text-gray-400">Address</label><input value={formData.address} onChange={e=>setFormData({...formData, address:e.target.value})} className="w-full px-4 py-2 bg-black/30 border border-white/10 rounded-lg text-white outline-none"/></div><div className="flex gap-2 mt-2"><button onClick={handleSubmit} className="flex-1 py-2 bg-purple-600 rounded-lg font-bold">Save</button><button onClick={onClose} className="flex-1 py-2 bg-white/10 rounded-lg font-bold">Cancel</button></div></div></ModalWrapper>);
};

const QrPrintModal = ({ book, onClose }) => {
    const downloadQr = () => {
        const canvas = document.getElementById("qr-code-canvas");
        if(canvas) {
            const pngUrl = canvas.toDataURL("image/png");
            const downloadLink = document.createElement("a");
            const safeTitle = book.bookTitle.replace(/\s+/g, '_');
            downloadLink.href = pngUrl;
            downloadLink.download = `LMS_${book.bookNo}.png`;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
        }
    };
    return (
        <ModalWrapper title="Print Label" Icon={QrCode} color="purple">
            <div className="flex flex-col items-center justify-center space-y-6">
                <div className="bg-white p-4 rounded-xl shadow-lg transform hover:scale-105 transition duration-300"><QRCodeCanvas id="qr-code-canvas" value={book.bookNo} size={200} level={"H"} includeMargin={true} /></div>
                <div className="text-center"><h4 className="text-white font-bold text-lg">{book.bookTitle}</h4><p className="text-gray-400 font-mono text-sm mt-1">REF: {book.bookNo}</p></div>
                <div className="flex gap-3 w-full"><button onClick={downloadQr} className="flex-1 py-3 bg-green-600 hover:bg-green-500 rounded-xl font-bold text-white flex items-center justify-center gap-2"><Download className="w-4 h-4"/> PNG</button><button onClick={onClose} className="flex-1 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold text-white">Close</button></div>
            </div>
        </ModalWrapper>
    );
};

const BookDetailModal = ({ book, onClose }) => {
    if (!book) return null;
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in" onClick={onClose}>
        <div className="w-full max-w-lg relative transform transition-all hover:scale-[1.01]" onClick={e => e.stopPropagation()}>
          <div className="manuscript-paper p-12 relative min-h-[650px] flex flex-col">
              <div className="text-center border-b-2 border-[#2a150a]/40 pb-4 mb-6 relative z-10"><h2 className="text-4xl font-bold uppercase tracking-widest leading-tight">{book.bookTitle}</h2><div className="flex justify-center items-center gap-2 mt-3 italic text-lg"><Feather className="w-5 h-5" /><span>{book.author?.name || book.authorName || 'Unknown Author'}</span></div></div>
              <div className="flex-grow overflow-y-auto custom-scroll pr-4 relative z-10"><h4 className="text-sm font-bold uppercase tracking-widest opacity-70 mb-3">Synopsis</h4><p className="text-xl leading-relaxed text-justify font-serif">{book.summary || "The pages of this ancient tome are too charred to read a summary..."}</p></div>
              <div className="mt-8 pt-4 border-t border-[#2a150a]/40 flex justify-between text-base font-bold relative z-10"><span className="bg-[#2a150a]/10 px-3 py-1 rounded-sm">Ref: {book.bookNo}</span><span className="bg-[#2a150a]/10 px-3 py-1 rounded-sm">Cost: ₹{book.securityAmount}</span></div>
              <button onClick={onClose} className="absolute top-6 right-6 text-[#2a150a] hover:text-red-900 transition-colors hover:scale-110 z-20"><X className="w-8 h-8" strokeWidth={3}/></button>
          </div>
        </div>
      </div>
    );
};

const AdminRegisterModal = ({ user, onClose }) => {
  const [formData, setFormData] = useState({ userName: '', email: '', phoneNo: '', address: '', password: '' });
  const [message, setMessage] = useState({ type: '', text: '' });
  const handleSubmit = async () => { try { const res = await api.registerAdmin(formData, user); if (res.ok) { setMessage({type:'success', text:'Registered!'}); setTimeout(onClose,1500); } else { setMessage({type:'error', text: await res.text()}); } } catch (e) { setMessage({type:'error', text:'Failed'}); } };
  return (<ModalWrapper title="New Admin" Icon={UserPlus} color="purple">{message.text && <div className={`mb-4 p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-500/20 text-green-200' : 'bg-red-500/20 text-red-200'}`}>{message.text}</div>}<div className="space-y-3">{['userName', 'email', 'phoneNo', 'address', 'password'].map(f => (<input key={f} type={f === 'password' ? 'password' : 'text'} placeholder={f} className="w-full px-4 py-2 bg-black/30 border border-white/10 rounded-lg text-white focus:border-purple-500 outline-none" onChange={e => setFormData({...formData, [f]: e.target.value})} />))}<div className="flex gap-2 mt-4"><button onClick={handleSubmit} className="flex-1 py-2 bg-purple-600 rounded-lg font-bold">Register</button><button onClick={onClose} className="flex-1 py-2 bg-white/10 rounded-lg font-bold">Cancel</button></div></div></ModalWrapper>);
};

const AddBookModal = ({ user, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({ bookTitle: '', bookNo: '', securityAmount: '', bookType: 'PROGRAMMING', authorName: '', authorEmail: '', summary: '' });
  const [message, setMessage] = useState('');
  const handleSubmit = async () => { try { const res = await api.addBook(user, { ...formData, securityAmount: Number(formData.securityAmount) }); if (res.ok) { setMessage('Book Added'); setTimeout(() => { onSuccess(); onClose(); }, 1500); } else { setMessage('Failed'); } } catch (e) { setMessage('Error'); } };
  return (<ModalWrapper title="Add Book" Icon={Plus} color="green">{message && <div className="mb-4 p-3 bg-blue-500/20 rounded-lg text-blue-200 text-sm">{message}</div>}<div className="space-y-3"><input type="text" placeholder="Title" onChange={e => setFormData({...formData, bookTitle: e.target.value})} className="w-full px-4 py-2 bg-black/30 border border-white/10 rounded-lg text-white outline-none" /><div className="flex gap-2"><input type="text" placeholder="No" onChange={e => setFormData({...formData, bookNo: e.target.value})} className="w-1/2 px-4 py-2 bg-black/30 border border-white/10 rounded-lg text-white outline-none" /><input type="number" placeholder="Price" onChange={e => setFormData({...formData, securityAmount: e.target.value})} className="w-1/2 px-4 py-2 bg-black/30 border border-white/10 rounded-lg text-white outline-none" /></div><select onChange={e => setFormData({...formData, bookType: e.target.value})} className="w-full px-4 py-2 bg-black/30 border border-white/10 rounded-lg text-white outline-none"><option value="PROGRAMMING" className="bg-gray-800">Programming</option><option value="HISTORY" className="bg-gray-900">History</option><option value="ENGLISH" className="bg-gray-900">English</option></select><input type="text" placeholder="Author" onChange={e => setFormData({...formData, authorName: e.target.value})} className="w-full px-4 py-2 bg-black/30 border border-white/10 rounded-lg text-white outline-none" /><input type="email" placeholder="Author Email" onChange={e => setFormData({...formData, authorEmail: e.target.value})} className="w-full px-4 py-2 bg-black/30 border border-white/10 rounded-lg text-white outline-none" /><textarea placeholder="Summary..." onChange={e => setFormData({...formData, summary: e.target.value})} className="w-full px-4 py-2 bg-black/30 border border-white/10 rounded-lg text-white outline-none h-20 resize-none text-sm" /><div className="flex gap-2 mt-2"><button onClick={handleSubmit} className="flex-1 py-2 bg-green-600 rounded-lg font-bold">Add</button><button onClick={onClose} className="flex-1 py-2 bg-white/10 rounded-lg font-bold">Cancel</button></div></div></ModalWrapper>);
};

const PaymentModal = ({ amount, onConfirm, onCancel }) => {
    const [processing, setProcessing] = useState(false);
    const handlePay = () => { setProcessing(true); setTimeout(() => { onConfirm(`pay_mock_${Math.random().toString(36).substr(2,9)}`); }, 2000); };
    return (<div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"><div className="bg-white rounded-2xl w-full max-w-sm p-6 relative"><h3 className="text-xl font-bold mb-4 text-black">Total: ₹{amount}</h3><button onClick={handlePay} disabled={processing} className="w-full py-3 bg-blue-600 text-white rounded font-bold">{processing ? "Processing..." : "Pay Now"}</button><button onClick={onCancel} className="w-full mt-2 text-gray-500">Cancel</button></div></div>);
};

const TransactionModal = ({ type, user, isAdmin, initialBookNo, onClose, onSuccess, books }) => {
  const [formData, setFormData] = useState({ userEmail: isAdmin ? '' : (user.email || user.username), bookNo: initialBookNo || '' });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showPayment, setShowPayment] = useState(false);
  const [amountToPay, setAmountToPay] = useState(0);
  const [scanMode, setScanMode] = useState(false);

  const handleScanResult = (result) => {
    if (result) {
      const audio = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg');
      audio.play().catch(e => {});
      setFormData(prev => ({ ...prev, bookNo: result?.text }));
      setScanMode(false);
      setMessage({ type: 'success', text: `Scanned: ${result?.text}` });
    }
  };

  const initiateTransaction = () => {
    if(!formData.userEmail || !formData.bookNo) { setMessage({ type: 'error', text: 'Please fill all fields' }); return; }
    if (type === 'issue') {
        const targetBook = books?.find(b => b.bookNo === formData.bookNo);
        const price = targetBook ? targetBook.securityAmount : 200; 
        setAmountToPay(price);
        setShowPayment(true);
    } else { processTransaction(null); }
  };

  const processTransaction = async (paymentId) => {
    setShowPayment(false); setMessage({ type: 'info', text: 'Processing...' });
    try {
      const endpoint = type === 'issue' ? api.issueBook : api.returnBook;
      const response = await endpoint(user, { ...formData, paymentId });
      if (response.ok) { const data = await response.json(); setMessage({ type: 'success', text: `Success! ${type === 'return' ? `Fine: ${data}` : `Ref: ${paymentId || 'N/A'}`}` }); setTimeout(() => { onSuccess(); onClose(); }, 2000); } 
      else { const err = await response.text(); try { setMessage({ type: 'error', text: JSON.parse(err).message || err }); } catch(e) { setMessage({ type: 'error', text: err || 'Failed' }); } }
    } catch (err) { setMessage({ type: 'error', text: 'Connection error' }); }
  };

  return (
    <>
        {showPayment && <PaymentModal amount={amountToPay} onConfirm={processTransaction} onCancel={() => setShowPayment(false)} />}
        {!showPayment && (
            <ModalWrapper title={`${type} Book`} Icon={type==='issue'?Sparkles:ArrowLeftRight} color="green">
                {message.text && <div className={`mb-4 p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-500/20 text-green-200' : 'bg-red-500/20 text-red-200'}`}>{message.text}</div>}
                {scanMode ? (
                    <div className="relative h-64 bg-black rounded-lg overflow-hidden mb-4 border-2 border-green-500 shadow-lg">
                        <QrReader onResult={handleScanResult} constraints={{ facingMode: 'environment' }} containerStyle={{ width: '100%', height: '100%' }} videoStyle={{ objectFit: 'cover' }} />
                        <button onClick={() => setScanMode(false)} className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-red-600/80 rounded-full text-white transition"><X className="w-4 h-4"/></button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <input type="email" placeholder="Student Email" value={formData.userEmail} onChange={e => setFormData({...formData, userEmail: e.target.value})} readOnly={!isAdmin} className={`w-full px-4 py-2 bg-black/30 border border-white/10 rounded-lg text-white outline-none ${!isAdmin ? 'opacity-50' : ''}`} />
                        <div className="flex gap-2">
                            <input type="text" placeholder="Book No" value={formData.bookNo} onChange={e => setFormData({...formData, bookNo: e.target.value})} className="w-full px-4 py-2 bg-black/30 border border-white/10 rounded-lg text-white outline-none" />
                            {isAdmin && !initialBookNo && <button onClick={() => setScanMode(true)} className="p-2.5 bg-purple-600/80 hover:bg-purple-500 rounded-lg transition shadow-lg border border-purple-400/30" title="Scan QR Code"><Camera className="w-5 h-5 text-white"/></button>}
                        </div>
                        <div className="flex gap-2 mt-4"><button onClick={initiateTransaction} className="flex-1 py-2 bg-blue-600 rounded-lg font-bold capitalize shadow-lg">{type === 'issue' ? 'Pay & Issue' : 'Return'}</button><button onClick={onClose} className="flex-1 py-2 bg-white/10 rounded-lg font-bold">Cancel</button></div>
                    </div>
                )}
            </ModalWrapper>
        )}
    </>
  );
};

// --- 5. MAIN DASHBOARD (Consolidated) ---
export const Dashboard = ({ user, onLogout }) => {
  // --- NEW: LOCAL USER STATE FOR INSTANT UPDATES ---
  const [currentUser, setCurrentUser] = useState(user);
  useEffect(() => { setCurrentUser(user); }, [user]);

  const [activeTab, setActiveTab] = useState('profile');
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
  const [qrBook, setQrBook] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const isAdmin = (currentUser.userType === 'ADMIN') || (currentUser.authorities && currentUser.authorities.includes('ADMIN'));

  useEffect(() => {
    fetchBooks(); 
    if (activeTab === 'transactions' || activeTab === 'profile') fetchTransactions();
    if (activeTab === 'analytics' && isAdmin) fetchAnalytics();
  }, [activeTab, searchType, searchAuthor, searchStatus]);

  const fetchBooks = async () => { setLoading(true); try { const res = await api.getBooks(currentUser, searchTitle, searchType, searchAuthor, searchStatus); if (res.ok) setBooks(await res.json()); } catch (e) {} finally { setLoading(false); } };
  const fetchTransactions = async () => { setLoading(true); try { const res = await api.getTransactions(currentUser); if (res.ok) setTransactions(await res.json()); } catch (e) {} finally { setLoading(false); } };
  const fetchAnalytics = async () => { setLoading(true); try { const res = await api.getAnalytics(currentUser); if (res.ok) setAnalytics(await res.json()); } catch (e) {} finally { setLoading(false); } };
  const deleteBook = async (no) => { if(window.confirm(`Delete ${no}?`)) { await api.deleteBook(currentUser, no); fetchBooks(); } };

  const getActiveLoans = () => transactions.filter(t => t.transactionStatus === 'ISSUED' && t.user?.email === currentUser.email);
  const getTotalFines = () => transactions.filter(t => t.user?.email === currentUser.email && t.fineAmount > 0).reduce((acc, t) => acc + t.fineAmount, 0);

  const getPieData = () => {
    if (!analytics?.booksByType) return [];
    return Object.keys(analytics.booksByType).map(key => ({ name: key, value: analytics.booksByType[key] }));
  };
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  // --- HANDLER: Updates local state immediately ---
  const handleUserUpdate = (updatedUser) => { 
      setCurrentUser(prev => ({ ...prev, ...updatedUser })); 
  };

  return (
    <div className="min-h-screen relative overflow-hidden font-sans text-gray-100 selection:bg-blue-500/30">
      <style>{dashboardStyles}</style>
      <div className="fixed inset-0 z-0 library-aisle-bg"></div>
      <div className="fixed inset-0 z-0 bg-black/70"></div>
      <Fireflies />

      <div className="relative z-10 flex flex-col min-h-screen">
        <header className="sticky top-0 z-40 backdrop-blur-md bg-black/20 border-b border-white/10">
          <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-4"><div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-blue-500/30"><BookOpen className="w-6 h-6 text-white" /></div><div><h1 className="text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-200">LMS_Classic</h1><div className="flex items-center gap-2 text-xs font-medium text-blue-200/70">{currentUser.name||currentUser.username}<span className={`px-1.5 py-0.5 rounded border ${isAdmin?'border-purple-500/50 bg-purple-500/10 text-purple-200':'border-blue-500/50 bg-blue-500/10 text-blue-200'}`}>{isAdmin?'ADMIN':'STUDENT'}</span></div></div></div>
            <button onClick={onLogout} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-200 hover:bg-red-500/20 transition-all"><LogOut className="w-4 h-4" /> Exit</button>
          </div>
        </header>

        <main className="flex-grow max-w-7xl mx-auto w-full px-6 py-8">
          <GlassCard className="inline-flex mb-8 !rounded-xl !p-1">
            <div className="p-1 flex gap-1">
              {['profile', 'books', 'transactions', ...(isAdmin ? ['analytics'] : [])].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm transition-all capitalize ${activeTab === tab ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                  {tab === 'books' && <Book className="w-4 h-4"/>}
                  {tab === 'transactions' && <ArrowLeftRight className="w-4 h-4"/>}
                  {tab === 'analytics' && <TrendingUp className="w-4 h-4"/>}
                  {tab === 'profile' && <User className="w-4 h-4"/>}
                  {tab === 'books' ? 'Collection' : tab}
                </button>
              ))}
            </div>
          </GlassCard>

          {activeTab === 'profile' && (
              <div className="space-y-6 animate-fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <GlassCard className="md:col-span-1">
                          <div className="p-8 flex flex-col items-center text-center">
                              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 p-1 mb-4 shadow-2xl relative group">
                                  <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center overflow-hidden"><User className="w-10 h-10 text-white"/></div>
                              </div>
                              <h2 className="text-2xl font-bold text-white">{currentUser.name || currentUser.username}</h2>
                              <p className="text-blue-300 text-sm mb-6">{currentUser.email}</p>
                              <div className="w-full space-y-3 mb-6">
                                  <div className="flex justify-between text-sm p-3 bg-white/5 rounded-lg border border-white/5"><span className="text-gray-400">Role</span><span className="text-white font-semibold">{isAdmin ? "Administrator" : "Scholar"}</span></div>
                                  <div className="flex justify-between text-sm p-3 bg-white/5 rounded-lg border border-white/5"><span className="text-gray-400">Phone</span><span className="text-white font-semibold">{currentUser.phoneNo || "N/A"}</span></div>
                                  <div className="flex justify-between text-sm p-3 bg-white/5 rounded-lg border border-white/5"><span className="text-gray-400">Address</span><span className="text-white font-semibold">{currentUser.address || "N/A"}</span></div>
                              </div>
                              <button onClick={() => setModals({...modals, editProfile: true})} className="w-full py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg text-sm font-bold transition flex items-center justify-center gap-2"><Edit2 className="w-4 h-4"/> Edit Profile</button>
                          </div>
                      </GlassCard>
                      {!isAdmin && (
                        <div className="md:col-span-2 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <GlassCard className="transition-transform hover:-translate-y-1 hover:shadow-blue-500/20">
                                    <div className="p-6 flex flex-wrap items-center justify-between h-full"><div><p className="text-xs uppercase tracking-wider text-gray-400">Books Held</p><h3 className="text-3xl font-bold text-white mt-1">{getActiveLoans().length}</h3></div><div className="p-3 bg-blue-500/20 rounded-xl"><Book className="w-6 h-6 text-blue-400"/></div></div>
                                </GlassCard>
                                <GlassCard className="transition-transform hover:-translate-y-1 hover:shadow-red-500/20">
                                    <div className="p-6 flex flex-wrap items-center justify-between h-full"><div><p className="text-xs uppercase tracking-wider text-gray-400">Unpaid Fines</p><h3 className="text-3xl font-bold text-red-400 mt-1">₹{getTotalFines()}</h3></div><div className="p-3 bg-red-500/20 rounded-xl"><Wallet className="w-6 h-6 text-red-400"/></div></div>
                                </GlassCard>
                            </div>
                            <GlassCard>
                                <div className="p-6 pb-2 border-b border-white/10 mb-2"><h3 className="font-bold text-lg text-white flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-green-400"/> Active Loans</h3></div>
                                <div className="overflow-x-auto custom-scroll"><table className="w-full text-left"><thead className="bg-black/20 text-gray-400 text-xs uppercase font-bold"><tr><th className="px-6 py-3">Book</th><th className="px-6 py-3">Issued On</th><th className="px-6 py-3 text-right">Due</th></tr></thead><tbody className="text-sm text-gray-300 divide-y divide-white/5">{getActiveLoans().length === 0 ? <tr><td colSpan="3" className="p-6 text-center text-gray-500">No active loans.</td></tr> : getActiveLoans().map(t => (<tr key={t.id} className="hover:bg-white/5"><td className="px-6 py-3 font-medium text-white">{t.book?.bookTitle}</td><td className="px-6 py-3 text-gray-400">{new Date(t.createdOn).toLocaleDateString()}</td><td className="px-6 py-3 text-right text-blue-300 font-mono">14 Days</td></tr>))}</tbody></table></div>
                            </GlassCard>
                        </div>
                      )}
                      {isAdmin && <div className="md:col-span-2"><GlassCard className="h-full flex items-center justify-center text-center p-10"><div><h3 className="text-xl font-bold text-white mb-2">Administrator Access</h3><p className="text-gray-400">You have full control over the library system.<br/>Use the tabs above to manage collections.</p></div></GlassCard></div>}
                  </div>
              </div>
          )}

          {activeTab === 'books' && (
            <div className="space-y-8 animate-fade-in">
              <GlassCard className="!p-0"><div className="p-4 flex flex-wrap gap-4 items-center justify-between">
                  <div className="flex flex-1 gap-3 min-w-[280px] flex-wrap">
                    <div className="relative flex-1 min-w-[150px]"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4"/><input type="text" placeholder="Title..." value={searchTitle} onChange={e => setSearchTitle(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-black/30 border border-white/10 rounded-lg text-sm text-white outline-none" /></div>
                    <input type="text" placeholder="Author..." value={searchAuthor} onChange={e => setSearchAuthor(e.target.value)} className="px-4 py-2.5 bg-black/30 border border-white/10 rounded-lg text-sm text-white outline-none min-w-[150px]" />
                    <select value={searchType} onChange={e => setSearchType(e.target.value)} className="px-4 py-2.5 bg-black/30 border border-white/10 rounded-lg text-sm text-white outline-none cursor-pointer"><option value="">All Types</option><option value="PROGRAMMING">Programming</option><option value="HISTORY">History</option><option value="ENGLISH">English</option></select>
                    <select value={searchStatus} onChange={e => setSearchStatus(e.target.value)} className="px-4 py-2.5 bg-black/30 border border-white/10 rounded-lg text-sm text-white outline-none cursor-pointer"><option value="">Any Status</option><option value="AVAILABLE">Available</option><option value="ISSUED">Issued</option></select>
                    <button onClick={fetchBooks} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-lg font-bold text-sm shadow-lg">Go</button>
                  </div>
                  {isAdmin && <div className="flex gap-3 pl-4 border-l border-white/10"><button onClick={() => setModals({...modals, add: true})} className="p-2.5 bg-green-500/20 text-green-300 border border-green-500/30 rounded-lg hover:bg-green-500/30 transition"><Plus className="w-5 h-5"/></button><button onClick={() => setModals({...modals, admin: true})} className="p-2.5 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-lg hover:bg-purple-500/30 transition"><UserPlus className="w-5 h-5"/></button></div>}
              </div></GlassCard>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? <div className="col-span-full text-center py-20 text-blue-200/50 font-medium animate-pulse">Scanning shelves...</div> : books.map((book) => {
                  const isIssued = book.user !== null && book.user !== undefined;
                  const author = book.author?.name || book.authorName || 'Unknown';
                  return (<GlassCard key={book.id || book.bookNo} onClick={() => setViewingBook(book)} className="hover:-translate-y-2 transition-transform duration-300 cursor-pointer"><div className="p-6 flex flex-col h-full"><div className="flex justify-between items-start mb-2"><span className="text-[10px] font-bold tracking-widest text-blue-300 uppercase bg-blue-500/10 px-2 py-1 rounded border border-blue-500/20">{book.bookType}</span><div className="flex gap-1" onClick={(e) => e.stopPropagation()}>{isAdmin && (<button onClick={() => setQrBook(book)} className="text-gray-500 hover:text-purple-400 transition p-1.5 hover:bg-purple-500/10 rounded-full" title="Generate Label"><QrCode className="w-4 h-4"/></button>)}{isAdmin && <button onClick={() => deleteBook(book.bookNo)} className="text-gray-500 hover:text-red-400 transition p-1.5 hover:bg-red-500/10 rounded-full"><Trash2 className="w-4 h-4"/></button>}</div></div><h3 className="text-xl font-bold text-white leading-tight mb-1">{book.bookTitle}</h3><div className="flex items-center gap-2 mb-6"><Feather className="w-3 h-3 text-blue-400" /><span className="text-sm font-semibold text-blue-200">{author}</span></div><div className="mt-auto pt-4 border-t border-white/10 flex justify-between items-center text-xs text-gray-400 mb-4"><span>Ref: {book.bookNo}</span><span className="font-mono text-green-400 bg-green-500/10 px-2 py-0.5 rounded">₹{book.securityAmount}</span></div><div onClick={(e) => e.stopPropagation()}><button onClick={() => !isIssued && (setSelectedBookNo(book.bookNo), setTransactionType('issue'), setModals({...modals, trans: true}))} disabled={isIssued} className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${isIssued ? 'bg-black/30 text-gray-500 cursor-not-allowed border border-white/5' : 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg hover:shadow-blue-500/40'}`}>{isIssued ? <><Clock className="w-4 h-4"/> Issued</> : <><Sparkles className="w-4 h-4"/> Issue</>}</button></div></div></GlassCard>);
                })}
              </div>
            </div>
          )}

          {/* TRANSACTIONS TAB */}
          {activeTab === 'transactions' && (
            <div className="space-y-6 animate-fade-in">
              <GlassCard className="!p-0">
                <div className="p-6 flex flex-wrap justify-between items-center gap-4"><div><h2 className="text-xl font-bold text-white">Archives</h2><p className="text-sm text-gray-400">Transaction history log.</p></div><div className="flex gap-3"><button onClick={() => { setTransactionType('issue'); setModals({...modals, trans: true}); }} className="px-5 py-2.5 bg-green-600 hover:bg-green-500 rounded-xl text-white font-bold text-sm shadow-lg flex items-center gap-2"><Plus className="w-4 h-4"/> Issue</button>{isAdmin && <button onClick={() => { setTransactionType('return'); setModals({...modals, trans: true}); }} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl text-white font-bold text-sm shadow-lg flex items-center gap-2"><ArrowLeftRight className="w-4 h-4"/> Return</button>}</div></div>
                <div className="overflow-x-auto custom-scroll border-t border-white/10"><table className="w-full text-left"><thead className="bg-black/20 text-gray-400 text-xs uppercase font-bold"><tr><th className="px-6 py-4">ID</th><th className="px-6 py-4">Book</th>{isAdmin && <th className="px-6 py-4">User</th>}<th className="px-6 py-4">Status</th><th className="px-6 py-4">Date</th><th className="px-6 py-4 text-right">Fine</th></tr></thead><tbody className="text-sm text-gray-300 divide-y divide-white/5">{loading ? <tr><td colSpan="6" className="p-8 text-center">Loading...</td></tr> : transactions.map(t => (<tr key={t.id} className="hover:bg-white/5"><td className="px-6 py-4 font-mono text-xs text-gray-500">#{String(t.transactionId||t.id).substring(0,6)}</td><td className="px-6 py-4"><div className="text-white font-medium">{t.book?.bookTitle}</div><div className="text-xs text-gray-500">{t.book?.bookNo}</div></td>{isAdmin && <td className="px-6 py-4 text-blue-300">{t.user?.email}</td>}<td className="px-6 py-4"><span className={`px-2 py-1 text-[10px] font-bold rounded border ${t.transactionStatus==='ISSUED'?'bg-yellow-500/10 text-yellow-200 border-yellow-500/30':'bg-green-500/10 text-green-200 border-green-500/30'}`}>{t.transactionStatus}</span></td><td className="px-6 py-4 text-gray-400 text-xs">{new Date(t.createdOn).toLocaleDateString()}</td><td className="px-6 py-4 text-right font-mono">{t.fineAmount || '-'}</td></tr>))}</tbody></table></div>
              </GlassCard>
            </div>
          )}

          {/* ANALYTICS TAB */}
          {activeTab === 'analytics' && analytics && (
            <div className="space-y-8 animate-fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <GlassCard><div className="p-6 flex items-center justify-between h-full"><div><p className="text-sm text-gray-400 uppercase tracking-wider">Total Books</p><h3 className="text-3xl font-bold text-white mt-1">{analytics.totalBooks}</h3></div><div className="p-3 bg-blue-500/20 rounded-xl"><Book className="w-6 h-6 text-blue-400"/></div></div></GlassCard>
                    <GlassCard><div className="p-6 flex items-center justify-between h-full"><div><p className="text-sm text-gray-400 uppercase tracking-wider">Members</p><h3 className="text-3xl font-bold text-white mt-1">{analytics.totalStudents}</h3></div><div className="p-3 bg-purple-500/20 rounded-xl"><Users className="w-6 h-6 text-purple-400"/></div></div></GlassCard>
                    <GlassCard><div className="p-6 flex items-center justify-between h-full"><div><p className="text-sm text-gray-400 uppercase tracking-wider">Active Issues</p><h3 className="text-3xl font-bold text-white mt-1">{analytics.activeIssues}</h3></div><div className="p-3 bg-yellow-500/20 rounded-xl"><Clock className="w-6 h-6 text-yellow-400"/></div></div></GlassCard>
                    <GlassCard><div className="p-6 flex items-center justify-between h-full"><div><p className="text-sm text-gray-400 uppercase tracking-wider">KPI Status</p><h3 className="text-lg font-bold text-green-400 mt-1">Healthy</h3></div><div className="p-3 bg-green-500/20 rounded-xl"><TrendingUp className="w-6 h-6 text-green-400"/></div></div></GlassCard>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <GlassCard><div className="p-6 min-h-[300px]"><h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><PieIcon className="w-5 h-5 text-blue-400"/> Book Distribution</h3><ResponsiveContainer width="100%" height={250}><PieChart><Pie data={getPieData()} cx="50%" cy="50%" innerRadius={60} outerRadius={80} fill="#8884d8" paddingAngle={5} dataKey="value">{getPieData().map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}</Pie><Tooltip contentStyle={{backgroundColor: '#1f2937', borderColor: '#374151', color:'#fff'}} itemStyle={{color:'#fff'}} /></PieChart></ResponsiveContainer></div></GlassCard>
                    <GlassCard><div className="p-6 min-h-[300px] flex items-center justify-center text-center"><div><h3 className="text-lg font-bold text-white mb-2">More Insights Coming Soon</h3><p className="text-gray-400 text-sm">Revenue charts and detailed user activity will appear here in Phase 3.</p></div></div></GlassCard>
                </div>
            </div>
          )}
        </main>
      </div>

      <AILibrarian isOpen={isChatOpen} toggle={() => setIsChatOpen(!isChatOpen)} books={books} />

      {modals.admin && <AdminRegisterModal user={currentUser} onClose={() => setModals({...modals, admin: false})} />}
      {modals.add && <AddBookModal user={currentUser} onClose={() => setModals({...modals, add: false})} onSuccess={fetchBooks} />}
      {modals.trans && <TransactionModal type={transactionType} user={currentUser} isAdmin={isAdmin} initialBookNo={selectedBookNo} onClose={() => { setModals({...modals, trans: false}); setSelectedBookNo(''); }} onSuccess={() => { fetchBooks(); fetchTransactions(); }} books={books} />} 
      {modals.editProfile && <EditProfileModal user={currentUser} onClose={() => setModals({...modals, editProfile: false})} onUpdate={handleUserUpdate} />}
      
      {viewingBook && <BookDetailModal book={viewingBook} onClose={() => setViewingBook(null)} />}
      {qrBook && <QrPrintModal book={qrBook} onClose={() => setQrBook(null)} />}
    </div>
  );
};