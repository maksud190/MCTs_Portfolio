// pages/Forum.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { API } from "../api/api";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";

export default function Forum() {
  const { user } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("recent");
  const [category, setCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });

  const categories = [
    "all",
    "Programming",
    "Design",
    "Animation",
    "Video Editing",
    "3D Modeling",
    "Game Development",
    "Web Development",
    "Mobile App",
    "UI/UX",
    "Other",
  ];

  const filters = [
    { value: "recent"},
    { value: "popular"},
    { value: "most_answered"},
    { value: "unsolved"},
    { value: "solved"},
  ];

  useEffect(() => {
    fetchQuestions();
  }, [filter, category, page]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const res = await API.get("/forum/questions", {
        params: {
          filter,
          category: category !== "all" ? category : undefined,
          search: searchQuery || undefined,
          page,
          limit: 10,
        },
      });
      setQuestions(res.data.questions);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error("Error fetching questions:", err);
      toast.error("Failed to load questions");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchQuestions();
  };

  const getVoteScore = (question) => {
    return (question.upvotes?.length || 0) - (question.downvotes?.length || 0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 mb-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1 px-4 py-2 text-blue-600 bg-white/80 backdrop-blur-sm rounded-full shadow-lg border border-gray-200 mb-4">
            {/* <span className="text-2xl">💬</span> */}
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <span className="text-sm font-semibold text-gray-700">
              Community Forum
            </span>
          </div>

          <h1 className="!text-3xl md:text-xl font-black text-gray-900">
            Ask. Answer. Learn.
          </h1>
          <p className="text-sm text-gray-600 mb-6">
            Get help from the community and share your knowledge
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 justify-center">
            <a
              href="/forum/ask"
              className="px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 !text-stone-100 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl flex items-center gap-1"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Ask Question
            </a>
            <a
              href="/forum/my-questions"
              className="px-4 py-3 bg-white hover:bg-gray-50 text-gray-700 rounded-xl font-semibold transition-all shadow-lg border-2 border-gray-200 flex items-center gap-1"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              My Questions
            </a>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search questions, tags, or keywords..."
                className="w-full px-6 py-4 pr-32 border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all shadow-lg"
              />
              <button
                type="submit"
                className="absolute right-2 top-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold transition-all"
              >
                <div className="flex items-center gap-1">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <span>Search</span>
                </div>
              </button>
            </div>
          </form>
        </div>

        {/* Categories */}
        <div className="mb-6 overflow-x-auto">
          <div className="flex gap-2 pb-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setCategory(cat);
                  setPage(1);
                }}
                className={`!px-3 !py-1 rounded-xl font-semibold text-sm whitespace-nowrap transition-all ${
                  category === cat
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
                    : "bg-white text-gray-700 hover:bg-gray-100 border-2 border-gray-200"
                }`}
              >
                {cat === "all" ? "All Categories" : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-2 overflow-x-auto">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => {
                setFilter(f.value);
                setPage(1);
              }}
              className={`!px-3 py-2 rounded-xl font-semibold !text-sm transition-all flex justify-center items-center gap-2 ${
                filter === f.value
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
                  : "bg-white text-gray-700 hover:bg-gray-100 border-2 border-gray-200"
              }`}
            >
              {f.label || f.value.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
            </button>
          ))}
        </div>

        {/* Questions List */}
        <div className="space-y-4">
          {loading ? (
            [...Array(5)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-3xl shadow-xl p-6 animate-pulse border border-gray-200"
              >
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
                <span className="text-6xl">🤔</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                No Questions Found
              </h3>
              <p className="text-gray-600 mb-6">
                {searchQuery
                  ? "No questions match your search. Try different keywords."
                  : "Be the first to ask a question!"}
              </p>
              <a
                href="/forum/ask"
                className="inline-flex items-center gap-2 px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 !text-stone-100 rounded-xl font-bold transition-all shadow-xl hover:shadow-2xl"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Ask Question
              </a>
            </div>
          ) : (
            questions.map((question) => {
              const voteScore = getVoteScore(question);

              return (
                <a
                  key={question._id}
                  href={`/forum/questions/${question._id}`}
                  className="block bg-white rounded-3xl shadow-xl border-2 border-gray-200 p-6 transition-all hover:shadow-2xl hover:border-blue-300"
                >
                  <div className="flex gap-6">
                    {/* Vote Score & Stats */}
                    <div className="flex-shrink-0 text-center space-y-2">
                      <div
                        className={`px-2 py-1 rounded-xl font-bold ${
                          voteScore > 0
                            ? "bg-green-100 text-green-700"
                            : voteScore < 0
                            ? "bg-red-100 text-red-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {voteScore > 0 ? "+" : ""}
                        {voteScore}
                      </div>
                      <div className="text-xs text-gray-500 font-semibold">
                        votes
                      </div>

                      <div
                        className={`px-2 py-1 rounded-xl font-bold ${
                          question.answersCount > 0
                            ? question.isSolved
                              ? "bg-green-100 text-green-700"
                              : "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {question.answersCount}
                      </div>
                      <div className="text-xs text-gray-500 font-semibold">
                        answers
                      </div>
                    </div>

                    {/* Question Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-0">
                        <h3 className="!text-md  font-bold text-gray-900 mb-0 hover:text-blue-600 transition-colors">
                          {question.title}
                        </h3>
                        {question.isSolved && (
                          <span className="pl-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-bold border border-green-200">
                            ✅ Solved
                          </span>
                        )}
                        {question.isPoll && (
                          <span className="!pl-2 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-bold border border-purple-200">
                            📊 Poll
                          </span>
                        )}
                      </div>

                      <p className="text-gray-700 font-semibold !text-sm mb-3 line-clamp-2">
                        {question.content}
                      </p>

                      {/* Categories & Tags */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {question.categories?.map((cat, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold border border-blue-200"
                          >
                            {cat}
                          </span>
                        ))}
                        {question.tags?.slice(0, 3).map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold border border-gray-200"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>

                      {/* Author & Meta */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {question.author?.avatar ? (
                            <img
                              src={question.author.avatar}
                              alt={question.author.username}
                              className="w-8 h-8 rounded-xl object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                              {question.author?.username
                                ?.charAt(0)
                                .toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-bold text-gray-900">
                              {question.author?.username}
                            </p>
                            <p className="text-xs text-gray-500">
                              {question.author?.designation ||
                                question.author?.role}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                            {question.views}
                          </span>
                          <span>
                            {new Date(question.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </a>
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
      </div>
    </div>
  );
}
