// import { useState, useEffect } from "react";
// import { API } from "../api/api";
// import { useAuth } from "../context/AuthContext";
// import { toast } from 'sonner';

// export default function Comments({ projectId }) {
//   const { user } = useAuth();
//   const [comments, setComments] = useState([]);
//   const [newComment, setNewComment] = useState("");
//   const [replyText, setReplyText] = useState({});
//   const [showReplyBox, setShowReplyBox] = useState({});
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     fetchComments();
//   }, [projectId]);

//   const fetchComments = async () => {
//     try {
//       const res = await API.get(`/projects/${projectId}/comments`);
//       setComments(res.data);
//     } catch (err) {
//       console.error("Fetch comments error:", err);
//     }
//   };

//   const handleAddComment = async (e) => {
//     e.preventDefault();
    
//     if (!user) {
//       toast.error("Please login to comment");
//       return;
//     }

//     if (!newComment.trim()) {
//       toast.error("Please enter a comment");
//       return;
//     }

//     setLoading(true);
//     try {
//       const token = localStorage.getItem("token");
//       await API.post(
//         `/projects/${projectId}/comments`,
//         { text: newComment },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
      
//       setNewComment("");
//       fetchComments();
//       toast.success("Comment added!");
//     } catch (err) {
//       console.error("Add comment error:", err);
//       toast.error("Failed to add comment");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDeleteComment = async (commentId) => {
//     if (!window.confirm("Delete this comment?")) return;

//     try {
//       const token = localStorage.getItem("token");
//       await API.delete(`/projects/${projectId}/comments/${commentId}`, {
//         headers: { Authorization: `Bearer ${token}` }
//       });
      
//       fetchComments();
//       toast.success("Comment deleted");
//     } catch (err) {
//       console.error("Delete comment error:", err);
//       toast.error("Failed to delete comment");
//     }
//   };

//   const handleAddReply = async (commentId) => {
//     if (!user) {
//       toast.error("Please login to reply");
//       return;
//     }

//     const text = replyText[commentId];
//     if (!text?.trim()) {
//       toast.error("Please enter a reply");
//       return;
//     }

//     try {
//       const token = localStorage.getItem("token");
//       await API.post(
//         `/projects/${projectId}/comments/${commentId}/replies`,
//         { text },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
      
//       setReplyText({ ...replyText, [commentId]: "" });
//       setShowReplyBox({ ...showReplyBox, [commentId]: false });
//       fetchComments();
//       toast.success("Reply added!");
//     } catch (err) {
//       console.error("Add reply error:", err);
//       toast.error("Failed to add reply");
//     }
//   };

//   const formatDate = (date) => {
//     const now = new Date();
//     const commentDate = new Date(date);
//     const diffTime = Math.abs(now - commentDate);
//     const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
//     if (diffDays === 0) {
//       const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
//       if (diffHours === 0) {
//         const diffMinutes = Math.floor(diffTime / (1000 * 60));
//         return diffMinutes <= 1 ? "Just now" : `${diffMinutes}m ago`;
//       }
//       return `${diffHours}h ago`;
//     } else if (diffDays === 1) {
//       return "Yesterday";
//     } else if (diffDays < 7) {
//       return `${diffDays}d ago`;
//     } else {
//       return commentDate.toLocaleDateString();
//     }
//   };

//   return (
//     <div className="mt-6 md:mt-8 bg-stone-800 rounded-sm p-4 md:p-6">
//       <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-4 md:mb-6">
//         Comments ({comments.length})
//       </h3>

