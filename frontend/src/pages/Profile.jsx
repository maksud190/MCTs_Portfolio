import { useEffect, useState, useRef } from "react";
import { API } from "../api/api";
import { useAuth } from "../context/AuthContext";
import ProjectCard from "../components/ProjectCard";
import { useNavigate, useParams, Link } from "react-router-dom";
import { toast } from "sonner";

export default function Profile() {
  const { user: currentUser } = useAuth();
  const { username } = useParams(); // /profile/:username
  const [profileUser, setProfileUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const navigate = useNavigate();

  // 🔑 last loaded user key (username or userId) – double fetch prevent
  const lastFetchKeyRef = useRef(null);

  const isOwnProfile =
    !username || (currentUser && username === currentUser.username);

  const displayUser = isOwnProfile ? currentUser : profileUser;

  // ✅ username diye user fetch
  const fetchUserProfileByUsername = async (uname) => {
    try {
      setLoading(true);
      const response = await API.get(`/users/username/${uname}`);
      const user = response.data;
      setProfileUser(user);
      await fetchProjects(user._id);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      toast.error("Failed to load user profile");
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async (id) => {
    try {
      setProjectsLoading(true);
      const response = await API.get(`/projects/user/${id}`);
      setProjects(response.data);
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setProjectsLoading(false);
    }
  };

  // 🔥 Main effect – ekbar e fetch korbo (StrictMode e double run handle)
  useEffect(() => {
    // kon user ke load korte hobe tar ekta unique key
    const key = username || currentUser?._id;

    // ekhono kono user info nai
    if (!key) return;

    // jodi ei key er jonno agei fetch kore thaki, abar korbo na
    if (lastFetchKeyRef.current === key) {
      return;
    }
    // ebar theke ei key ke loaded dhore nichi
    lastFetchKeyRef.current = key;

    if (!username && currentUser) {
      // own profile
      setProfileUser(currentUser);
      fetchProjects(currentUser._id);
      setLoading(false);
    } else if (username) {
      // onno user-er profile
      fetchUserProfileByUsername(username);
    }
  }, [username, currentUser]); // isOwnProfile ke dependency theke ber kore dilam

  const handleDelete = async (projectId, projectTitle) => {
    if (!isOwnProfile) return;

    const isConfirmed = window.confirm(
      `⚠️ Delete Project?\n\n"${projectTitle}"\n\nThis action cannot be undone. Are you sure?`
    );

    if (!isConfirmed) return;

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("Please login again");
        navigate("/login");
        return;
      }

      await API.delete(`/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Project deleted successfully!");
      setProjects((prev) => prev.filter((p) => p._id !== projectId));
    } catch (err) {
      console.error("Error deleting project:", err);
      toast.error(err.response?.data?.message || "Failed to delete project");
    }
  };

  const handleEdit = (projectId) => {
    navigate(`/edit-project/${projectId}`);
  };

  const hasSocialLinks =
    displayUser?.socialLinks &&
    Object.values(displayUser.socialLinks).some(
      (link) => link && link.trim() !== ""
    );

  const socialLinksConfig = [
    {
      key: "linkedin",
      label: "LinkedIn",
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      ),
    },
    {
      key: "github",
      label: "GitHub",
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
        </svg>
      ),
    },
    {
      key: "behance",
      label: "Behance",
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M22 7h-7v-2h7v2zm1.726 10c-.442 1.297-2.029 3-5.101 3-3.074 0-5.564-1.729-5.564-5.675 0-3.91 2.325-5.92 5.466-5.92 3.082 0 4.964 1.782 5.375 4.426.078.506.109 1.188.095 2.14h-8.027c.13 3.211 3.483 3.312 4.588 2.029h3.168zm-7.686-4h4.965c-.105-1.547-1.136-2.219-2.477-2.219-1.466 0-2.277.768-2.488 2.219zm-9.574 6.988h-6.466v-14.967h6.953c5.476.081 5.58 5.444 2.72 6.906 3.461 1.26 3.577 8.061-3.207 8.061zm-3.466-8.988h3.584c2.508 0 2.906-3-.312-3h-3.272v3zm3.391 3h-3.391v3.016h3.341c3.055 0 2.868-3.016.05-3.016z" />
        </svg>
      ),
    },
    {
      key: "portfolio",
      label: "Portfolio",
      icon: (
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
            d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
          />
        </svg>
      ),
    },
    {
      key: "twitter",
      label: "Twitter",
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
        </svg>
      ),
    },
    {
      key: "instagram",
      label: "Instagram",
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      ),
    },
    {
      key: "facebook",
      label: "Facebook",
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
    },
  ];

  if (loading && !displayUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 mx-auto"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent absolute top-0 left-1/2 -translate-x-1/2"></div>
          </div>
          <p className="text-gray-600 mt-4 font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 mb-30">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Modern Profile Card */}
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden pt-24 mb-8">
          {/* Profile Content */}
          <div className="px-6 pb-6">
            <div className="flex flex-col md:flex-row gap-6 -mt-16 mb-4">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                {displayUser?.avatar ? (
                  <img
                    src={displayUser.avatar}
                    alt={displayUser.username}
                    className="w-32 h-32 md:w-40 md:h-40 rounded-3xl object-cover border-8 border-white shadow-2xl"
                  />
                ) : (
                  <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-600 border-8 border-white shadow-2xl flex items-center justify-center text-white text-5xl md:text-6xl font-bold">
                    {displayUser?.username?.charAt(0).toUpperCase()}
                  </div>
                )}
                {displayUser?.role === "teacher" && (
                  <div className="absolute top-35 -right-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                    Teacher
                  </div>
                )}
              </div>

              {/* User Info */}
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                  <div>
                    <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">
                      {displayUser?.fullName}
                    </h1>
                    <h6 className="!text-2xl md:text-4xl font-black text-gray-800 mb-2">
                      {displayUser?.username}
                    </h6>
                    <p className="text-gray-600 mb-2 flex items-center gap-2">
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
                      {displayUser?.email}
                    </p>

                    {displayUser?.designation && (
                      <p className="text-blue-600 font-semibold mb-1 flex items-center gap-2">
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
                            d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                        {displayUser.designation}
                      </p>
                    )}

                    {displayUser?.department && (
                      <p className="text-gray-600 flex items-center gap-2">
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
                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                          />
                        </svg>
                        {displayUser.department}
                      </p>
                    )}
                  </div>

                  {isOwnProfile && displayUser?.username && (
                    <Link
                      to={`/profile/${encodeURIComponent(
                        displayUser.username
                      )}/settings`}
                      className="mt-4 md:mt-0 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 !text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
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
                          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      Edit Profile
                    </Link>
                  )}
                </div>

                {/* Bio */}
                {displayUser?.bio && (
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 mb-4 border border-blue-100">
                    <p className="text-gray-700 leading-relaxed">
                      {displayUser.bio}
                    </p>
                  </div>
                )}

                {/* Social Links */}
                {hasSocialLinks && (
                  <div className="mb-4">
                    <p className="text-sm font-semibold text-gray-700 mb-3">
                      Connect with me:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {socialLinksConfig.map(({ key, label, icon }) =>
                        displayUser.socialLinks[key] ? (
                          <a
                            key={key}
                            href={displayUser.socialLinks[key]}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 text-gray-700 hover:text-blue-600 rounded-xl font-medium transition-all shadow-sm hover:shadow-md"
                          >
                            {icon}
                            <span>{label}</span>
                          </a>
                        ) : null
                      )}
                    </div>
                  </div>
                )}

                {!hasSocialLinks && isOwnProfile && displayUser?.username && (
                  <div className="mb-4 p-4 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl">
                    <p className="text-sm text-gray-700 flex items-center gap-2">
                      <svg
                        className="w-5 h-5 text-amber-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span>No social links added yet.</span>
                      <Link
                        to={`/profile/${encodeURIComponent(
                          displayUser.username
                        )}/settings`}
                        className="text-blue-600 hover:text-blue-700 underline font-semibold"
                      >
                        Add links
                      </Link>
                    </p>
                  </div>
                )}

                {/* Student Details */}
                {(displayUser?.studentId || displayUser?.batch) && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {displayUser.studentId && (
                      <div className="bg-white border-2 border-gray-200 rounded-xl p-3">
                        <p className="text-xs text-gray-500 mb-1">
                          Student ID
                        </p>
                        <p className="font-bold text-gray-900">
                          {displayUser.studentId}
                        </p>
                      </div>
                    )}
                    {displayUser.batch && (
                      <div className="bg-white border-2 border-gray-200 rounded-xl p-3">
                        <p className="text-xs text-gray-500 mb-1">Batch</p>
                        <p className="font-bold text-gray-900">
                          {displayUser.batch}
                        </p>
                      </div>
                    )}
                    {displayUser.batchAdvisor && (
                      <div className="bg-white border-2 border-gray-200 rounded-xl p-3">
                        <p className="text-xs text-gray-500 mb-1">Advisor</p>
                        <p className="font-bold text-gray-900">
                          {displayUser.batchAdvisor}
                        </p>
                      </div>
                    )}
                    {displayUser.batchMentor && (
                      <div className="bg-white border-2 border-gray-200 rounded-xl p-3">
                        <p className="text-xs text-gray-500 mb-1">Mentor</p>
                        <p className="font-bold text-gray-900">
                          {displayUser.batchMentor}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Projects Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-black text-gray-900">
                {isOwnProfile ? "My" : `${displayUser?.username}'s`} Projects
              </h2>
              {!projectsLoading && (
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-bold">
                  {projects.length}
                </span>
              )}
            </div>

            {isOwnProfile && projects.length > 0 && !projectsLoading && (
              <button
                onClick={() => navigate("/upload")}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
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
                <span className="hidden sm:inline">Add Project</span>
              </button>
            )}
          </div>

          {/* Projects Loading State */}
          {projectsLoading ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-gray-200">
              <div className="relative inline-block">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 mx-auto"></div>
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent absolute top-0 left-1/2 -translate-x-1/2"></div>
              </div>
              <p className="text-gray-600 mt-4 font-medium">
                Loading projects...
              </p>
              <div className="flex items-center justify-center gap-2 mt-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
            </div>
          ) : projects.length > 0 ? (
            <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-4 gap-6">
              {projects.map((p) => (
                <div key={p._id} className="break-inside-avoid mb-6">
                  <div className="relative group">
                    <ProjectCard project={p} />

                    {isOwnProfile && (
                      <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleEdit(p._id);
                          }}
                          className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg transition-all hover:scale-110"
                          title="Edit project"
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
                          onClick={(e) => {
                            e.preventDefault();
                            handleDelete(p._id, p.title);
                          }}
                          className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-lg transition-all hover:scale-110"
                          title="Delete project"
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
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-300">
              <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center">
                <svg
                  className="w-16 h-16 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                {isOwnProfile ? "No Projects Yet" : "No Projects Uploaded"}
              </h3>
              <p className="text-gray-600 mb-6">
                {isOwnProfile
                  ? "Start showcasing your creative work!"
                  : "This user hasn't uploaded any projects yet."}
              </p>
              {isOwnProfile && (
                <button
                  onClick={() => navigate("/upload")}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold transition-all shadow-xl hover:shadow-2xl flex items-center gap-2 mx-auto"
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
                  Upload Your First Project
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}