import { useState, useEffect } from 'react';
import { API } from '../../api/api';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

export default function CommentsModeration() {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchComments();
  }, [currentPage, filter]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await API.get('/admin/comments', {
        params: {
          page: currentPage,
          limit: 20,
          isFlagged: filter
        },
        headers: { Authorization: `Bearer ${token}` }
      });

      setComments(res.data.comments);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error('Error fetching comments:', err);
      toast.error('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('⚠️ Delete this comment?\n\nThis action cannot be undone.')) return;

    try {
      const token = localStorage.getItem('token');
      await API.delete(`/admin/comments/${commentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Comment deleted successfully');
      fetchComments();
    } catch (err) {
      console.error('Error deleting comment:', err);
      toast.error('Failed to delete comment');
    }
  };

  const handleFlagComment = async (commentId, currentStatus) => {
    const reason = currentStatus ? '' : prompt('Enter flag reason (optional):');
    if (currentStatus === false && reason === null) return; // User cancelled

    try {
      const token = localStorage.getItem('token');
      await API.put(`/admin/comments/${commentId}/flag`,
        { 
          isFlagged: !currentStatus,
          flagReason: reason || 'Flagged by admin'
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(currentStatus ? 'Comment unflagged ✅' : 'Comment flagged 🚩');
      fetchComments();
    } catch (err) {
      console.error('Error flagging comment:', err);
      toast.error('Failed to update comment');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="!text-3xl md:text-3xl font-bold text-stone-800 dark:text-stone-100 mb-0">
            Comments Moderation
          </h1>
          <p className="text-stone-700 dark:text-stone-400 font-medium">
            Manage and moderate user comments
          </p>
        </div>
      </div>

      {/* Filters */}
      
        <div className="flex flex-col sm:flex-row gap-4">
          <select
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 border-2 border-stone-200 dark:border-stone-800 !rounded-sm bg-white dark:bg-stone-900 text-gray-900 dark:text-stone-100 font-semibold focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
          >
            <option value="">📋 All Comments</option>
            <option value="true">🚩 Flagged Only</option>
            <option value="false">✅ Not Flagged</option>
          </select>
        </div>
      

      {/* Comments List */}
      <div className="space-y-4">
        {loading ? (
          // Loading skeleton
          [...Array(5)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 animate-pulse border-2 border-gray-200">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gray-300 dark:bg-gray-700 rounded-xl"></div>
                <div className="flex-1 space-y-3">
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/4"></div>
                  <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))
        ) : comments.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-12 text-center border-2 border-dashed border-gray-300">
            <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              No comments found
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {filter ? "Try changing the filter" : "No comments have been posted yet"}
            </p>
          </div>
        ) : (
          comments.map((comment) => (
            <div
              key={comment._id}
              className={`bg-white dark:bg-gray-800 !rounded-sm shadow-xl p-6 transition-all border-2 ${
                comment.isFlagged ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className="flex items-start gap-4">
                {/* User Avatar */}
                <div className="flex-shrink-0">
                  {comment.user?.avatar ? (
                    <img
                      src={comment.user.avatar}
                      alt={comment.user.username}
                      className="w-12 h-12 rounded-xl object-cover border-2 border-gray-200"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                      {comment.user?.username?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Comment Content */}
                <div className="flex-1 min-w-0">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white">
                        {comment.user?.username}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(comment.createdAt).toLocaleString()}
                      </p>
                    </div>
                    
                    {comment.isFlagged && (
                      <span className="px-3 py-1 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 rounded-full text-xs font-bold border border-red-200">
                        🚩 Flagged
                      </span>
                    )}
                  </div>

                  {/* Comment Text */}
                  <p className="text-gray-700 dark:text-gray-300 mb-3 leading-relaxed">
                    {comment.text}
                  </p>

                  {/* Project Link */}
                  {comment.project && (
                    <a
                      href={`/project/${comment.project._id}`}
                      target="_blank"
                      className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 mb-3 font-semibold"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      View Project: {comment.project.title}
                    </a>
                  )}

                  {/* Flag Reason */}
                  {comment.isFlagged && comment.flagReason && (
                    <div className="bg-red-100 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-800 rounded-sm p-2 mb-3">
                      <p className="text-sm text-red-800 dark:text-red-400 font-semibold">
                        <span className="font-bold">Flag Reason:</span> {comment.flagReason}
                      </p>
                    </div>
                  )}

                  {/* Replies Count */}
                  {comment.replies?.length > 0 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 font-semibold">
                      💬 {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
                    </p>
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => handleFlagComment(comment._id, comment.isFlagged)}
                      className={`!px-4 !py-2 !rounded-sm text-sm font-bold transition-all shadow-lg hover:shadow-xl ${
                        comment.isFlagged
                          ? 'bg-green-200 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 border-2 border-green-300'
                          : 'bg-yellow-200 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 border-2 border-yellow-300'
                      }`}
                    >
                      {comment.isFlagged ? '✓ Unflag Comment' : '🚩 Flag Comment'}
                    </button>
                    
                    <button
                      onClick={() => handleDeleteComment(comment._id)}
                      className="!px-4 !py-2 bg-red-200 text-red-800 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 !rounded-sm text-sm font-bold transition-all shadow-lg hover:shadow-xl border-2 border-red-300"
                    >
                      🗑️ Delete Comment
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border-2 border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-5 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            ← Previous
          </button>
          <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="px-5 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}