//       {/* Add Comment Form */}
//       {user ? (
//         <form onSubmit={handleAddComment} className="mb-4 md:mb-6">
//           <div className="flex flex-col sm:flex-row gap-3">
//             {user.avatar ? (
//               <img
//                 src={user.avatar}
//                 alt={user.username}
//                 className="w-10 h-10 rounded-sm flex-shrink-0"
//               />
//             ) : (
//               <div className="w-10 h-10 rounded-sm bg-stone-800 flex items-center justify-center text-white font-bold flex-shrink-0">
//                 {user.username?.charAt(0).toUpperCase()}
//               </div>
//             )}
//             <div className="flex-1 w-full">
//               <textarea
//                 value={newComment}
//                 onChange={(e) => setNewComment(e.target.value)}
//                 placeholder="Write a comment..."
//                 rows="3"
//                 className="w-full p-2 md:p-3 font-semibold border border-stone-600 rounded-sm bg-stone-900 text-stone-50 focus:ring-2 resize-none text-sm md:text-base"
//                 disabled={loading}
//               />
//               <div className="flex justify-end mt-2">
//                 <button
//                   type="submit"
//                   disabled={loading || !newComment.trim()}
//                   className="px-3 md:px-4 py-1.5 md:py-2 text-sm bg-blue-600 hover:bg-stone-900 text-white rounded-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//                 >
//                   {loading ? "Posting..." : "Post Comment"}
//                 </button>
//               </div>
//             </div>
//           </div>
//         </form>
//       ) : (
//         <div className="mb-4 md:mb-6 p-3 md:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
//           <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
//             Please login to comment
//           </p>
//         </div>
//       )}

//       {/* Comments List */}
//       <div className="space-y-3 md:space-y-4">
//         {comments.map((comment) => (
//           <div key={comment._id} className="border-b border-gray-200 dark:border-gray-700 pb-3 md:pb-4 last:border-b-0">
//             {/* Comment */}
//             <div className="flex gap-2 md:gap-3">
//               {comment.user?.avatar ? (
//                 <img
//                   src={comment.user.avatar}
//                   alt={comment.user.username}
//                   className="w-8 h-8 md:w-10 md:h-10 rounded-full flex-shrink-0"
//                 />
//               ) : (
//                 <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm md:text-base flex-shrink-0">
//                   {comment.user?.username?.charAt(0).toUpperCase()}
//                 </div>
//               )}
//               <div className="flex-1 min-w-0">
//                 <div className="flex flex-wrap items-center gap-2 mb-1">
//                   <span className="font-semibold text-stone-100 text-sm md:text-base break-words">
//                     {comment.user?.username}
//                   </span>
//                   <span className="text-xs text-stone-500">
//                     {formatDate(comment.createdAt)}
//                   </span>
//                 </div>
//                 <p className="text-stone-300 whitespace-pre-wrap text-sm md:text-base break-words">
//                   {comment.text}
//                 </p>
                
//                 {/* Comment Actions */}
//                 <div className="flex items-center gap-3 md:gap-4 mt-2">
//                   <button
//                     onClick={() =>
//                       setShowReplyBox({
//                         ...showReplyBox,
//                         [comment._id]: !showReplyBox[comment._id],
//                       })
//                     }
//                     className="text-xs md:text-sm text-stone-300 hover:text-blue-600"
//                   >
//                     Reply
//                   </button>
//                   {user && (comment.user?._id === user._id) && (
//                     <button
//                       onClick={() => handleDeleteComment(comment._id)}
//                       className="text-xs md:text-sm text-red-600 hover:text-red-700"
//                     >
//                       Delete
//                     </button>
//                   )}
//                 </div>

