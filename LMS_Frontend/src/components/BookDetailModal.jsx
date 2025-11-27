// const BookDetailModal = ({ book, onClose }) => {
//   if (!book) return null;

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in" onClick={onClose}>
//       {/* Stop click propagation so clicking the paper doesn't close it */}
//       <div className="w-full max-w-lg transform transition-all" onClick={e => e.stopPropagation()}>
        
//         {/* The Manuscript */}
//         <div className="manuscript-paper ragged-edges p-12 relative">
//             {/* Decorative Header */}
//             <div className="text-center border-b-2 border-[#8b4513] pb-4 mb-6">
//                 <h2 className="text-3xl font-bold uppercase tracking-widest text-[#5c3a21]">{book.bookTitle}</h2>
//                 <p className="text-sm italic mt-2 font-serif">Authored by {book.author?.name || book.authorName}</p>
//             </div>

//             {/* The Summary Text */}
//             <div className="text-lg leading-relaxed text-justify font-serif opacity-90 min-h-[200px]">
//                 {book.summary ? book.summary : "No ancient records found for this tome..."}
//             </div>

//             {/* Footer Details */}
//             <div className="mt-8 pt-4 border-t border-[#8b4513] flex justify-between text-sm font-bold text-[#8b4513]">
//                 <span>Ref: {book.bookNo}</span>
//                 <span>Valued at ₹{book.securityAmount}</span>
//             </div>

//             {/* Close 'X' that looks like ink */}
//             <button onClick={onClose} className="absolute top-4 right-4 text-[#8b4513] hover:text-red-800 text-xl font-bold">✕</button>
//         </div>
//       </div>
//     </div>
//   );
// };