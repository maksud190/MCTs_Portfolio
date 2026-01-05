// pages/MyQuestions.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { API } from "../api/api";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";

export default function MyQuestions() {
  const { user } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });

  useEffect(() => {
    fetchMyQuestions();
  }, [page, filter]);

  const fetchMyQuestions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await API.get("/forum/my-questions", {
        params: { page, limit: 10 },
        headers: { Authorization: `Bearer ${token}` }
      });
      
      let filteredQuestions = res.data.questions;
      
      // Apply filter
      if (filter === "solved") {
        filteredQuestions = filteredQuestions.filter(q => q.isSolved);
      } else if (filter === "unsolved") {
        filteredQuestions = filteredQuestions.filter(q => !q.isSolved);
      } else if (filter === "polls") {
        filteredQuestions = filteredQuestions.filter(q => q.isPoll);
      }
      
      setQuestions(filteredQuestions);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error("Error fetching my questions:", err);
      toast.error("Failed to load questions");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuestion = async (questionId, title) => {
    if (!window.confirm(`⚠️ Delete "${title}"?\n\nThis will also delete all answers and replies. This action cannot be undone.`)) return;

    try {
      const token = localStorage.getItem("token");
      await API.delete(`/forum/questions/${questionId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setQuestions(questions.filter(q => q._id !== questionId));
      toast.success("Question deleted! 🗑️");
    } catch (err) {
      console.error("Error deleting question:", err);
      toast.error("Failed to delete question");
    }
  };

  const getVoteScore = (question) => {
    return (question.upvotes?.length || 0) - (question.downvotes?.length || 0);
  };

  const getStatusBadge = (question) => {
    if (question.isSolved) {
      return (
        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold border border-green-200">
          ✅ Solved
        </span>
      );
    } else if (question.answersCount === 0) {
      return (
        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-bold border border-gray-200">
          ❓ No Answers
        </span>
      );
    } else {
      return (
        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-bold border border-yellow-200">
          ⏳ Unsolved
        </span>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 mb-30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg border border-gray-200 mb-4">
            <span className="text-2xl">📝</span>
            <span className="text-sm font-semibold text-gray-700">My Questions</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-3">
            Your Questions
          </h1>
          <p className="text-lg text-gray-600">
            Manage all the questions you've asked
          </p>
        </div>

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            {[
              { value: "all", label: "All Questions", icon: "📋" },
              { value: "solved", label: "Solved", icon: "✅" },
              { value: "unsolved", label: "Unsolved", icon: "❓" },
              { value: "polls", label: "Polls", icon: "📊" }
            ].map((f) => (
              <button
                key={f.value}
                onClick={() => {
                  setFilter(f.value);
                  setPage(1);
                }}
                className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 ${
                  filter === f.value
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
                    : "bg-white text-gray-700 hover:bg-gray-100 border-2 border-gray-200"
                }`}
              >
                <span>{f.icon}</span>
                {f.label}
              </button>
            ))}
          </div>

          {/* Stats & Actions */}
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 bg-white rounded-xl shadow-lg border-2 border-gray-200">
              <span className="text-sm font-bold text-gray-900">
                {pagination.total} Questions
              </span>
            </div>
            <Link
              to="/forum/ask"
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 !text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Ask Question
            </Link>
          </div>
        </div>

        {/* Questions List */}
        <div className="space-y-4">
          {loading ? (
            [...Array(5)].map((_, i) => (
              <div key={i} className="bg-white rounded-3xl shadow-xl p-6 animate-pulse border border-gray-200">
                <div className="flex gap-4">
                  <div className="w-16 space-y-2">
                    <div className="h-8 bg-gray-300 rounded"></div>
                    <div className="h-4 bg-gray-300 rounded"></div>
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-300 rounded w-full"></div>
                    <div className="h-3 bg-gray-300 rounded w-5/6"></div>
                  </div>
                </div>
              </div>
            ))
          ) : questions.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-300">
              <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center">
                <span className="text-6xl">📝</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                {filter === "all" 
                  ? "No Questions Yet"
                  : filter === "solved"
                  ? "No Solved Questions"
                  : filter === "unsolved"
                  ? "No Unsolved Questions"
                  : "No Polls"}
              </h3>
              <p className="text-gray-600 mb-6">
                {filter === "all"
                  ? "Ask your first question and get help from the community!"
                  : "Try changing the filter or ask a new question"}
              </p>
              {filter === "all" && (
                <Link
                  to="/forum/ask"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold transition-all shadow-xl hover:shadow-2xl"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Ask Question
                </Link>
              )}
            </div>
          ) : (
            questions.map((question) => {
              const voteScore = getVoteScore(question);
              
              return (
                <div
                  key={question._id}
                  className="bg-white rounded-3xl shadow-xl border-2 border-gray-200 p-6 transition-all hover:shadow-2xl"
                >
                  <div className="flex gap-4">
                    {/* Stats */}
                    <div className="flex-shrink-0 text-center space-y-3">
                      <div className={`px-3 py-2 rounded-xl font-bold ${
                        voteScore > 0 
                          ? "bg-green-100 text-green-700" 
                          : voteScore < 0 
                          ? "bg-red-100 text-red-700"
                          : "bg-gray-100 text-gray-700"
                      }`}>
                        {voteScore > 0 ? "+" : ""}{voteScore}
                      </div>
                      <div className="text-xs text-gray-500 font-semibold">votes</div>
                      
                      <div className={`px-3 py-2 rounded-xl font-bold ${
                        question.answersCount > 0
                          ? question.isSolved
                            ? "bg-green-100 text-green-700"
                            : "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-700"
                      }`}>
                        {question.answersCount}
                      </div>
                      <div className="text-xs text-gray-500 font-semibold">answers</div>

                      <div className="px-3 py-2 bg-gray-100 text-gray-700 rounded-xl font-bold">
                        {question.views}
                      </div>
                      <div className="text-xs text-gray-500 font-semibold">views</div>
                    </div>

                    {/* Question Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <Link
                          to={`/forum/questions/${question._id}`}
                          className="flex-1"
                        >
                          <h3 className="text-xl font-black text-gray-900 mb-2 hover:text-blue-600 transition-colors">
                            {question.title}
                          </h3>
                        </Link>
                        <div className="flex gap-2 ml-4">
                          {getStatusBadge(question)}
                          {question.isPoll && (
                            <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-bold border border-purple-200">
                              📊 Poll
                            </span>
                          )}
                        </div>
                      </div>

                      <p className="text-gray-700 mb-3 line-clamp-2">
                        {question.content}
                      </p>

                      {/* Categories & Tags */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {question.categories?.slice(0, 3).map((cat, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold border border-blue-200"
                          >
                            {cat}
                          </span>
                        ))}
                        {question.tags?.slice(0, 2).map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold border border-gray-200"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>

                      {/* Actions & Meta */}
                      <div className="flex items-center justify-between pt-3 border-t-2 border-gray-100">
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/forum/questions/${question._id}`}
                            className="px-4 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-xl text-sm font-semibold transition-all flex items-center gap-1"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            View
                          </Link>
                          <button
                            onClick={() => handleDeleteQuestion(question._id, question.title)}
                            className="px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-xl text-sm font-semibold transition-all flex items-center gap-1"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete
                          </button>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span className="font-semibold">
                            {new Date(question.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="mt-8 flex justify-center gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-white border-2 border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              ← Previous
            </button>
            
            <div className="flex gap-2">
              {[...Array(pagination.pages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                    page === i + 1
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
                      : "bg-white text-gray-700 hover:bg-gray-100 border-2 border-gray-200"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <button
              onClick={() => setPage(Math.min(pagination.pages, page + 1))}
              disabled={page === pagination.pages}
              className="px-4 py-2 bg-white border-2 border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Next →
            </button>
          </div>
        )}

        {/* Back to Forum */}
        <div className="mt-8 text-center">
          <Link
            to="/forum"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 rounded-xl font-semibold transition-all shadow-lg border-2 border-gray-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Forum
          </Link>
        </div>
      </div>
    </div>
  );
}