//                 {/* Reply Box */}
//                 {showReplyBox[comment._id] && user && (
//                   <div className="mt-3 ml-0 sm:ml-8">
//                     <textarea
//                       value={replyText[comment._id] || ""}
//                       onChange={(e) =>
//                         setReplyText({
//                           ...replyText,
//                           [comment._id]: e.target.value,
//                         })
//                       }
//                       placeholder="Write a reply..."
//                       rows="2"
//                       className="w-full p-2 border border-stone-600 rounded-sm bg-stone-900 text-stone-100 text-xs md:text-sm font-semibold focus:ring-2 resize-none"
//                     />
//                     <div className="flex gap-2 mt-2">
//                       <button
//                         onClick={() => handleAddReply(comment._id)}
//                         className="px-3 md:px-4 py-1 md:py-1.5 bg-blue-600 hover:bg-stone-900 text-stone-100 rounded-sm text-xs md:text-sm"
//                       >
//                         Reply
//                       </button>
//                       <button
//                         onClick={() =>
//                           setShowReplyBox({
//                             ...showReplyBox,
//                             [comment._id]: false,
//                           })
//                         }
//                         className="px-2 md:px-3 py-1 md:py-1.5 bg-gray-400 hover:bg-stone-900 text-stone-800 hover:text-stone-100 rounded-sm text-xs md:text-sm"
//                       >
//                         Cancel
//                       </button>
//                     </div>
//                   </div>
//                 )}

//                 {/* Replies */}
//                 {comment.replies && comment.replies.length > 0 && (
//                   <div className="mt-3 md:mt-4 ml-0 sm:ml-8 space-y-2 md:space-y-3">
//                     {comment.replies.map((reply, idx) => (
//                       <div key={idx} className="flex gap-2">
//                         {reply.user?.avatar ? (
//                           <img
//                             src={reply.user.avatar}
//                             alt={reply.user.username}
//                             className="w-6 h-6 md:w-8 md:h-8 rounded-full flex-shrink-0"
//                           />
//                         ) : (
//                           <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-xs md:text-sm font-bold flex-shrink-0">
//                             {reply.user?.username?.charAt(0).toUpperCase()}
//                           </div>
//                         )}
//                         <div className="flex-1 min-w-0">
//                           <div className="flex flex-wrap items-center gap-2 mb-1">
//                             <span className="font-semibold text-xs md:text-sm text-gray-900 dark:text-white break-words">
//                               {reply.user?.username}
//                             </span>
//                             <span className="text-xs text-gray-500 dark:text-gray-400">
//                               {formatDate(reply.createdAt)}
//                             </span>
//                           </div>
//                           <p className="text-xs md:text-sm text-gray-700 dark:text-gray-300 break-words">
//                             {reply.text}
//                           </p>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         ))}

//         {comments.length === 0 && (
//           <div className="text-center py-6 md:py-8 text-gray-500 dark:text-gray-400 text-sm md:text-base">
//             No comments yet. Be the first to comment!
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
























// components/Comments.jsx - MODERN DESIGN
// import { useState, useEffect } from "react";
// import { API } from "../api/api";
// import { useAuth } from "../context/AuthContext";
// import { toast } from 'sonner';

// export default function Comments({ projectId }) {
//   const { user } = useAuth();
//   const [comments, setComments] = useState([]);
//   const [newComment, setNewComment] = useState("");
//   const [replyText, setReplyText] = useState({});
//   const [showReplyBox, setShowReplyBox] = useState({});
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     fetchComments();
//   }, [projectId]);

//   const fetchComments = async () => {
//     try {
//       const res = await API.get(`/projects/${projectId}/comments`);
//       setComments(res.data);
//     } catch (err) {
//       console.error("Fetch comments error:", err);
//     }
//   };

//   const handleAddComment = async (e) => {
//     e.preventDefault();
    
//     if (!user) {
//       toast.error("Please login to comment");
//       return;
//     }

//     if (!newComment.trim()) {
//       toast.error("Please enter a comment");
//       return;
//     }

//     setLoading(true);
//     try {
//       const token = localStorage.getItem("token");
//       await API.post(
//         `/projects/${projectId}/comments`,
//         { text: newComment },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
      
//       setNewComment("");
//       fetchComments();
//       toast.success("Comment added! 💬");
//     } catch (err) {
//       console.error("Add comment error:", err);
//       toast.error("Failed to add comment");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDeleteComment = async (commentId) => {
//     if (!window.confirm("⚠️ Delete this comment?")) return;

//     try {
//       const token = localStorage.getItem("token");
//       await API.delete(`/projects/${projectId}/comments/${commentId}`, {
//         headers: { Authorization: `Bearer ${token}` }
//       });
      
