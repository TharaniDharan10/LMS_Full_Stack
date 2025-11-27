import React, { useState, useEffect } from 'react';
import { BookOpen, LogOut, Search, Plus, Book, ArrowLeftRight, UserPlus, Clock, Trash2, Sparkles, User, Feather, X, TrendingUp, Users, AlertCircle, PieChart as PieIcon } from 'lucide-react'; 
import { api } from '../services/api';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

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
    background-color: #fdf6e3; background-image: radial-gradient(#dcc096 1px, transparent 1px); background-size: 20px 20px;
    box-shadow: inset 0 0 40px 10px rgba(101, 67, 33, 0.5), 0 20px 50px rgba(0,0,0,0.8); border: 1px solid #8b4513; color: #3d2b1f; font-family: 'Georgia', serif;
  }
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

// --- 3. MODALS ---
const BookDetailModal = ({ book, onClose }) => {
    if (!book) return null;
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in" onClick={onClose}>
        <div className="w-full max-w-lg relative transform transition-all hover:scale-[1.01]" onClick={e => e.stopPropagation()}>
          <div className="manuscript-paper rounded-lg p-10 relative min-h-[400px] flex flex-col">
              <div className="text-center border-b-2 border-[#8b4513]/20 pb-4 mb-4">
                  <h2 className="text-3xl font-bold uppercase tracking-widest text-[#5c3a21]">{book.bookTitle}</h2>
                  <div className="flex justify-center items-center gap-2 mt-2 text-[#8b4513] italic">
                    <Feather className="w-4 h-4" /><span>{book.author?.name || book.authorName || 'Unknown Author'}</span>
                  </div>
              </div>
              <div className="flex-grow overflow-y-auto custom-scroll pr-2">
                <h4 className="text-xs font-bold uppercase tracking-widest text-[#8b4513]/60 mb-2">Synopsis</h4>
                <p className="text-lg leading-relaxed text-justify font-serif text-[#3d2b1f]">{book.summary || "No summary has been recorded for this book in the archives."}</p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#8b4513]/20 flex justify-between text-sm font-bold text-[#8b4513]"><span>Ref: {book.bookNo}</span><span>Cost: ₹{book.securityAmount}</span></div>
              <button onClick={onClose} className="absolute top-3 right-3 text-[#8b4513] hover:text-red-800"><X className="w-6 h-6"/></button>
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
          <textarea placeholder="Summary..." onChange={e => setFormData({...formData, summary: e.target.value})} className="w-full px-4 py-2 bg-black/30 border border-white/10 rounded-lg text-white outline-none h-20 resize-none text-sm" />
          <div className="flex gap-2 mt-2"><button onClick={handleSubmit} className="flex-1 py-2 bg-green-600 rounded-lg font-bold">Add</button><button onClick={onClose} className="flex-1 py-2 bg-white/10 rounded-lg font-bold">Cancel</button></div>
        </div>
    </ModalWrapper>
  );
};

const PaymentModal = ({ amount, onConfirm, onCancel }) => {
    const [processing, setProcessing] = useState(false);
    const handlePay = () => {
        setProcessing(true);
        setTimeout(() => {
            const mockPaymentId = "pay_mock_" + Math.random().toString(36).substr(2, 9);
            onConfirm(mockPaymentId);
        }, 2000);
    };
    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <div className="bg-white rounded-2xl w-full max-w-sm p-6 relative overflow-hidden shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-800">Secure Payment</h3>
                    <button onClick={onCancel} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5"/></button>
                </div>
                <div className="bg-blue-50 p-4 rounded-xl mb-6 text-center border border-blue-100">
                    <p className="text-sm text-gray-500 uppercase tracking-wide">Total Deposit</p>
                    <p className="text-3xl font-bold text-blue-600">₹{amount}</p>
                </div>
                <div className="space-y-3 mb-6">
                    <input type="text" placeholder="Card Number" className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-700 outline-none" />
                    <div className="flex gap-3">
                        <input type="text" placeholder="MM/YY" className="w-1/2 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 outline-none" />
                        <input type="text" placeholder="CVV" className="w-1/2 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 outline-none" />
                    </div>
                </div>
                <button onClick={handlePay} disabled={processing} className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition">
                    {processing ? "Processing..." : `Pay ₹${amount}`}
                </button>
            </div>
        </div>
    );
};

