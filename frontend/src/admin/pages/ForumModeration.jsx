import { useState, useEffect } from "react";
import { API } from "../../api/api";
import { toast } from "sonner";
import { Link } from "react-router-dom";

export default function ForumModeration() {
  const [activeTab, setActiveTab] = useState("questions");
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalQuestions: 0,
    totalAnswers: 0,
    solvedQuestions: 0,
    unsolvedQuestions: 0,
    flaggedContent: 0,
    flaggedAnswers: 0
  });
  
  const [questionFilter, setQuestionFilter] = useState("all");
  const [answerFilter, setAnswerFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchStats();
    if (activeTab === "questions") {
      fetchQuestions();
    } else if (activeTab === "answers") {
      fetchAnswers();
    }
  }, [activeTab, questionFilter, answerFilter, currentPage]);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await API.get("/admin/forum/stats", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(res.data);
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await API.get("/admin/forum/questions", {
        params: { filter: questionFilter, page: currentPage, limit: 10 },
        headers: { Authorization: `Bearer ${token}` }
      });
      setQuestions(res.data.questions);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error("Error fetching questions:", err);
      toast.error("Failed to load questions");
    } finally {
      setLoading(false);
    }
  };

  const fetchAnswers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await API.get("/admin/forum/answers", {
        params: { filter: answerFilter, page: currentPage, limit: 10 },
        headers: { Authorization: `Bearer ${token}` }
      });
      setAnswers(res.data.answers);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error("Error fetching answers:", err);
      toast.error("Failed to load answers");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuestion = async (questionId, title) => {
    if (!window.confirm(`Delete question "${title}"?\n\nThis will delete all answers and cannot be undone.`)) return;

    try {
      const token = localStorage.getItem("token");
      await API.delete(`/admin/forum/questions/${questionId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Question deleted!");
      fetchQuestions();
      fetchStats();
    } catch (err) {
      console.error("Error deleting question:", err);
      toast.error("Failed to delete question");
    }
  };

  const handleDeleteAnswer = async (answerId) => {
    if (!window.confirm("Delete this answer?\n\nThis action cannot be undone.")) return;

    try {
      const token = localStorage.getItem("token");
      await API.delete(`/admin/forum/answers/${answerId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Answer deleted!");
      fetchAnswers();
      fetchStats();
    } catch (err) {
      console.error("Error deleting answer:", err);
      toast.error("Failed to delete answer");
    }
  };

  const handleFlagAnswer = async (answerId) => {
    const reason = prompt("Enter flag reason (optional):");
    
    try {
      const token = localStorage.getItem("token");
      await API.put(
        `/admin/forum/answers/${answerId}/flag`,
        { reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Answer flagged!");
      fetchAnswers();
      fetchStats();
    } catch (err) {
      console.error("Error flagging answer:", err);
      toast.error("Failed to flag answer");
    }
  };

  const handleUnflagAnswer = async (answerId) => {
    try {
      const token = localStorage.getItem("token");
      await API.put(
        `/admin/forum/answers/${answerId}/unflag`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Answer unflagged!");
      fetchAnswers();
      fetchStats();
    } catch (err) {
      console.error("Error unflagging answer:", err);
      toast.error("Failed to unflag answer");
    }
  };

  const handleFlagQuestion = async (questionId) => {
    const reason = prompt("Enter flag reason (optional):");
    
    try {
      const token = localStorage.getItem("token");
      await API.put(
        `/admin/forum/questions/${questionId}/flag`,
        { reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Question flagged!");
      fetchQuestions();
      fetchStats();
    } catch (err) {
      console.error("Error flagging question:", err);
      toast.error("Failed to flag question");
    }
  };

  const handleUnflagQuestion = async (questionId) => {
    try {
      const token = localStorage.getItem("token");
      await API.put(
        `/admin/forum/questions/${questionId}/unflag`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Question unflagged!");
      fetchQuestions();
      fetchStats();
    } catch (err) {
      console.error("Error unflagging question:", err);
      toast.error("Failed to unflag question");
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="!text-3xl md:text-3xl font-bold text-stone-800 dark:text-stone-100 mb-0">
            Forum Moderation
          </h1>
          <p className="text-stone-700 dark:text-stone-400 font-medium">
            Manage questions, answers, and forum content
          </p>
        </div>
        <Link
          to="/forum"
          className="text-sm text-blue-600 dark:hover:!text-stone-100 hover:bg-blue-200 dark:hover:bg-blue-500/30 py-1.5 px-2.5 rounded-sm"
        >
          View Forum →
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
        <div className="bg-white dark:bg-gray-900 rounded-sm shadow p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-stone-600 dark:text-stone-400">Total Questions</p>
              <p className="text-2xl md:text-3xl font-bold text-stone-800 dark:text-stone-100 mt-1">
                {loading ? "..." : stats.totalQuestions}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-sm flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-sm shadow p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-stone-600 dark:text-stone-400">Solved</p>
              <p className="text-2xl md:text-3xl font-bold text-stone-800 dark:text-stone-100 mt-1">
                {loading ? "..." : stats.solvedQuestions}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-sm flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-sm shadow p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-stone-600 dark:text-stone-400">Unsolved</p>
              <p className="text-2xl md:text-3xl font-bold text-stone-800 dark:text-stone-100 mt-1">
                {loading ? "..." : stats.unsolvedQuestions}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-sm flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-sm shadow p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-stone-600 dark:text-stone-400">Total Answers</p>
              <p className="text-2xl md:text-3xl font-bold text-stone-800 dark:text-stone-100 mt-1">
                {loading ? "..." : stats.totalAnswers}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-sm flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-sm shadow p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-stone-600 dark:text-stone-400">Flagged Items</p>
              <p className="text-2xl md:text-3xl font-bold text-stone-800 dark:text-stone-100 mt-1">
                {loading ? "..." : stats.flaggedContent}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-sm flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-900 rounded-sm shadow">
        <div className="flex bg-gray-200 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => {
              setActiveTab("questions");
              setCurrentPage(1);
            }}
            className={`flex-1 px-6 py-4 font-semibold text-sm transition-colors ${
              activeTab === "questions"
                ? "text-blue-600 bg-white dark:bg-gray-900 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                : "text-stone-600 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200"
            }`}
          >
            Questions ({stats.totalQuestions})
          </button>
          <button
            onClick={() => {
              setActiveTab("answers");
              setCurrentPage(1);
            }}
            className={`flex-1 px-6 py-4 font-semibold text-sm transition-colors ${
              activeTab === "answers"
                ? "text-blue-600 bg-white dark:bg-gray-900 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                : "text-stone-600 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200"
            }`}
          >
            Answers ({stats.totalAnswers})
          </button>
        </div>

        {/* Questions Tab */}
        {activeTab === "questions" && (
          <div className="p-6">
            {/* Filter */}
            <div className="flex items-center gap-3 mb-6">
              <label className="text-sm font-medium text-stone-700 dark:text-stone-300">Filter:</label>
              <select
                value={questionFilter}
                onChange={(e) => {
                  setQuestionFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-sm text-sm text-stone-800 dark:text-stone-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Questions</option>
                <option value="solved">Solved</option>
                <option value="unsolved">Unsolved</option>
                <option value="flagged">Flagged</option>
              </select>
            </div>

            {/* Questions List */}
            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="bg-gray-100 dark:bg-gray-800 rounded-sm p-4 animate-pulse">
                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
                    <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-full mb-2"></div>
                    <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-5/6"></div>
                  </div>
                ))}
              </div>
            ) : questions.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-4">📭</div>
                <h3 className="text-lg font-bold text-stone-800 dark:text-stone-100 mb-2">No Questions Found</h3>
                <p className="text-stone-600 dark:text-stone-400">No questions match the selected filter</p>
              </div>
            ) : (
              <div className="space-y-4">
                {questions.map((question) => (
                  <div
                    key={question._id}
                    className={`rounded-sm p-4 border transition-colors ${
                      question.isFlagged
                        ? "bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700"
                        : "bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800/30"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <Link
                            to={`/forum/questions/${question._id}`}
                            target="_blank"
                            className="text-base font-semibold text-stone-800 dark:!text-stone-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                          >
                            {question.title}
                          </Link>
                          {question.isSolved && (
                            <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium rounded">
                              ✅ Solved
                            </span>
                          )}
                          {question.isPoll && (
                            <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs font-medium rounded">
                              📊 Poll
                            </span>
                          )}
                          {question.isFlagged && (
                            <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-medium rounded">
                              🚩 Flagged
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-stone-600 dark:text-stone-400 font-medium mb-3 line-clamp-2">{question.content}</p>
                        
                        {/* Categories & Tags */}
                        <div className="flex flex-wrap gap-2 mb-3">
                          {question.categories?.slice(0, 3).map((cat, idx) => (
                            <span key={idx} className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-medium rounded">
                              {cat}
                            </span>
                          ))}
                          {question.tags?.slice(0, 3).map((tag, idx) => (
                            <span key={idx} className="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium rounded">
                              #{tag}
                            </span>
                          ))}
                        </div>

                        {/* Author & Stats */}
                        <div className="flex items-center gap-4 text-xs text-stone-500 dark:text-stone-400">
                          <span className="font-medium">
                            👤 {question.author?.username || "Unknown"}
                          </span>
                          <span>👍 {question.upvotes?.length || 0}</span>
                          <span>👎 {question.downvotes?.length || 0}</span>
                          <span>💬 {question.answersCount || 0}</span>
                          <span>👁️ {question.views || 0}</span>
                          <span>{formatDate(question.createdAt)}</span>
                        </div>

                        {question.isFlagged && question.flagReason && (
                          <div className="mt-3 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-sm">
                            <p className="text-sm font-medium text-red-700 dark:text-red-400">
                              <span className="font-semibold">Flag Reason:</span> {question.flagReason}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <Link
                        to={`/forum/questions/${question._id}`}
                        target="_blank"
                        className="!px-3 !py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:!text-stone-100 hover:bg-blue-200 dark:hover:bg-blue-900/50 rounded-sm !text-sm font-medium transition-colors flex items-center gap-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        View
                      </Link>
                      
                      {question.isFlagged ? (
                        <button
                          onClick={() => handleUnflagQuestion(question._id)}
                          className="!px-3 !py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50 rounded-sm !text-sm font-medium transition-colors flex items-center gap-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Unflag
                        </button>
                      ) : (
                        <button
                          onClick={() => handleFlagQuestion(question._id)}
                          className="!px-3 !py-1.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:!text-stone-100 hover:bg-yellow-200 dark:hover:bg-yellow-900/50 !rounded-sm !text-sm font-medium transition-colors flex items-center gap-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                          </svg>
                          Flag
                        </button>
                      )}

                      <button
                        onClick={() => handleDeleteQuestion(question._id, question.title)}
                        className="!px-3 !py-1.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:!text-stone-100 hover:bg-red-200 dark:hover:bg-red-900/50 !rounded-sm !text-sm font-medium transition-colors flex items-center gap-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-sm text-sm font-medium text-stone-700 dark:text-stone-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  ← Previous
                </button>
                <span className="px-4 py-2 text-sm font-medium text-stone-700 dark:text-stone-300">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-sm text-sm font-medium text-stone-700 dark:text-stone-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        )}

        {/* Answers Tab */}
        {activeTab === "answers" && (
          <div className="p-6">
            {/* Filter */}
            <div className="flex items-center gap-3 mb-6">
              <label className="text-sm font-medium text-stone-700 dark:text-stone-300">Filter:</label>
              <select
                value={answerFilter}
                onChange={(e) => {
                  setAnswerFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-sm text-sm text-stone-800 dark:text-stone-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Answers</option>
                <option value="best">Best Answers</option>
                <option value="recent">Recent Answers</option>
                <option value="flagged">Flagged Answers</option>
              </select>
            </div>

            {/* Answers List */}
            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="bg-gray-100 dark:bg-gray-800 rounded-sm p-4 animate-pulse">
                    <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-full mb-2"></div>
                    <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-5/6"></div>
                  </div>
                ))}
              </div>
            ) : answers.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-4">💬</div>
                <h3 className="text-lg font-bold text-stone-800 dark:text-stone-100 mb-2">No Answers Found</h3>
                <p className="text-stone-600 dark:text-stone-400">No answers match the selected filter</p>
              </div>
            ) : (
              <div className="space-y-4">
                {answers.map((answer) => (
                  <div
                    key={answer._id}
                    className={`rounded-sm p-4 border transition-colors ${
                      answer.isFlagged
                        ? "bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700"
                        : "bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800/30"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          {answer.isBestAnswer && (
                            <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium rounded">
                              ⭐ Best Answer
                            </span>
                          )}
                          {answer.isFlagged && (
                            <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-medium rounded">
                              🚩 Flagged
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-stone-800 dark:text-stone-100 mb-3 line-clamp-3">{answer.content}</p>
                        
                        {/* Question Link */}
                        {answer.question && (
                          <Link
                            to={`/forum/questions/${answer.question._id}`}
                            target="_blank"
                            className="text-sm font-medium text-blue-600 dark:!text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-2 inline-block"
                          >
                            Question: {answer.question.title}
                          </Link>
                        )}

                        {/* Author & Stats */}
                        <div className="flex items-center gap-4 text-xs text-stone-500 dark:text-stone-400 mt-2">
                          <span className="font-medium">
                            👤 {answer.author?.username || "Unknown"}
                          </span>
                          <span>👍 {answer.upvotes?.length || 0}</span>
                          <span>👎 {answer.downvotes?.length || 0}</span>
                          <span>💬 {answer.replies?.length || 0}</span>
                          <span>{formatDate(answer.createdAt)}</span>
                        </div>

                        {answer.isFlagged && answer.flagReason && (
                          <div className="mt-3 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-sm">
                            <p className="text-sm font-medium text-red-700 dark:text-red-400">
                              <span className="font-semibold">Flag Reason:</span> {answer.flagReason}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <Link
                        to={`/forum/questions/${answer.question?._id}`}
                        target="_blank"
                        className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:!text-stone-100 hover:bg-purple-200 dark:hover:bg-blue-900/50 rounded-sm !text-sm font-medium transition-colors flex items-center gap-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        View Question
                      </Link>

                      {answer.isFlagged ? (
                        <button
                          onClick={() => handleUnflagAnswer(answer._id)}
                          className="!px-3 !py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-stone-100 hover:bg-green-200 dark:hover:bg-green-900/50 !rounded-sm !text-sm font-medium transition-colors flex items-center gap-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Unflag
                        </button>
                      ) : (
                        <button
                          onClick={() => handleFlagAnswer(answer._id)}
                          className="!px-3 !py-1.5 bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-stone-100 hover:bg-yellow-200 dark:hover:bg-yellow-800/50 !rounded-sm !text-sm font-medium transition-colors flex items-center gap-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                          </svg>
                          Flag
                        </button>
                      )}

                      <button
                        onClick={() => handleDeleteAnswer(answer._id)}
                        className="!px-3 !py-1.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-stone-100 hover:bg-red-200 dark:hover:bg-red-900/50 !rounded-sm !text-sm font-medium transition-colors flex items-center gap-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-sm text-sm font-medium text-stone-700 dark:text-stone-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  ← Previous
                </button>
                <span className="px-4 py-2 text-sm font-medium text-stone-700 dark:text-stone-300">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-sm text-sm font-medium text-stone-700 dark:text-stone-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}