//       fetchComments();
//       toast.success("Comment deleted 🗑️");
//     } catch (err) {
//       console.error("Delete comment error:", err);
//       toast.error("Failed to delete comment");
//     }
//   };

//   const handleAddReply = async (commentId) => {
//     if (!user) {
//       toast.error("Please login to reply");
//       return;
//     }

//     const text = replyText[commentId];
//     if (!text?.trim()) {
//       toast.error("Please enter a reply");
//       return;
//     }

//     try {
//       const token = localStorage.getItem("token");
//       await API.post(
//         `/projects/${projectId}/comments/${commentId}/replies`,
//         { text },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
      
//       setReplyText({ ...replyText, [commentId]: "" });
//       setShowReplyBox({ ...showReplyBox, [commentId]: false });
//       fetchComments();
//       toast.success("Reply added! 💬");
//     } catch (err) {
//       console.error("Add reply error:", err);
//       toast.error("Failed to add reply");
//     }
//   };

//   const formatDate = (date) => {
//     const now = new Date();
//     const commentDate = new Date(date);
//     const diffTime = Math.abs(now - commentDate);
//     const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
//     if (diffDays === 0) {
//       const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
//       if (diffHours === 0) {
//         const diffMinutes = Math.floor(diffTime / (1000 * 60));
//         return diffMinutes <= 1 ? "Just now" : `${diffMinutes}m ago`;
//       }
//       return `${diffHours}h ago`;
//     } else if (diffDays === 1) {
//       return "Yesterday";
//     } else if (diffDays < 7) {
//       return `${diffDays}d ago`;
//     } else {
//       return commentDate.toLocaleDateString();
//     }
//   };

//   return (
//     <div className="mt-8 bg-white rounded-3xl shadow-2xl border-2 border-gray-200 p-6 md:p-8">
//       {/* Header */}
//       <div className="flex items-center gap-3 mb-6">
//         <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center">
//           <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
//           </svg>
//         </div>
//         <div>
//           <h3 className="text-2xl font-black text-gray-900">
//             Comments
//           </h3>
//           <p className="text-sm text-gray-600">
//             {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
//           </p>
//         </div>
//       </div>

//       {/* Add Comment Form */}
//       {user ? (
//         <form onSubmit={handleAddComment} className="mb-8">
//           <div className="flex gap-4">
//             {user.avatar ? (
//               <img
//                 src={user.avatar}
//                 alt={user.username}
//                 className="w-12 h-12 rounded-xl object-cover flex-shrink-0 border-2 border-gray-200"
//               />
//             ) : (
//               <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow-lg">
//                 {user.username?.charAt(0).toUpperCase()}
//               </div>
//             )}
//             <div className="flex-1">
//               <textarea
//                 value={newComment}
//                 onChange={(e) => setNewComment(e.target.value)}
//                 placeholder="Share your thoughts..."
//                 rows="3"
//                 className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all resize-none text-gray-900 placeholder-gray-400"
//                 disabled={loading}
//               />
//               <div className="flex justify-end mt-3">
//                 <button
//                   type="submit"
//                   disabled={loading || !newComment.trim()}
//                   className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
//                 >
//                   {loading ? (
//                     <>
//                       <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
//                       <span>Posting...</span>
//                     </>
//                   ) : (
//                     <>
//                       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
//                       </svg>
//                       <span>Post Comment</span>
//                     </>
//                   )}
//                 </button>
//               </div>
//             </div>
//           </div>
//         </form>
//       ) : (
//         <div className="mb-8 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-200 text-center">
//           <svg className="w-16 h-16 text-blue-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
//           </svg>
//           <p className="text-gray-700 font-semibold mb-3">
//             Please login to join the conversation
//           </p>
          
//            <a href="/login"
//             className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl"
//           >
//             Login to Comment
//           </a>
//         </div>
//       )}