const TransactionModal = ({ type, user, isAdmin, initialBookNo, onClose, onSuccess, books }) => {
  const [formData, setFormData] = useState({ userEmail: isAdmin ? '' : (user.email || user.username), bookNo: initialBookNo || '' });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showPayment, setShowPayment] = useState(false);
  const [amountToPay, setAmountToPay] = useState(0);

  const initiateTransaction = () => {
    if(!formData.userEmail || !formData.bookNo) { setMessage({ type: 'error', text: 'Please fill all fields' }); return; }
    if (type === 'issue') {
        const targetBook = books?.find(b => b.bookNo === formData.bookNo);
        if (!targetBook) { setMessage({ type: 'error', text: 'Invalid Book Number.' }); return; }
        setAmountToPay(targetBook.securityAmount);
        setShowPayment(true);
    } else {
        processTransaction(null);
    }
  };

  const processTransaction = async (paymentId) => {
    setShowPayment(false); setMessage({ type: 'info', text: 'Processing...' });
    try {
      const endpoint = type === 'issue' ? api.issueBook : api.returnBook;
      const response = await endpoint(user, { ...formData, paymentId });
      if (response.ok) { 
          const data = await response.json(); 
          setMessage({ type: 'success', text: `Success! ${type === 'return' ? `Fine: ${data}` : `Ref: ${paymentId}`}` }); 
          setTimeout(() => { onSuccess(); onClose(); }, 2000); 
      } else { 
          const err = await response.text(); 
          try { setMessage({ type: 'error', text: JSON.parse(err).message || err }); } 
          catch(e) { setMessage({ type: 'error', text: err || 'Failed' }); } 
      }
    } catch (err) { setMessage({ type: 'error', text: 'Connection error' }); }
  };

  return (
    <>
        {showPayment && <PaymentModal amount={amountToPay} onConfirm={processTransaction} onCancel={() => setShowPayment(false)} />}
        {!showPayment && (
            <ModalWrapper title={`${type} Book`} Icon={type==='issue'?Sparkles:ArrowLeftRight} color="green">
                {message.text && <div className={`mb-4 p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-500/20 text-green-200' : 'bg-red-500/20 text-red-200'}`}>{message.text}</div>}
                <div className="space-y-4">
                <input type="email" placeholder="Student Email" value={formData.userEmail} onChange={e => setFormData({...formData, userEmail: e.target.value})} readOnly={!isAdmin} className={`w-full px-4 py-2 bg-black/30 border border-white/10 rounded-lg text-white outline-none ${!isAdmin ? 'opacity-50' : ''}`} />
                <input type="text" placeholder="Book No" value={formData.bookNo} onChange={e => setFormData({...formData, bookNo: e.target.value})} className="w-full px-4 py-2 bg-black/30 border border-white/10 rounded-lg text-white outline-none" />
                <div className="flex gap-2 mt-4">
                    <button onClick={initiateTransaction} className="flex-1 py-2 bg-blue-600 rounded-lg font-bold capitalize">{type === 'issue' ? 'Pay & Issue' : 'Return'}</button>
                    <button onClick={onClose} className="flex-1 py-2 bg-white/10 rounded-lg font-bold">Cancel</button>
                </div>
                </div>
            </ModalWrapper>
        )}
    </>
  );
};

