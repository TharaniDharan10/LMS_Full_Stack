import React, { useState, useEffect } from 'react';
import { BookOpen, LogOut, Search, Plus, Book, ArrowLeftRight, UserPlus, Clock, Trash2, Sparkles, User, Feather, X } from 'lucide-react'; 
import { api } from '../services/api';

// --- 1. CSS STYLES (Animations, Glass, Manuscript) ---
const dashboardStyles = `
  /* BACKGROUND ANIMATION: Slow Pan */
  @keyframes moveThrough {
    0% { 
      transform: scale(1); 
      background-position: center top;
    }
    100% { 
      transform: scale(1.5); 
      background-position: center bottom;
    }
  }

  .library-aisle-bg {
    background-image: url('https://images.unsplash.com/photo-1521587760476-6c12a4b040da?q=80&w=2070&auto=format&fit=crop');
    background-size: cover;
    background-position: center;
     /* Faster animation (25s) to make movement obvious */
    animation: moveThrough 25s ease-in-out infinite alternate;
    /* Hardware acceleration for smoothness */
    will-change: transform;
  }

  /* FIREFLIES */
  .firefly {
    position: absolute;
    width: 3px;
    height: 3px;
    background: #fbbf24;
    border-radius: 50%;
    box-shadow: 0 0 8px 2px rgba(252, 211, 77, 0.6);
    opacity: 0;
    animation: float 8s ease-in-out infinite;
  }

  @keyframes float {
    0%, 100% { transform: translateY(0) translateX(0); opacity: 0; }
    20%, 80% { opacity: 1; }
    50% { transform: translateY(-40px) translateX(20px); }
  }

  /* SCROLLBAR */
  .custom-scroll::-webkit-scrollbar { width: 6px; }
  .custom-scroll::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); }
  .custom-scroll::-webkit-scrollbar-thumb { background: rgba(30, 15, 5, 0.5); border-radius: 10px; border: 1px solid rgba(255,255,255,0.1); }

  /* === REALISTIC PIRATE BURNT MANUSCRIPT EFFECT === */
  .manuscript-paper {
    /* Deep aged parchment color base */
    background-color: #c2a073;
    
    /* Layered Background Images: Texture, Skull, Vignette, Stains */
    background-image: 
        /* 1. Subtle paper texture pattern */
        url("https://www.transparenttextures.com/patterns/aged-paper.png"),
        /* 2. THE PIRATE SKULL WATERMARK (SVG Data URI) - Transparent dark brown */
        url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='rgba(42, 21, 10, 0.12)'%3E%3Cpath d='M12 2c-4.97 0-9 4.03-9 9 0 1.59.45 3.08 1.23 4.37L2.5 17.13c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0l1.74-1.74C7.34 18.65 9.56 20 12 20s4.66-1.35 6.35-3.2l1.74 1.74c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41l-1.73-1.76C20.55 14.08 21 12.59 21 11c0-4.97-4.03-9-9-9zm-3 12c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm6 0c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z'/%3E%3Ccircle cx='9' cy='12' r='2.2' fill='rgba(42, 21, 10, 0.15)'/%3E%3Cpath d='M7 10l-4-3' stroke='rgba(42, 21, 10, 0.15)' stroke-width='1.5'/%3E%3C/svg%3E"),
        /* 3. Dark vignette to darken corners */
        radial-gradient(ellipse at center, transparent 30%, rgba(40, 20, 10, 0.8) 100%),
        /* 4. Random large stain */
        radial-gradient(circle at 30% 20%, rgba(80, 40, 20, 0.2) 0%, transparent 40%),
        /* 5. Another random stain */
        radial-gradient(circle at 80% 70%, rgba(80, 40, 20, 0.3) 0%, transparent 50%);
    
    /* Blend modes to mix the layers automatically */
    background-blend-mode: overlay, normal, multiply, normal, normal;
    
    /* Positioning and Sizing for the layers */
    background-repeat: repeat, no-repeat, no-repeat, no-repeat, no-repeat;
    background-position: center center;
    /* Size the skull to be large in the center */
    background-size: auto, 60% auto, auto, auto, auto; 

    
    /* IRREGULAR SHAPE: Wonky corners */
    border-radius: 25px 225px 35px 245px / 245px 35px 225px 25px;
    
    /* BURNT EDGES: Heavy inset shadows */
    box-shadow: 
        inset 0 0 50px 30px rgba(20, 10, 5, 0.95),
        inset 0 0 90px 60px rgba(80, 40, 20, 0.6),
        0 30px 60px rgba(0,0,0,0.9);
        
    /* Rough border */
    border: 3px solid #2a150a;
    
    /* Ink appearance */
    color: #2a150a;
    text-shadow: 0 0 1px rgba(42, 21, 10, 0.3);
    font-family: 'Georgia', 'Times New Roman', serif;
    
    transform: rotate(-1deg);
    overflow: hidden;
  }
`;