//       {/* Comments List */}
//       <div className="space-y-6">
//         {comments.length === 0 ? (
//           <div className="text-center py-12">
//             <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mx-auto mb-4">
//               <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
//               </svg>
//             </div>
//             <h4 className="text-lg font-bold text-gray-900 mb-2">
//               No comments yet
//             </h4>
//             <p className="text-gray-600">
//               Be the first to share your thoughts!
//             </p>
//           </div>
//         ) : (
//           comments.map((comment) => (
//             <div key={comment._id} className="border-b-2 border-gray-100 pb-6 last:border-b-0 last:pb-0">
//               {/* Comment */}
//               <div className="flex gap-4">
//                 {comment.user?.avatar ? (
//                   <img
//                     src={comment.user.avatar}
//                     alt={comment.user.username}
//                     className="w-12 h-12 rounded-xl object-cover flex-shrink-0 border-2 border-gray-200"
//                   />
//                 ) : (
//                   <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow-lg">
//                     {comment.user?.username?.charAt(0).toUpperCase()}
//                   </div>
//                 )}
//                 <div className="flex-1 min-w-0">
//                   <div className="flex items-center gap-3 mb-2">
//                     <span className="font-bold text-gray-900">
//                       {comment.user?.username}
//                     </span>
//                     <span className="text-sm text-gray-500">
//                       {formatDate(comment.createdAt)}
//                     </span>
//                   </div>
//                   <p className="text-gray-700 leading-relaxed whitespace-pre-wrap mb-3">
//                     {comment.text}
//                   </p>
                  
//                   {/* Comment Actions */}
//                   <div className="flex items-center gap-4">
//                     <button
//                       onClick={() =>
//                         setShowReplyBox({
//                           ...showReplyBox,
//                           [comment._id]: !showReplyBox[comment._id],
//                         })
//                       }
//                       className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
//                     >
//                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
//                       </svg>
//                       Reply
//                     </button>
//                     {user && (comment.user?._id === user._id) && (
//                       <button
//                         onClick={() => handleDeleteComment(comment._id)}
//                         className="text-sm font-semibold text-red-600 hover:text-red-700 flex items-center gap-1"
//                       >
//                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
//                         </svg>
//                         Delete
//                       </button>
//                     )}
//                   </div>

//                   {/* Reply Box */}
//                   {showReplyBox[comment._id] && user && (
//                     <div className="mt-4 p-4 bg-gray-50 rounded-2xl border-2 border-gray-200">
//                       <textarea
//                         value={replyText[comment._id] || ""}
//                         onChange={(e) =>
//                           setReplyText({
//                             ...replyText,
//                             [comment._id]: e.target.value,
//                           })
//                         }
//                         placeholder="Write a reply..."
//                         rows="2"
//                         className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all resize-none text-gray-900 placeholder-gray-400"
//                       />
//                       <div className="flex gap-2 mt-3">
//                         <button
//                           onClick={() => handleAddReply(comment._id)}
//                           className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold text-sm transition-all shadow-lg"
//                         >
//                           Post Reply
//                         </button>
//                         <button
//                           onClick={() =>
//                             setShowReplyBox({
//                               ...showReplyBox,
//                               [comment._id]: false,
//                             })
//                           }
//                           className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-semibold text-sm transition-all"
//                         >
//                           Cancel
//                         </button>
//                       </div>
//                     </div>
//                   )}