// --- 4. MAIN DASHBOARD ---
export const Dashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('books');
  const [books, setBooks] = useState([]);
  const [transactions, setTransactions] = useState([]); 
  const [analytics, setAnalytics] = useState(null); 
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
    if (activeTab === 'analytics' && isAdmin) fetchAnalytics();
  }, [activeTab, searchType]);

  const fetchBooks = async () => { setLoading(true); try { const res = await api.getBooks(user, searchTitle, searchType); if (res.ok) setBooks(await res.json()); } catch (e) {} finally { setLoading(false); } };
  const fetchTransactions = async () => { setLoading(true); try { const res = await api.getTransactions(user); if (res.ok) setTransactions(await res.json()); } catch (e) {} finally { setLoading(false); } };
  const fetchAnalytics = async () => { setLoading(true); try { const res = await api.getAnalytics(user); if (res.ok) setAnalytics(await res.json()); } catch (e) {} finally { setLoading(false); } };
  const deleteBook = async (no) => { if(window.confirm(`Delete ${no}?`)) { await api.deleteBook(user, no); fetchBooks(); } };

  // Helper for Pie Chart Data
  const getPieData = () => {
    if (!analytics?.booksByType) return [];
    return Object.keys(analytics.booksByType).map(key => ({ name: key, value: analytics.booksByType[key] }));
  };
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="min-h-screen relative overflow-hidden font-sans text-gray-100 selection:bg-blue-500/30">
      <style>{dashboardStyles}</style>
      <div className="fixed inset-0 z-0 library-aisle-bg"></div>
      <div className="fixed inset-0 z-0 bg-black/70"></div>
      <Fireflies />

      <div className="relative z-10 flex flex-col min-h-screen">
        <header className="sticky top-0 z-40 backdrop-blur-md bg-black/20 border-b border-white/10">
          <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-4"><div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-blue-500/30"><BookOpen className="w-6 h-6 text-white" /></div><div><h1 className="text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-200">LMS_Classic</h1><div className="flex items-center gap-2 text-xs font-medium text-blue-200/70">{user.name||user.username}<span className={`px-1.5 py-0.5 rounded border ${isAdmin?'border-purple-500/50 bg-purple-500/10 text-purple-200':'border-blue-500/50 bg-blue-500/10 text-blue-200'}`}>{isAdmin?'ADMIN':'STUDENT'}</span></div></div></div>
            <button onClick={onLogout} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-200 hover:bg-red-500/20 transition-all"><LogOut className="w-4 h-4" /> Exit</button>
          </div>
        </header>

        <main className="flex-grow max-w-7xl mx-auto w-full px-6 py-8">
          <GlassCard className="inline-flex mb-8 !rounded-xl !p-1">
            <div className="p-1 flex gap-1">
              {['books', 'transactions', ...(isAdmin ? ['analytics'] : [])].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm transition-all capitalize ${activeTab === tab ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                  {tab === 'books' && <Book className="w-4 h-4"/>}
                  {tab === 'transactions' && <ArrowLeftRight className="w-4 h-4"/>}
                  {tab === 'analytics' && <TrendingUp className="w-4 h-4"/>}
                  {tab === 'books' ? 'Collection' : tab}
                </button>
              ))}
            </div>
          </GlassCard>

          {/* BOOKS TAB */}
          {activeTab === 'books' && (
            <div className="space-y-8 animate-fade-in">
              <GlassCard className="!p-0"><div className="p-4 flex flex-wrap gap-4 items-center justify-between"><div className="flex flex-1 gap-3 min-w-[280px]"><div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4"/><input type="text" placeholder="Search..." value={searchTitle} onChange={e => setSearchTitle(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-black/30 border border-white/10 rounded-lg text-sm text-white outline-none" /></div><select value={searchType} onChange={e => setSearchType(e.target.value)} className="px-4 py-2.5 bg-black/30 border border-white/10 rounded-lg text-sm text-white outline-none cursor-pointer"><option value="">All Types</option><option value="PROGRAMMING">Programming</option><option value="HISTORY">History</option><option value="ENGLISH">English</option></select><button onClick={fetchBooks} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-lg font-bold text-sm shadow-lg">Go</button></div>{isAdmin && <div className="flex gap-3 pl-4 border-l border-white/10"><button onClick={() => setModals({...modals, add: true})} className="p-2.5 bg-green-500/20 text-green-300 border border-green-500/30 rounded-lg hover:bg-green-500/30 transition"><Plus className="w-5 h-5"/></button><button onClick={() => setModals({...modals, admin: true})} className="p-2.5 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-lg hover:bg-purple-500/30 transition"><UserPlus className="w-5 h-5"/></button></div>}</div></GlassCard>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? <div className="col-span-full text-center py-20 text-blue-200/50 font-medium animate-pulse">Scanning shelves...</div> : books.map((book) => {
                  const isIssued = book.user !== null && book.user !== undefined;
                  const author = book.author?.name || book.authorName || 'Unknown';
                  return (<GlassCard key={book.id || book.bookNo} onClick={() => setViewingBook(book)} className="hover:-translate-y-2 transition-transform duration-300 cursor-pointer"><div className="p-6 flex flex-col h-full"><div className="flex justify-between items-start mb-2"><span className="text-[10px] font-bold tracking-widest text-blue-300 uppercase bg-blue-500/10 px-2 py-1 rounded border border-blue-500/20">{book.bookType}</span>{isAdmin && <button onClick={(e) => { e.stopPropagation(); deleteBook(book.bookNo); }} className="text-gray-500 hover:text-red-400 p-1"><Trash2 className="w-4 h-4"/></button>}</div><h3 className="text-xl font-bold text-white leading-tight mb-1">{book.bookTitle}</h3><div className="flex items-center gap-2 mb-6"><Feather className="w-3 h-3 text-blue-400" /><span className="text-sm font-semibold text-blue-200">{author}</span></div><div className="mt-auto pt-4 border-t border-white/10 flex justify-between items-center text-xs text-gray-400 mb-4"><span>Ref: {book.bookNo}</span><span className="font-mono text-green-400 bg-green-500/10 px-2 py-0.5 rounded">₹{book.securityAmount}</span></div><div onClick={(e) => e.stopPropagation()}><button onClick={() => !isIssued && (setSelectedBookNo(book.bookNo), setTransactionType('issue'), setModals({...modals, trans: true}))} disabled={isIssued} className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${isIssued ? 'bg-black/30 text-gray-500 cursor-not-allowed border border-white/5' : 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg hover:shadow-blue-500/40'}`}>{isIssued ? <><Clock className="w-4 h-4"/> Issued</> : <><Sparkles className="w-4 h-4"/> Issue</>}</button></div></div></GlassCard>);
                })}
              </div>
            </div>
          )}

          {/* TRANSACTIONS TAB */}
          {activeTab === 'transactions' && (
            <div className="space-y-6 animate-fade-in">
              <GlassCard className="!p-0">
                <div className="p-6 flex flex-wrap justify-between items-center gap-4"><div><h2 className="text-xl font-bold text-white">Archives</h2><p className="text-sm text-gray-400">History log.</p></div><div className="flex gap-3"><button onClick={() => { setTransactionType('issue'); setModals({...modals, trans: true}); }} className="px-5 py-2.5 bg-green-600 hover:bg-green-500 rounded-xl text-white font-bold text-sm shadow-lg flex items-center gap-2"><Plus className="w-4 h-4"/> Issue</button>{isAdmin && <button onClick={() => { setTransactionType('return'); setModals({...modals, trans: true}); }} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl text-white font-bold text-sm shadow-lg flex items-center gap-2"><ArrowLeftRight className="w-4 h-4"/> Return</button>}</div></div>
                <div className="overflow-x-auto custom-scroll border-t border-white/10"><table className="w-full text-left"><thead className="bg-black/20 text-gray-400 text-xs uppercase font-bold"><tr><th className="px-6 py-4">ID</th><th className="px-6 py-4">Book</th>{isAdmin && <th className="px-6 py-4">User</th>}<th className="px-6 py-4">Status</th><th className="px-6 py-4">Date</th><th className="px-6 py-4 text-right">Fine</th></tr></thead><tbody className="text-sm text-gray-300 divide-y divide-white/5">{loading ? <tr><td colSpan="6" className="p-8 text-center">Loading...</td></tr> : transactions.map(t => (<tr key={t.id} className="hover:bg-white/5"><td className="px-6 py-4 font-mono text-xs text-gray-500">#{String(t.transactionId||t.id).substring(0,6)}</td><td className="px-6 py-4"><div className="text-white font-medium">{t.book?.bookTitle}</div><div className="text-xs text-gray-500">{t.book?.bookNo}</div></td>{isAdmin && <td className="px-6 py-4 text-blue-300">{t.user?.email}</td>}<td className="px-6 py-4"><span className={`px-2 py-1 text-[10px] font-bold rounded border ${t.transactionStatus==='ISSUED'?'bg-yellow-500/10 text-yellow-200 border-yellow-500/30':'bg-green-500/10 text-green-200 border-green-500/30'}`}>{t.transactionStatus}</span></td><td className="px-6 py-4 text-gray-400 text-xs">{new Date(t.createdOn).toLocaleDateString()}</td><td className="px-6 py-4 text-right font-mono">{t.fineAmount || '-'}</td></tr>))}</tbody></table></div>
              </GlassCard>
            </div>
          )}

          {/* ANALYTICS TAB (Layout Fixed) */}
          {activeTab === 'analytics' && analytics && (
            <div className="space-y-8 animate-fade-in">
                {/* 1. KPI Cards - Fixed Content Padding */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <GlassCard><div className="p-6 flex items-center justify-between h-full"><div><p className="text-sm text-gray-400 uppercase tracking-wider">Total Books</p><h3 className="text-3xl font-bold text-white mt-1">{analytics.totalBooks}</h3></div><div className="p-3 bg-blue-500/20 rounded-xl"><Book className="w-6 h-6 text-blue-400"/></div></div></GlassCard>
                    <GlassCard><div className="p-6 flex items-center justify-between h-full"><div><p className="text-sm text-gray-400 uppercase tracking-wider">Members</p><h3 className="text-3xl font-bold text-white mt-1">{analytics.totalStudents}</h3></div><div className="p-3 bg-purple-500/20 rounded-xl"><Users className="w-6 h-6 text-purple-400"/></div></div></GlassCard>
                    <GlassCard><div className="p-6 flex items-center justify-between h-full"><div><p className="text-sm text-gray-400 uppercase tracking-wider">Active Issues</p><h3 className="text-3xl font-bold text-white mt-1">{analytics.activeIssues}</h3></div><div className="p-3 bg-yellow-500/20 rounded-xl"><Clock className="w-6 h-6 text-yellow-400"/></div></div></GlassCard>
                    <GlassCard><div className="p-6 flex items-center justify-between h-full"><div><p className="text-sm text-gray-400 uppercase tracking-wider">KPI Status</p><h3 className="text-lg font-bold text-green-400 mt-1">Healthy</h3></div><div className="p-3 bg-green-500/20 rounded-xl"><TrendingUp className="w-6 h-6 text-green-400"/></div></div></GlassCard>
                </div>

                {/* 2. Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <GlassCard>
                        <div className="p-6 min-h-[300px]">
                            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><PieIcon className="w-5 h-5 text-blue-400"/> Book Distribution</h3>
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie data={getPieData()} cx="50%" cy="50%" innerRadius={60} outerRadius={80} fill="#8884d8" paddingAngle={5} dataKey="value">
                                        {getPieData().map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                                    </Pie>
                                    <Tooltip contentStyle={{backgroundColor: '#1f2937', borderColor: '#374151', color:'#fff'}} itemStyle={{color:'#fff'}} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </GlassCard>
                    
                    <GlassCard>
                        <div className="p-6 min-h-[300px] flex items-center justify-center text-center">
                            <div>
                                <h3 className="text-lg font-bold text-white mb-2">More Insights Coming Soon</h3>
                                <p className="text-gray-400 text-sm">Revenue charts and detailed user activity will appear here in Phase 3.</p>
                            </div>
                        </div>
                    </GlassCard>
                </div>
            </div>
          )}
        </main>
      </div>

      {modals.admin && <AdminRegisterModal user={user} onClose={() => setModals({...modals, admin: false})} />}
      {modals.add && <AddBookModal user={user} onClose={() => setModals({...modals, add: false})} onSuccess={fetchBooks} />}
      {modals.trans && <TransactionModal type={transactionType} user={user} isAdmin={isAdmin} initialBookNo={selectedBookNo} onClose={() => { setModals({...modals, trans: false}); setSelectedBookNo(''); }} onSuccess={() => { fetchBooks(); fetchTransactions(); }} books={books} />} 
      {viewingBook && <BookDetailModal book={viewingBook} onClose={() => setViewingBook(null)} />}
    </div>
  );
};