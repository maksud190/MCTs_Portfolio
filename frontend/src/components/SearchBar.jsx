import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API } from "../api/api";

export default function SearchBar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        handleSearch();
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearch = async () => {
    setIsSearching(true);
    try {
      const res = await API.get(`/projects/search/projects?q=${searchQuery}`);
      setSearchResults(res.data);
      setShowResults(true);
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleResultClick = (projectId) => {
    setShowResults(false);
    setSearchQuery("");
    navigate(`/project/${projectId}`);
  };

  const highlightText = (text, query) => {
    if (!text || !query) return text;

    const parts = text.split(new RegExp(`(${query})`, "gi"));
    return (
      <span>
        {parts.map((part, i) =>
          part.toLowerCase() === query.toLowerCase() ? (
            <mark
              key={i}
              className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-1 rounded font-medium"
            >
              {part}
            </mark>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </span>
    );
  };

  const getMatchType = (project) => {
    const query = searchQuery.toLowerCase();
    const title = project.title?.toLowerCase() || "";
    const username = project.userId?.username?.toLowerCase() || "";
    const email = project.userId?.email?.toLowerCase() || "";
    const category = project.category?.toLowerCase() || "";

    if (title.includes(query)) return "Title";
    if (username.includes(query)) return "Username";
    if (email.includes(query)) return "Email";
    if (category.includes(query)) return "Category";
    return "";
  };

  return (
    <div className="relative w-full max-w-2xl">
      {/* Search Input - Modern Glass Effect */}
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl opacity-0 group-hover:opacity-100 blur transition duration-300"></div>
        <div className="relative">
          <input
            type="text"
            placeholder="Search projects, creators, or explore..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 pl-10 pr-12 bg-white/90 backdrop-blur-xl border border-gray-200 rounded-2xl text-gray-800 placeholder:text-sm placeholder:font-semibold placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-300 shadow-lg hover:shadow-xl text-sm md:text-base"
          />
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors duration-300"
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
          {isSearching && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <div className="relative">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-200"></div>
                <div className="absolute top-0 left-0 animate-spin rounded-full h-5 w-5 border-2 border-t-blue-500 border-r-purple-500"></div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Search Results Dropdown - Modern Card Design */}
      {showResults && searchResults.length > 0 && (
        <div className="absolute z-50 w-sm mt-3">
          <div className="bg-white/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-gray-100 h-auto overflow-hidden">
            <div className="p-3 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
              <p className="text-xs font-medium text-gray-600">
                Found {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="overflow-y-auto max-h-[calc(70vh-3rem)] custom-scrollbar">
              {searchResults.map((project, index) => {
                const matchType = getMatchType(project);

                return (
                  <div
                    key={project._id}
                    onClick={() => handleResultClick(project._id)}
                    className="group relative flex items-center gap-4 px-4 py-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 cursor-pointer transition-all duration-300 border-b border-gray-50 last:border-b-0"
                    style={{
                      animationDelay: `${index * 50}ms`,
                      animation: 'slideIn 0.3s ease-out forwards',
                      opacity: 0
                    }}
                  >
                    {/* Thumbnail with Modern Overlay */}
                    <div className="relative flex-shrink-0">
                      <img
                        src={project.thumbnail}
                        alt={project.title}
                        className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-xl shadow-md group-hover:shadow-xl transition-shadow duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Project Title */}
                      <h4 className="font-semibold text-gray-900 line-clamp-1 mb-1 text-sm md:text-base group-hover:text-blue-600 transition-colors duration-300">
                        {highlightText(project.title, searchQuery)}
                      </h4>

                      {/* User Info */}
                      <p className="text-xs md:text-sm text-gray-600 mb-2">
                        <span className="font-medium text-gray-400">by</span>{" "}
                        <span className="font-medium text-gray-700">
                          {highlightText(project.userId?.username, searchQuery)}
                        </span>
                        {project.userId?.email && (
                          <span className="text-xs text-gray-400 ml-1 hidden sm:inline">
                            {highlightText(project.userId?.email, searchQuery)}
                          </span>
                        )}
                      </p>

                      {/* Match Type Badge & Stats */}
                      <div className="flex items-center gap-3 text-xs">
                        {matchType && (
                          <span className="px-2 py-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full text-xs font-semibold shadow-sm">
                            {matchType}
                          </span>
                        )}
                        <div className="flex items-center gap-3 text-gray-500">
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                            </svg>
                            {project.views || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"/>
                            </svg>
                            {project.likes?.length || 0}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Arrow Icon */}
                    <svg 
                      className="w-5 h-5 text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all duration-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                    </svg>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* No Results - Modern Empty State */}
      {showResults &&
        searchQuery.length >= 2 &&
        searchResults.length === 0 &&
        !isSearching && (
          <div className="absolute z-50 w-full mt-3">
            <div className="bg-white/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-gray-100 p-8 text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No projects found
              </h3>
              <p className="text-sm text-gray-500">
                Try searching by project title, username, or email
              </p>
            </div>
          </div>
        )}

      {/* Click outside to close */}
      {showResults && (
        <div
          className="fixed inset-0 z-40 bg-black/5 backdrop-blur-[1px]"
          onClick={() => setShowResults(false)}
        ></div>
      )}

      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #3b82f6, #8b5cf6);
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #2563eb, #7c3aed);
        }
      `}</style>
    </div>
  );
}