//                   {/* Replies */}
//                   {comment.replies && comment.replies.length > 0 && (
//                     <div className="mt-4 ml-8 space-y-4">
//                       {comment.replies.map((reply, idx) => (
//                         <div key={idx} className="flex gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-200">
//                           {reply.user?.avatar ? (
//                             <img
//                               src={reply.user.avatar}
//                               alt={reply.user.username}
//                               className="w-10 h-10 rounded-xl object-cover flex-shrink-0 border-2 border-gray-200"
//                             />
//                           ) : (
//                             <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center text-white font-bold flex-shrink-0 shadow-lg">
//                               {reply.user?.username?.charAt(0).toUpperCase()}
//                             </div>
//                           )}
//                           <div className="flex-1 min-w-0">
//                             <div className="flex items-center gap-2 mb-1">
//                               <span className="font-bold text-sm text-gray-900">
//                                 {reply.user?.username}
//                               </span>
//                               <span className="text-xs text-gray-500">
//                                 {formatDate(reply.createdAt)}
//                               </span>
//                             </div>
//                             <p className="text-sm text-gray-700">
//                               {reply.text}
//                             </p>
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>
//           ))
//         )}
//       </div>
//     </div>
//   );
// }
























// components/Comments.jsx - UPDATE to show flagged comments

import { useState, useEffect } from "react";
import { API } from "../api/api";
import { useAuth } from "../context/AuthContext";
import { toast } from 'sonner';

