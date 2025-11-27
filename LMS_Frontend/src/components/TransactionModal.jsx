// import React, { useState } from 'react';
// import { api } from '../services/api';

// export const TransactionModal = ({ type, userEmail, onClose }) => {
//   // ... paste the TransactionModal component code here
//   const [formData, setFormData] = useState({ userEmail: userEmail || '', bookNo: '' });
//   const [message, setMessage] = useState('');

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const endpoint = type === 'issue' ? api.issueBook : api.returnBook;
//       const response = await endpoint(formData);
//       if (response.ok) {
//         const data = await response.json();
//         setMessage(`Book ${type === 'issue' ? 'issued' : 'returned'} successfully!${type === 'return' && data.settlementAmount ? ` Fine: ₹${data.settlementAmount}` : ''}`);
//         setTimeout(onClose, 2000);
//       } else {
//         const error = await response.json();
//         setMessage(error.message || 'Transaction failed');
//       }
//     } catch (err) {
//       setMessage('Connection error');
//     }
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//       <div className="bg-white rounded-lg max-w-md w-full p-6">
//         <h3 className="text-2xl font-bold mb-4">{type === 'issue' ? 'Issue Book' : 'Return Book'}</h3>
//         {message && <div className="mb-4 p-3 bg-blue-50 text-blue-700 rounded-lg">{message}</div>}
//         <form onSubmit={handleSubmit} className="space-y-4">
//           <input
//             type="email"
//             placeholder="User Email"
//             value={formData.userEmail}
//             onChange={(e) => setFormData({...formData, userEmail: e.target.value})}
//             className="w-full px-4 py-2 border border-gray-300 rounded-lg"
//             required
//           />
//           <input
//             type="text"
//             placeholder="Book Number"
//             value={formData.bookNo}
//             onChange={(e) => setFormData({...formData, bookNo: e.target.value})}
//             className="w-full px-4 py-2 border border-gray-300 rounded-lg"
//             required
//           />
//           <div className="flex gap-3">
//             <button type="submit" className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
//               {type === 'issue' ? 'Issue' : 'Return'}
//             </button>
//             <button type="button" onClick={onClose} className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
//               Cancel
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );

// };