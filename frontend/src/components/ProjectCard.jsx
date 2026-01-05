import { useState, useEffect } from "react";
import { API } from "../api/api";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";

export default function ProjectCard({ project }) {
  const [likes, setLikes] = useState(project.likes || 0);
  const [isLiked, setIsLiked] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      checkLikeStatus();
    }
  }, [user, project._id]);

  const checkLikeStatus = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await API.get(`/projects/${project._id}/like-status`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setIsLiked(res.data.isLiked);
      setLikes(res.data.likes);
    } catch (err) {
      console.error("Error checking like status:", err);
    }
  };

  // 🔥 Handle card click - Open modal via hash
  const handleCardClick = (e) => {
    // Prevent if clicking on like button
    if (e.target.closest('button')) {
      return;
    }
    
    // Set hash to open modal
    window.location.hash = `project-${project._id}`;
  };

  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error("Please login to like projects");
      return;
    }

    if (loading) return;

    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const res = await API.post(
        `/projects/${project._id}/like`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setLikes(res.data.likes);
      setIsLiked(res.data.isLiked);

      if (res.data.isLiked) {
        toast.success("Liked! ❤️");
      } else {
        toast.success("Unliked");
      }
    } catch (err) {
      console.error("Error liking project:", err);

      if (err.response?.status === 401) {
        toast.error("Please login to like projects");
      } else {
        toast.error(err.response?.data?.message || "Failed to like project");
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffTime / (1000 * 60));
        return diffMinutes <= 1 ? "Just now" : `${diffMinutes}m ago`;
      }
      return diffHours === 1 ? "1h ago" : `${diffHours}h ago`;
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return weeks === 1 ? "1w ago" : `${weeks}w ago`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return months === 1 ? "1mo ago" : `${months}mo ago`;
    } else {
      const years = Math.floor(diffDays / 365);
      return years === 1 ? "1y ago" : `${years}y ago`;
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className="block group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1 border border-stone-200">
        {/* Image Section - More Height & Better Spacing */}
        <div className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 aspect-[4/3]">
          {project.thumbnail && !imageError ? (
            <>
              <img
                src={project.thumbnail}
                alt={project.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
                onError={() => setImageError(true)}
              />

              {/* Subtle Gradient Overlay on Hover */}
              <div
                className={`absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent transition-opacity duration-300 ${
                  isHovered ? "opacity-100" : "opacity-0"
                }`}
              ></div>

              <div className="">
                {/* Image Count Badge - Better Positioned */}
                {project.images && project.images.length > 1 && (
                  <div className="absolute top-4 left-4 top-11 bg-stone-100/90 backdrop-blur-sm text-gray-800 text-sm px-2 py-0.5 rounded-lg flex items-center gap-2 shadow-lg font-semibold">
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>{project.images.length}</span>
                  </div>
                )}

                {/* Category Badge - Better Positioned */}
                {project.category && (
                  <div className="absolute top-4 left-4 bg-blue-500/80 text-white text-xs px-2 py-1 rounded-lg font-light shadow-lg">
                    {project.category}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
              <svg
                className="w-20 h-20 text-gray-300 mb-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p className="text-sm text-gray-400 font-medium">
                No Image Available
              </p>
            </div>
          )}
        </div>

        {/* Content Section - More Breathing Room */}
        <div className="p-4">
          {/* Title - More Space */}
          <h3 className="text-lg font-bold text-stone-800 mb-2 line-clamp-1 leading-snug group-hover:text-blue-600 transition-colors">
            {project.title}
          </h3>

          {/* Author Info - Better Spacing */}
          <div className="flex items-center gap-2.5 mb-3">
            {project.userId?.avatar ? (
              <img
                src={project.userId.avatar}
                alt={project.userId.username}
                className="w-7 h-7 rounded-lg object-cover"
              />
            ) : (
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-stone-100 text-sm font-bold shadow-sm">
                {project.userId?.username?.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="text-sm font-medium text-stone-600 hover:text-stone-800 transition-colors">
              {project.userId?.username}
            </span>
          </div>

          {/* Stats Bar - Much More Space Between Items */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            {/* Views - Better Spacing */}
            <div className="flex items-center gap-2 text-gray-600">
              <svg
                className="w-5 h-5 text-gray-400"
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
              <span className="text-sm font-semibold">
                {project.views || 0}
              </span>
            </div>

            {/* Comments - Better Spacing */}
            <div className="flex items-center gap-2 text-gray-600">
              <svg
                className="w-5 h-5 text-gray-400"
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
              <span className="text-sm font-semibold">
                {project.comments?.length || 0}
              </span>
            </div>

            {/* Date - Better Spacing */}
            <div className="flex items-center gap-2 text-gray-500">
              <svg
                className="w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-xs font-medium">
                {formatDate(project.createdAt)}
              </span>
            </div>

            {/* Like Button - Bigger & Better Spaced */}
            <button
              onClick={handleLike}
              disabled={loading || !user}
              className={`relative flex items-center gap-1 !px-2.5 !py-1.5 rounded-sm transition-all duration-300 font-semibold ${
                isLiked
                  ? "bg-red-50 text-red-600 shadow-md ring-2 ring-red-100"
                  : "bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600 hover:ring-2 hover:ring-red-100"
              } ${loading ? "opacity-50 cursor-not-allowed" : ""} ${
                !user
                  ? "cursor-not-allowed opacity-60"
                  : "hover:shadow-lg hover:scale-105 active:scale-95"
              }`}
              title={!user ? "Login to like" : isLiked ? "Unlike" : "Like"}
            >
              {loading ? (
                <svg
                  className="animate-spin w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : (
                <svg
                  className={`w-5 h-5 transition-transform ${
                    isLiked ? "scale-110" : ""
                  }`}
                  fill={isLiked ? "currentColor" : "none"}
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              )}
              <span className="text-sm">{likes}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}