export default function Comments({ projectId }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [replyText, setReplyText] = useState({});
  const [showReplyBox, setShowReplyBox] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [projectId]);

  const fetchComments = async () => {
    try {
      const res = await API.get(`/projects/${projectId}/comments`);
      setComments(res.data);
    } catch (err) {
      console.error("Fetch comments error:", err);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("Please login to comment");
      return;
    }

    if (!newComment.trim()) {
      toast.error("Please enter a comment");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await API.post(
        `/projects/${projectId}/comments`,
        { text: newComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setNewComment("");
      fetchComments();
      toast.success("Comment added! 💬");
    } catch (err) {
      console.error("Add comment error:", err);
      toast.error("Failed to add comment");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("⚠️ Delete this comment?")) return;

    try {
      const token = localStorage.getItem("token");
      await API.delete(`/projects/${projectId}/comments/${commentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      fetchComments();
      toast.success("Comment deleted 🗑️");
    } catch (err) {
      console.error("Delete comment error:", err);
      toast.error("Failed to delete comment");
    }
  };

  const handleAddReply = async (commentId) => {
    if (!user) {
      toast.error("Please login to reply");
      return;
    }

    const text = replyText[commentId];
    if (!text?.trim()) {
      toast.error("Please enter a reply");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await API.post(
        `/projects/${projectId}/comments/${commentId}/replies`,
        { text },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setReplyText({ ...replyText, [commentId]: "" });
      setShowReplyBox({ ...showReplyBox, [commentId]: false });
      fetchComments();
      toast.success("Reply added! 💬");
    } catch (err) {
      console.error("Add reply error:", err);
      toast.error("Failed to add reply");
    }
  };

  const formatDate = (date) => {
    const now = new Date();
    const commentDate = new Date(date);
    const diffTime = Math.abs(now - commentDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffTime / (1000 * 60));
        return diffMinutes <= 1 ? "Just now" : `${diffMinutes}m ago`;
      }
      return `${diffHours}h ago`;
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return commentDate.toLocaleDateString();
    }
  };

  return (
    <div className="mt-8 bg-white rounded-3xl shadow-2xl border-2 border-gray-200 p-6 md:p-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center">
          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
          </svg>
        </div>
        <div>
          <h3 className="text-2xl font-black text-gray-900">
            Comments
          </h3>
          <p className="text-sm text-gray-600">
            {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
          </p>
        </div>
      </div>

      {/* Add Comment Form */}
      {user ? (
        <form onSubmit={handleAddComment} className="mb-8">
          <div className="flex gap-4">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.username}
                className="w-12 h-12 rounded-xl object-cover flex-shrink-0 border-2 border-gray-200"
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow-lg">
                {user.username?.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts..."
                rows="3"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all resize-none text-gray-900 placeholder-gray-400"
                disabled={loading}
              />
              <div className="flex justify-end mt-3">
                <button
                  type="submit"
                  disabled={loading || !newComment.trim()}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Posting...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      <span>Post Comment</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-8 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-200 text-center">
          <svg className="w-16 h-16 text-blue-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <p className="text-gray-700 font-semibold mb-3">
            Please login to join the conversation
          </p>
          
           <a href="/login"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl"
          >
            Login to Comment
          </a>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-6">
        {comments.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
            </div>
            <h4 className="text-lg font-bold text-gray-900 mb-2">
              No comments yet
            </h4>
            <p className="text-gray-600">
              Be the first to share your thoughts!
            </p>
          </div>
        ) : (
          comments.map((comment) => (
            <div 
              key={comment._id} 
              className={`border-b-2 pb-6 last:border-b-0 last:pb-0 ${
                comment.isFlagged ? 'border-red-200' : 'border-gray-100'
              }`}
            >
              {/* 🔥 Flagged Warning Banner */}
              {comment.isFlagged && (
                <div className="mb-4 p-4 bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-300 rounded-2xl">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-red-800 mb-1">
                        🚩 This comment has been flagged by moderators
                      </h4>
                      {comment.flagReason && (
                        <p className="text-sm text-red-700">
                          <span className="font-semibold">Reason:</span> {comment.flagReason}
                        </p>
                      )}
                      <p className="text-xs text-red-600 mt-1">
                        This comment may violate community guidelines. Please report if you find it inappropriate.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Comment */}
              <div className="flex gap-4">
                {comment.user?.avatar ? (
                  <img
                    src={comment.user.avatar}
                    alt={comment.user.username}
                    className="w-12 h-12 rounded-xl object-cover flex-shrink-0 border-2 border-gray-200"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow-lg">
                    {comment.user?.username?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-bold text-gray-900">
                      {comment.user?.username}
                    </span>
                    {comment.isFlagged && (
                      <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold border border-red-300">
                        🚩 Flagged
                      </span>
                    )}
                    <span className="text-sm text-gray-500">
                      {formatDate(comment.createdAt)}
                    </span>
                  </div>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap mb-3">
                    {comment.text}
                  </p>
                  
                  {/* Comment Actions */}
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() =>
                        setShowReplyBox({
                          ...showReplyBox,
                          [comment._id]: !showReplyBox[comment._id],
                        })
                      }
                      className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                      </svg>
                      Reply
                    </button>
                    {user && (comment.user?._id === user._id) && (
                      <button
                        onClick={() => handleDeleteComment(comment._id)}
                        className="text-sm font-semibold text-red-600 hover:text-red-700 flex items-center gap-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                      </button>
                    )}
                  </div>

                  {/* Reply Box */}
                  {showReplyBox[comment._id] && user && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-2xl border-2 border-gray-200">
                      <textarea
                        value={replyText[comment._id] || ""}
                        onChange={(e) =>
                          setReplyText({
                            ...replyText,
                            [comment._id]: e.target.value,
                          })
                        }
                        placeholder="Write a reply..."
                        rows="2"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all resize-none text-gray-900 placeholder-gray-400"
                      />
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => handleAddReply(comment._id)}
                          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold text-sm transition-all shadow-lg"
                        >
                          Post Reply
                        </button>
                        <button
                          onClick={() =>
                            setShowReplyBox({
                              ...showReplyBox,
                              [comment._id]: false,
                            })
                          }
                          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-semibold text-sm transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Replies */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="mt-4 ml-8 space-y-4">
                      {comment.replies.map((reply, idx) => (
                        <div key={idx} className="flex gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-200">
                          {reply.user?.avatar ? (
                            <img
                              src={reply.user.avatar}
                              alt={reply.user.username}
                              className="w-10 h-10 rounded-xl object-cover flex-shrink-0 border-2 border-gray-200"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center text-white font-bold flex-shrink-0 shadow-lg">
                              {reply.user?.username?.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-bold text-sm text-gray-900">
                                {reply.user?.username}
                              </span>
                              <span className="text-xs text-gray-500">
                                {formatDate(reply.createdAt)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700">
                              {reply.text}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}