// --- 2. HELPER COMPONENTS ---

// Glass Card with Gradient Border & Click Handler
const GlassCard = ({ children, className = "", onClick }) => (
  <div 
    onClick={onClick} 
    className={`relative group rounded-2xl p-[1px] bg-gradient-to-br from-cyan-400/30 via-blue-500/30 to-purple-600/30 shadow-xl overflow-hidden ${onClick ? 'cursor-pointer' : ''} ${className}`}
  >
    <div className="relative h-full w-full bg-gray-900/70 backdrop-blur-xl rounded-2xl overflow-hidden transition-colors hover:bg-gray-900/60">
      <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>
      {children}
    </div>
  </div>
);

// Fireflies Background
const Fireflies = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
    {Array.from({ length: 15 }).map((_, i) => (
      <div key={i} className="firefly" style={{
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 10}s`,
        animationDuration: `${10 + Math.random() * 10}s`
      }} />
    ))}
  </div>
);

// --- 3. MODALS ---

// Standard Modal Container
const ModalWrapper = ({ children, title, Icon, color }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
        <GlassCard className="w-full max-w-md transform transition-all">
            <div className="p-8">
                <h3 className={`text-2xl font-bold mb-6 flex items-center gap-3 bg-clip-text text-transparent bg-gradient-to-r ${color === 'green' ? 'from-green-400 to-emerald-300' : 'from-purple-400 to-pink-300'}`}>
                    <Icon className={`w-6 h-6 ${color === 'green' ? 'text-green-400' : 'text-purple-400'}`} />
                    {title}
                </h3>
                {children}
            </div>
        </GlassCard>
    </div>
);

// --- UPDATED PIRATE MANUSCRIPT MODAL ---
const BookDetailModal = ({ book, onClose }) => {
    if (!book) return null;
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in" onClick={onClose}>
        <div className="w-full max-w-lg relative" onClick={e => e.stopPropagation()}>
          {/* UPDATED HEIGHT: Changed min-h to 650px for a longer pirate map look */}
          <div className="manuscript-paper p-12 relative min-h-[650px] flex flex-col">
              {/* Header */}
              <div className="text-center border-b-2 border-[#2a150a]/40 pb-4 mb-6">
                  <h2 className="text-4xl font-bold uppercase tracking-widest leading-tight">{book.bookTitle}</h2>
                  <div className="flex justify-center items-center gap-2 mt-3 italic text-lg">
                    <Feather className="w-5 h-5" />
                    <span>{book.author?.name || book.authorName || 'Unknown Author'}</span>
                  </div>
              </div>
              {/* Summary Display */}
              <div className="flex-grow overflow-y-auto custom-scroll pr-4 relative z-10">
                <h4 className="text-sm font-bold uppercase tracking-widest opacity-70 mb-3">Synopsis</h4>
                <p className="text-xl leading-relaxed text-justify font-serif">
                    {book.summary || "The pages of this ancient tome are too charred to read a summary..."}
                </p>
              </div>
              {/* Footer */}
              <div className="mt-8 pt-4 border-t border-[#2a150a]/40 flex justify-between text-base font-bold relative z-10">
                  <span className="bg-[#2a150a]/10 px-3 py-1 rounded-sm">Ref: {book.bookNo}</span>
                  <span className="bg-[#2a150a]/10 px-3 py-1 rounded-sm">Cost: ₹{book.securityAmount}</span>
              </div>
              {/* Close Button */}
              <button onClick={onClose} className="absolute top-6 right-6 text-[#2a150a] hover:text-red-900 transition-colors hover:scale-110 z-20"><X className="w-8 h-8" strokeWidth={3}/></button>
          </div>
        </div>
      </div>
    );
};

const AdminRegisterModal = ({ user, onClose }) => {
  const [formData, setFormData] = useState({ userName: '', email: '', phoneNo: '', address: '', password: '' });
  const [message, setMessage] = useState({ type: '', text: '' });
  const handleSubmit = async () => {
    try { const res = await api.registerAdmin(formData, user); if (res.ok) { setMessage({type:'success', text:'Registered!'}); setTimeout(onClose,1500); } else { setMessage({type:'error', text: await res.text()}); } } catch (e) { setMessage({type:'error', text:'Failed'}); }
  };
  return (
    <ModalWrapper title="New Admin" Icon={UserPlus} color="purple">
        {message.text && <div className={`mb-4 p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-500/20 text-green-200' : 'bg-red-500/20 text-red-200'}`}>{message.text}</div>}
        <div className="space-y-3">
          {['userName', 'email', 'phoneNo', 'address', 'password'].map(f => (
            <input key={f} type={f === 'password' ? 'password' : 'text'} placeholder={f} className="w-full px-4 py-2 bg-black/30 border border-white/10 rounded-lg text-white focus:border-purple-500 outline-none" onChange={e => setFormData({...formData, [f]: e.target.value})} />
          ))}
          <div className="flex gap-2 mt-4"><button onClick={handleSubmit} className="flex-1 py-2 bg-purple-600 rounded-lg font-bold">Register</button><button onClick={onClose} className="flex-1 py-2 bg-white/10 rounded-lg font-bold">Cancel</button></div>
        </div>
    </ModalWrapper>
  );
};

const AddBookModal = ({ user, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({ bookTitle: '', bookNo: '', securityAmount: '', bookType: 'PROGRAMMING', authorName: '', authorEmail: '', summary: '' });
  const [message, setMessage] = useState('');
  const handleSubmit = async () => {
    try { const res = await api.addBook(user, { ...formData, securityAmount: Number(formData.securityAmount) }); if (res.ok) { setMessage('Book Added'); setTimeout(() => { onSuccess(); onClose(); }, 1500); } else { setMessage('Failed'); } } catch (e) { setMessage('Error'); }
  };
  return (
    <ModalWrapper title="Add Book" Icon={Plus} color="green">
        {message && <div className="mb-4 p-3 bg-blue-500/20 rounded-lg text-blue-200 text-sm">{message}</div>}
        <div className="space-y-3">
          <input type="text" placeholder="Title" onChange={e => setFormData({...formData, bookTitle: e.target.value})} className="w-full px-4 py-2 bg-black/30 border border-white/10 rounded-lg text-white outline-none" />
          <div className="flex gap-2"><input type="text" placeholder="No" onChange={e => setFormData({...formData, bookNo: e.target.value})} className="w-1/2 px-4 py-2 bg-black/30 border border-white/10 rounded-lg text-white outline-none" /><input type="number" placeholder="Price" onChange={e => setFormData({...formData, securityAmount: e.target.value})} className="w-1/2 px-4 py-2 bg-black/30 border border-white/10 rounded-lg text-white outline-none" /></div>
          <select onChange={e => setFormData({...formData, bookType: e.target.value})} className="w-full px-4 py-2 bg-black/30 border border-white/10 rounded-lg text-white outline-none"><option value="PROGRAMMING" className="bg-gray-800">Programming</option><option value="HISTORY" className="bg-gray-900">History</option><option value="ENGLISH" className="bg-gray-900">English</option></select>
          <input type="text" placeholder="Author" onChange={e => setFormData({...formData, authorName: e.target.value})} className="w-full px-4 py-2 bg-black/30 border border-white/10 rounded-lg text-white outline-none" />
          <input type="email" placeholder="Author Email" onChange={e => setFormData({...formData, authorEmail: e.target.value})} className="w-full px-4 py-2 bg-black/30 border border-white/10 rounded-lg text-white outline-none" />
          <textarea placeholder="Book Summary / Synopsis..." onChange={e => setFormData({...formData, summary: e.target.value})} className="w-full px-4 py-2 bg-black/30 border border-white/10 rounded-lg text-white outline-none h-20 resize-none text-sm" />
          <div className="flex gap-2 mt-2"><button onClick={handleSubmit} className="flex-1 py-2 bg-green-600 rounded-lg font-bold">Add</button><button onClick={onClose} className="flex-1 py-2 bg-white/10 rounded-lg font-bold">Cancel</button></div>
        </div>
    </ModalWrapper>
  );
};

const TransactionModal = ({ type, user, isAdmin, initialBookNo, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({ userEmail: isAdmin ? '' : (user.email || user.username), bookNo: initialBookNo || '' });
  const [message, setMessage] = useState('');
  const handleSubmit = async () => {
    if(!formData.userEmail || !formData.bookNo) { setMessage('Fill all fields'); return; }
    try { const res = await (type === 'issue' ? api.issueBook : api.returnBook)(user, formData); if (res.ok) { const data = await res.json(); setMessage(`Success! ${type === 'return' ? `Fine: ${data.settlementAmount}` : ''}`); setTimeout(() => { onSuccess(); onClose(); }, 1500); } else { const err = await res.text(); try { setMessage(JSON.parse(err).message || err); } catch(e) { setMessage(err || 'Failed'); } } } catch (e) { setMessage('Error'); }
  };
  return (
    <ModalWrapper title={`${type} Book`} Icon={type==='issue'?Sparkles:ArrowLeftRight} color="green">
        {message && <div className="mb-4 p-3 bg-blue-500/20 rounded-lg text-blue-200 text-sm">{message}</div>}
        <div className="space-y-4">
          <input type="email" placeholder="Student Email" value={formData.userEmail} onChange={e => setFormData({...formData, userEmail: e.target.value})} readOnly={!isAdmin} className={`w-full px-4 py-2 bg-black/30 border border-white/10 rounded-lg text-white outline-none ${!isAdmin ? 'opacity-50' : ''}`} />
          <input type="text" placeholder="Book No" value={formData.bookNo} onChange={e => setFormData({...formData, bookNo: e.target.value})} className="w-full px-4 py-2 bg-black/30 border border-white/10 rounded-lg text-white outline-none" />
          <div className="flex gap-2 mt-4"><button onClick={handleSubmit} className="flex-1 py-2 bg-blue-600 rounded-lg font-bold capitalize">{type}</button><button onClick={onClose} className="flex-1 py-2 bg-white/10 rounded-lg font-bold">Cancel</button></div>
        </div>
    </ModalWrapper>
  );
};

// --- 4. MAIN DASHBOARD ---
export const Dashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('books');
  const [books, setBooks] = useState([]);
  const [transactions, setTransactions] = useState([]); 
  const [searchTitle, setSearchTitle] = useState('');
  const [searchType, setSearchType] = useState('');
  const [loading, setLoading] = useState(false);
  const [modals, setModals] = useState({ add: false, trans: false, admin: false });
  const [transactionType, setTransactionType] = useState('issue');
  const [selectedBookNo, setSelectedBookNo] = useState('');
  const [viewingBook, setViewingBook] = useState(null);

  const isAdmin = (user.userType === 'ADMIN') || (user.authorities && user.authorities.includes('ADMIN'));

  useEffect(() => {
    if (activeTab === 'books') fetchBooks();
    if (activeTab === 'transactions') fetchTransactions();
  }, [activeTab, searchType]);

  const fetchBooks = async () => {
    setLoading(true);
    try { const res = await api.getBooks(user, searchTitle, searchType); if (res.ok) setBooks(await res.json()); } catch (e) {} finally { setLoading(false); }
  };
  const fetchTransactions = async () => {
    setLoading(true);
    try { const res = await api.getTransactions(user); if (res.ok) setTransactions(await res.json()); } catch (e) {} finally { setLoading(false); }
  };
  const deleteBook = async (no) => {
    if(window.confirm(`Delete ${no}?`)) { await api.deleteBook(user, no); fetchBooks(); }
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
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-blue-500/30"><BookOpen className="w-6 h-6 text-white" /></div>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-200">LMS_Classic</h1>
                <div className="flex items-center gap-2 text-xs font-medium text-blue-200/70">
                  {user.name || user.username}
                  <span className={`px-1.5 py-0.5 rounded border ${isAdmin ? 'border-purple-500/50 bg-purple-500/10 text-purple-200' : 'border-blue-500/50 bg-blue-500/10 text-blue-200'}`}>{isAdmin ? 'ADMIN' : 'STUDENT'}</span>
                </div>
              </div>
            </div>
            <button onClick={onLogout} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-200 hover:bg-red-500/20 transition-all"><LogOut className="w-4 h-4" /> Exit</button>
          </div>
        </header>

        <main className="flex-grow max-w-7xl mx-auto w-full px-6 py-8">
          <GlassCard className="inline-flex mb-8 !rounded-xl !p-1">
            <div className="p-1 flex gap-1">
              {['books', 'transactions'].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm transition-all ${activeTab === tab ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                  {tab === 'books' ? <Book className="w-4 h-4"/> : <ArrowLeftRight className="w-4 h-4"/>}
                  {tab === 'books' ? 'Collection' : 'Archives'}
                </button>
              ))}
            </div>
          </GlassCard>

          {activeTab === 'books' && (
            <div className="space-y-8 animate-fade-in">
              <GlassCard className="!p-0">
                <div className="p-4 flex flex-wrap gap-4 items-center justify-between">
                  <div className="flex flex-1 gap-3 min-w-[280px]">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4"/>
                        <input type="text" placeholder="Search titles..." value={searchTitle} onChange={e => setSearchTitle(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-black/30 border border-white/10 rounded-lg text-sm text-white focus:border-blue-500 outline-none" />
                    </div>
                    <select value={searchType} onChange={e => setSearchType(e.target.value)} className="px-4 py-2.5 bg-black/30 border border-white/10 rounded-lg text-sm text-white outline-none cursor-pointer"><option value="">All Types</option><option value="PROGRAMMING">Programming</option><option value="HISTORY">History</option><option value="ENGLISH">English</option></select>
                    <button onClick={fetchBooks} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-lg font-bold text-sm shadow-lg">Go</button>
                  </div>
                  {isAdmin && (
                    <div className="flex gap-3 pl-4 border-l border-white/10">
                        <button onClick={() => setModals({...modals, add: true})} className="p-2.5 bg-green-500/20 text-green-300 border border-green-500/30 rounded-lg hover:bg-green-500/30 transition"><Plus className="w-5 h-5"/></button>
                        <button onClick={() => setModals({...modals, admin: true})} className="p-2.5 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-lg hover:bg-purple-500/30 transition"><UserPlus className="w-5 h-5"/></button>
                    </div>
                  )}
                </div>
              </GlassCard>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? <div className="col-span-full text-center py-20 text-blue-200/50 font-medium animate-pulse">Scanning shelves...</div> : 
                 books.length === 0 ? <GlassCard className="col-span-full !p-0"><div className="p-12 text-center text-gray-400">No books found.</div></GlassCard> :
                 books.map((book) => {
                  const isIssued = book.user !== null && book.user !== undefined;
                  const author = book.author?.name || book.authorName || 'Unknown';
                  return (
                  <GlassCard key={book.id || book.bookNo} onClick={() => setViewingBook(book)} className="hover:-translate-y-2 transition-transform duration-300 cursor-pointer">
                    <div className="p-6 flex flex-col h-full">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-[10px] font-bold tracking-widest text-blue-300 uppercase bg-blue-500/10 px-2 py-1 rounded border border-blue-500/20">{book.bookType}</span>
                            {isAdmin && <button onClick={(e) => { e.stopPropagation(); deleteBook(book.bookNo); }} className="text-gray-500 hover:text-red-400 p-1"><Trash2 className="w-4 h-4"/></button>}
                        </div>
                        <h3 className="text-xl font-bold text-white leading-tight mb-1">{book.bookTitle}</h3>
                        <div className="flex items-center gap-2 mb-6"><Feather className="w-3 h-3 text-blue-400" /><span className="text-sm font-semibold text-blue-200">{author}</span></div>
                        <div className="mt-auto pt-4 border-t border-white/10 flex justify-between items-center text-xs text-gray-400 mb-4"><span>Ref: {book.bookNo}</span><span className="font-mono text-green-400 bg-green-500/10 px-2 py-0.5 rounded">₹{book.securityAmount}</span></div>
                        <div onClick={(e) => e.stopPropagation()}>
                            <button onClick={() => !isIssued && (setSelectedBookNo(book.bookNo), setTransactionType('issue'), setModals({...modals, trans: true}))} disabled={isIssued} className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${isIssued ? 'bg-black/30 text-gray-500 cursor-not-allowed border border-white/5' : 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg hover:shadow-blue-500/40'}`}>{isIssued ? <><Clock className="w-4 h-4"/> Issued</> : <><Sparkles className="w-4 h-4"/> Issue</>}</button>
                        </div>
                    </div>
                  </GlassCard>
                )})}
              </div>
            </div>
          )}

          {activeTab === 'transactions' && (
            <div className="space-y-6 animate-fade-in">
              <GlassCard className="!p-0">
                <div className="p-6 flex flex-wrap justify-between items-center gap-4">
                    <div><h2 className="text-xl font-bold text-white">Archives</h2><p className="text-sm text-gray-400">Transaction history log.</p></div>
                    <div className="flex gap-3">
                        <button onClick={() => { setTransactionType('issue'); setModals({...modals, trans: true}); }} className="px-5 py-2.5 bg-green-600 hover:bg-green-500 rounded-xl text-white font-bold text-sm shadow-lg flex items-center gap-2"><Plus className="w-4 h-4"/> Issue</button>
                        {isAdmin && <button onClick={() => { setTransactionType('return'); setModals({...modals, trans: true}); }} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl text-white font-bold text-sm shadow-lg flex items-center gap-2"><ArrowLeftRight className="w-4 h-4"/> Return</button>}
                    </div>
                </div>
                <div className="overflow-x-auto custom-scroll border-t border-white/10">
                    <table className="w-full text-left">
                        <thead className="bg-black/20 text-gray-400 text-xs uppercase font-bold">
                            <tr><th className="px-6 py-4">ID</th><th className="px-6 py-4">Book</th>{isAdmin && <th className="px-6 py-4">User</th>}<th className="px-6 py-4">Status</th><th className="px-6 py-4">Date</th><th className="px-6 py-4 text-right">Fine</th></tr>
                        </thead>
                        <tbody className="text-sm text-gray-300 divide-y divide-white/5">
                            {loading ? <tr><td colSpan="6" className="p-8 text-center">Loading...</td></tr> : transactions.map(t => (
                                <tr key={t.id} className="hover:bg-white/5">
                                    <td className="px-6 py-4 font-mono text-xs text-gray-500">#{String(t.transactionId || t.id).substring(0,6)}</td>
                                    <td className="px-6 py-4"><div className="text-white font-medium">{t.book?.bookTitle}</div><div className="text-xs text-gray-500">{t.book?.bookNo}</div></td>
                                    {isAdmin && <td className="px-6 py-4 text-blue-300">{t.user?.email}</td>}
                                    <td className="px-6 py-4"><span className={`px-2 py-1 text-[10px] font-bold rounded border ${t.transactionStatus==='ISSUED'?'bg-yellow-500/10 text-yellow-200 border-yellow-500/30':'bg-green-500/10 text-green-200 border-green-500/30'}`}>{t.transactionStatus}</span></td>
                                    <td className="px-6 py-4 text-gray-400 text-xs">{new Date(t.createdOn).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 text-right font-mono">{t.fineAmount || '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
              </GlassCard>
            </div>
          )}
        </main>
      </div>

      {modals.admin && <AdminRegisterModal user={user} onClose={() => setModals({...modals, admin: false})} />}
      {modals.add && <AddBookModal user={user} onClose={() => setModals({...modals, add: false})} onSuccess={fetchBooks} />}
      {modals.trans && <TransactionModal type={transactionType} user={user} isAdmin={isAdmin} initialBookNo={selectedBookNo} onClose={() => { setModals({...modals, trans: false}); setSelectedBookNo(''); }} onSuccess={() => { fetchBooks(); fetchTransactions(); }} />}
      {viewingBook && <BookDetailModal book={viewingBook} onClose={() => setViewingBook(null)} />}
    </div>
  );
};