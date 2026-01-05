import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { API } from "../api/api";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import Comments from "../components/Comments";
import ContactModal from "../components/ContactModal";

export default function ProjectDetails() {
  const { projectId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [showContactModal, setShowContactModal] = useState(false);

  useEffect(() => {
    fetchProject();
    incrementView();
    checkLikeStatus();

    // Prevent body scroll when modal is open
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [projectId]);

  // Handle ESC key press to close
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        navigate(-1);
      }
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [navigate]);

  const fetchProject = async () => {
    try {
      const res = await API.get(`/projects/${projectId}`);
      setProject(res.data);
      setLikes(res.data.likes || 0);
    } catch (err) {
      console.error("Fetch project error:", err);
      toast.error("Failed to load project");
    }
  };

  const incrementView = async () => {
    try {
      await API.post(`/projects/${projectId}/view`);
    } catch (err) {
      console.error("View increment error:", err);
    }
  };

  const checkLikeStatus = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await API.get(`/projects/${projectId}/like-status`, {
        headers,
      });
      setIsLiked(res.data.isLiked);
    } catch (err) {
      console.error("Check like status error:", err);
    }
  };

  const handleLike = async () => {
    if (!user) {
      toast.error("Please login to like projects");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await API.post(
        `/projects/${projectId}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setIsLiked(res.data.isLiked);
      setLikes(res.data.likes);
      toast.success(res.data.message);
    } catch (err) {
      console.error("Like error:", err);
      toast.error("Failed to like project");
    }
  };

  const handleDelete = async () => {
    if (
      !window.confirm(
        "⚠️ Are you sure you want to delete this project? This action cannot be undone."
      )
    )
      return;

    try {
      const token = localStorage.getItem("token");
      await API.delete(`/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Project deleted successfully");
      navigate("/profile");
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Failed to delete project");
    }
  };

  const handleClose = () => {
    navigate(-1);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return date.toLocaleDateString();
  };

  if (!project) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="bg-white rounded-3xl p-8 shadow-2xl">
          <div className="text-center">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 mx-auto"></div>
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent absolute top-0 left-1/2 -translate-x-1/2"></div>
            </div>
            <p className="text-gray-600 mt-4 font-medium">Loading project...</p>
          </div>
        </div>
      </div>
    );
  }

  const isOwner = user && project.userId._id === user._id;

  return (
    <>
      {/* Backdrop Overlay */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-fadeIn"
        onClick={handleClose}
      />

      {/* Modal Container */}
      <div className="mt-20 fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="w-fit max-w-7xl max-h-[90vh] bg-gray-100 rounded-3xl shadow-2xl overflow-hidden pointer-events-auto animate-slideUp"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header with Close Button */}
          <div className="sticky top-0 z-10 bg-white  border-b border-gray-200  px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={handleClose}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                title="Close (ESC)"
              >
                <svg
                  className="w-6 h-6 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
              <h2 className="text-xl font-bold text-gray-900 truncate max-w-md">
                {project.title}
              </h2>
            </div>

            {/* Owner Actions in Header */}
            {isOwner && (
              <div className="flex gap-2">
                <button
                  onClick={() => navigate(`/edit-project/${projectId}`)}
                  className="p-2 bg-blue-100 hover:bg-blue-600 text-blue-600 hover:text-white rounded-xl transition-all"
                  title="Edit Project"
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
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </button>
                <button
                  onClick={handleDelete}
                  className="p-2 bg-red-100 hover:bg-red-600 text-red-600 hover:text-white rounded-xl transition-all"
                  title="Delete Project"
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
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            )}
          </div>

          {/* Scrollable Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-80px)] custom-scrollbar">
            <div className="p-6">
              <div className="gap-6">
                {/* Main Content - Left Side */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Image Gallery */}
                  <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl overflow-hidden">
                    <div className="relative p-6">
                      <img
                        src={project.images[currentImageIndex]}
                        alt={project.title}
                        className="w-full h-64 sm:h-80 md:h-96 object-contain rounded-xl"
                      />

                      {/* Navigation Arrows */}
                      {project.images.length > 1 && (
                        <>
                          <button
                            onClick={() =>
                              setCurrentImageIndex((prev) =>
                                prev === 0
                                  ? project.images.length - 1
                                  : prev - 1
                              )
                            }
                            className="absolute left-2 top-1/2 -translate-y-1/2 !p-2 bg-white/70 hover:bg-white rounded-xl shadow-xl transition-all"
                          >
                            <svg
                              className="w-5 h-5 text-gray-900"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 19l-7-7 7-7"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() =>
                              setCurrentImageIndex((prev) =>
                                prev === project.images.length - 1
                                  ? 0
                                  : prev + 1
                              )
                            }
                            className="absolute right-2 top-1/2 -translate-y-1/2 !p-2 bg-white/70 hover:bg-white rounded-xl shadow-xl transition-all"
                          >
                            <svg
                              className="w-5 h-5 text-gray-900"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </button>
                        </>
                      )}

                      {/* Image Counter */}
                      <div className="absolute bottom-2 right-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 py-1 rounded-lg text-sm font-bold">
                        {currentImageIndex + 1} / {project.images.length}
                      </div>
                    </div>

                    {/* Thumbnail Strip */}
                    {project.images.length > 1 && (
                      <div className="p-4 bg-gradient-to-br from-gray-800 to-gray-700">
                        <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar justify-center">
                          {project.images.map((img, idx) => (
                            <button
                              key={idx}
                              onClick={() => setCurrentImageIndex(idx)}
                              className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                                currentImageIndex === idx
                                  ? "!border-blue-500 scale-100 shadow-lg"
                                  : "hover:border-blue-400"
                              }`}
                            >
                              <img
                                src={img}
                                alt={`${project.title} ${idx + 1}`}
                                className="w-full h-full"
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Project Info */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100 ">
                    {/* Pofile */}

                    <div className="lg:flex items-center lg:justify-between mb-7">
                      <a
                        href={`/profile/${project.userId.username}`}
                        className="flex items-center gap-3"
                      >
                        {project.userId.avatar ? (
                          <img
                            src={project.userId.avatar}
                            alt={project.userId.username}
                            className="w-12 h-12 rounded-xl object-cover border-2 border-gray-200 group-hover:border-blue-500 transition-all"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 border-2 border-gray-200 group-hover:border-blue-500 text-white text-lg font-bold flex items-center justify-center transition-all">
                            {project.userId.username?.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                            {project.userId.username}
                          </h4>
                          {project.userId.designation && (
                            <p className="text-xs text-gray-600 truncate">
                              {project.userId.designation}
                            </p>
                          )}
                        </div>
                      </a>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(window.location.href);
                            toast.success("Link copied!");
                          }}
                          className="flex items-center justify-center gap-2 !px-3 !py-2 bg-gray-200 hover:bg-gray-200  text-stone-800 rounded-xl font-medium transition-all text-sm"
                        >
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
                              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                            />
                          </svg>
                          Copy
                        </button>
                        <button
                          onClick={() => setShowContactModal(true)}
                          className="flex items-center justify-center gap-2 !px-4 !py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-medium transition-all text-sm"
                        >
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
                              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                            />
                          </svg>
                          Contact
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mb-4">
                      <svg
                        className="w-5 h-5 text-blue-600 "
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                        />
                      </svg>
                      <span className="text-sm font-semibold text-blue-700">
                        {project.category}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                      <svg
                        className="w-4 h-4 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 6h16M4 12h16M4 18h7"
                        />
                      </svg>
                      Description
                    </h3>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap font-medium italic text-sm">
                      {project.description}
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white  border border-gray-200 rounded-xl p-3 text-center">
                      <div className="text-xl mb-1">👁️</div>
                      <div className="text-xl font-black text-gray-900">
                        {project.views || 0}
                      </div>
                      <div className="text-xs text-gray-500 font-medium">
                        Views
                      </div>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-xl p-3 text-center">
                      <div className="text-xl mb-1">❤️</div>
                      <div className="text-xl font-black text-gray-900">
                        {likes}
                      </div>
                      <div className="text-xs text-gray-500 font-medium">
                        Likes
                      </div>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-xl p-3 text-center">
                      <div className="text-xl mb-1">📅</div>
                      <div className="text-xs font-bold text-gray-900">
                        {formatDate(project.createdAt)}
                      </div>
                      <div className="text-xs text-gray-500 font-medium">
                        Posted
                      </div>
                    </div>
                  </div>

                  {/* Like Button */}
                  {!isOwner && (
                    <button
                      onClick={handleLike}
                      className={`w-full py-3 rounded-xl font-bold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 ${
                        isLiked
                          ? "bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-600 text-white"
                          : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                      }`}
                    >
                      {isLiked ? (
                        <>
                          <svg
                            className="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Liked
                        </>
                      ) : (
                        <>
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
                              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                            />
                          </svg>
                          Like this Project
                        </>
                      )}
                    </button>
                  )}

                  {/* Comments Section */}
                  <Comments projectId={projectId} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Modal */}
      {showContactModal && (
        <ContactModal
          targetUser={project.userId}
          projectId={projectId}
          onClose={() => setShowContactModal(false)}
        />
      )}

      {/* Custom Scrollbar & Animation Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #555;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
