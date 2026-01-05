import { useState, useEffect } from "react";
import { API } from "../../api/api";
import { toast } from "sonner";
import { Link } from "react-router-dom";

export default function ProjectsManagement() {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [approvalFilter, setApprovalFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // NEW: FilterBar states
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("random");
  const [dateRange, setDateRange] = useState("all");

  useEffect(() => {
    fetchProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, approvalFilter]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await API.get("/admin/projects", {
        params: {
          page: currentPage,
          limit: 20,
          search: searchQuery,
          isApproved: approvalFilter,
        },
        headers: { Authorization: `Bearer ${token}` },
      });

      setProjects(res.data.projects || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error("Error fetching projects:", err);
      toast.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchProjects();
  };

  const handleApproveProject = async (projectId, currentStatus) => {
    const action = currentStatus ? "reject" : "approve";
    if (
      !window.confirm(
        `${
          action.charAt(0).toUpperCase() + action.slice(1)
        } this project?`
      )
    )
      return;

    try {
      const token = localStorage.getItem("token");
      await API.put(
        `/admin/projects/${projectId}/approve`,
        { isApproved: !currentStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(`Project ${action}d successfully`);
      fetchProjects();
    } catch (err) {
      console.error("Error updating project:", err);
      toast.error(`Failed to ${action} project`);
    }
  };

  const handleToggleFeatured = async (projectId) => {
    try {
      const token = localStorage.getItem("token");
      await API.put(
        `/admin/projects/${projectId}/featured`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success("Project featured status updated");
      fetchProjects();
    } catch (err) {
      console.error("Error toggling featured:", err);
      toast.error("Failed to update featured status");
    }
  };

  const handleDeleteProject = async (projectId, title) => {
    if (
      !window.confirm(
        `⚠️ Delete project "${title}"?\n\nThis will also delete all comments. This action cannot be undone.`
      )
    )
      return;

    try {
      const token = localStorage.getItem("token");
      await API.delete(`/admin/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Project deleted successfully");
      fetchProjects();
    } catch (err) {
      console.error("Error deleting project:", err);
      toast.error("Failed to delete project");
    }
  };

  // ---- FILTER LOGIC (Category + Sort + DateRange) ----
  useEffect(() => {
    let result = [...projects];

    // Category filter (prefix match like your FilterBar)
    if (selectedCategory && selectedCategory !== "All") {
      result = result.filter((p) =>
        p.category?.startsWith(selectedCategory)
      );
    }

    // Date range filter
    if (dateRange !== "all") {
      const now = new Date();
      let fromDate = null;

      if (dateRange === "week") {
        fromDate = new Date();
        fromDate.setDate(now.getDate() - 7);
      } else if (dateRange === "month") {
        fromDate = new Date();
        fromDate.setMonth(now.getMonth() - 1);
      } else if (dateRange === "3months") {
        fromDate = new Date();
        fromDate.setMonth(now.getMonth() - 3);
      } else if (dateRange === "4months") {
        fromDate = new Date();
        fromDate.setMonth(now.getMonth() - 4);
      } else if (dateRange === "6months") {
        fromDate = new Date();
        fromDate.setMonth(now.getMonth() - 6);
      } else if (dateRange === "year") {
        fromDate = new Date();
        fromDate.setFullYear(now.getFullYear() - 1);
      }

      if (fromDate) {
        result = result.filter((p) => {
          const created = new Date(p.createdAt);
          return created >= fromDate;
        });
      }
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === "latest") {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      if (sortBy === "oldest") {
        return new Date(a.createdAt) - new Date(b.createdAt);
      }
      if (sortBy === "likes-high") {
        return (b.likes || 0) - (a.likes || 0);
      }
      if (sortBy === "likes-low") {
        return (a.likes || 0) - (b.likes || 0);
      }
      if (sortBy === "views-high") {
        return (b.views || 0) - (a.views || 0);
      }
      if (sortBy === "views-low") {
        return (a.views || 0) - (b.views || 0);
      }
      // random / default
      return 0;
    });

    // Random shuffle when sortBy === "random"
    if (sortBy === "random") {
      result = result
        .map((item) => ({ item, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ item }) => item);
    }

    setFilteredProjects(result);
  }, [projects, selectedCategory, sortBy, dateRange]);

  // Category list for FilterBar
  const categories = [
    "All",
    ...Array.from(
      new Set(
        projects
          .map((p) => p.category?.split(" / ")[0])
          .filter(Boolean)
      )
    ),
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="!text-3xl md:text-3xl font-bold text-stone-800 dark:text-stone-100">
            Projects Management
          </h1>
          <p className="text-stone-600 dark:text-stone-400 font-medium mt-0">
            Manage and moderate all projects
          </p>
        </div>
      </div>

      {/* Search + Approval Filters */}
      <div className="bg-white dark:bg-stone-800 rounded-sm shadow p-4">
        <form
          onSubmit={handleSearch}
          className="flex flex-col sm:flex-row gap-4"
        >
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by title or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-stone-300 dark:border-stone-700 rounded-sm bg-white dark:bg-stone-900 text-gray-900 dark:text-stone-100"
            />
          </div>
          <select
            value={approvalFilter}
            onChange={(e) => {
              setApprovalFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 !py-1.5 border border-stone-300 dark:border-stone-700 rounded-sm bg-white dark:bg-stone-900 text-gray-900 dark:text-white"
          >
            <option value="">All Projects</option>
            <option value="true">Approved</option>
            <option value="false">Pending</option>
          </select>
          <button
            type="submit"
            className="px-6 !py-1.5 bg-blue-600 hover:bg-stone-900 text-white !rounded-sm font-medium transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      {/* NEW: FilterBar (Category + Sort + Time) */}
      <FilterBar
        categories={categories}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        sortBy={sortBy}
        setSortBy={setSortBy}
        dateRange={dateRange}
        setDateRange={setDateRange}
        projects={projects}
        filteredProjects={filteredProjects}
      />

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
        {loading ? (
          // Loading skeleton
          [...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-800 !rounded-sm shadow overflow-hidden animate-pulse"
            >
              <div className="w-full h-48 bg-gray-300 dark:bg-gray-700"></div>
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
                <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-full"></div>
              </div>
            </div>
          ))
        ) : filteredProjects.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">
            No projects found with current filters
          </div>
        ) : (
          filteredProjects.map((project) => (
            <div
              key={project._id}
              className="bg-white dark:bg-gray-800/50 rounded-sm shadow overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Thumbnail */}
              <div className="relative">
                <img
                  src={project.thumbnail}
                  alt={project.title}
                  className="w-full h-40 object-cover"
                />

                {/* Featured Badge */}
                {project.isFeatured && (
                  <div className="absolute top-2 left-2 bg-yellow-500 text-white px-3 py-1 rounded-sm text-xs font-bold flex items-center gap-1">
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    Featured
                  </div>
                )}

                {/* Status Badge */}
                <div className="absolute top-2 right-2">
                  {project.isApproved ? (
                    <span className="bg-green-500/70 text-white px-2 py-1 rounded-sm text-xs font-medium">
                      ✓ Approved
                    </span>
                  ) : (
                    <span className="bg-yellow-500 text-white px-2 py-1 rounded-sm text-xs font-medium">
                      ⏳ Pending
                    </span>
                  )}
                </div>

                {/* Stats Overlay */}
                <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-white text-xs">
                  <div className="flex items-center gap-3 bg-stone-800/40 backdrop-blur-sm px-1.5 py-1 rounded-sm">
                    <span className="flex items-center gap-1">
                      👁️ {project.views || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      ❤️ {project.likes || 0}
                    </span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-3">
                <h3 className="font-bold text-gray-900 dark:text-white mb-1 line-clamp-1">
                  {project.title}
                </h3>

                <div className="flex items-center gap-2 mb-1">
                  {project.userId?.avatar ? (
                    <img
                      src={project.userId.avatar}
                      alt={project.userId.username}
                      className="w-6 h-6 rounded-sm object-cover"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-sm bg-stone-900 border-1 border-stone-300 flex items-center justify-center text-xs font-bold text-stone-100">
                      {project.userId?.username
                        ?.charAt(0)
                        .toUpperCase()}
                    </div>
                  )}
                  <span className="text-sm text-stone-700 dark:text-stone-300">
                    {project.userId?.username}
                  </span>
                </div>

                <p className="text-xs text-stone-500 dark:text-stone-400">
                  {project.category}
                </p>

                <p className="text-xs font-medium text-stone-500 dark:text-stone-400 mb-4">
                  {new Date(project.createdAt).toLocaleDateString()}
                </p>

                {/* Actions */}
                <div className="flex flex-wrap gap-2">
                  <Link
                    to={`/project/${project._id}`}
                    target="_blank"
                    className=" bg-blue-600 hover:bg-blue-700 !text-white !text-sm rounded-sm !font-sm transition-colors !pt-2 px-2"
                  >
                    View
                  </Link>

                  <button
                    onClick={() =>
                      handleApproveProject(
                        project._id,
                        project.isApproved
                      )
                    }
                    className={`flex-1 !px-0 !py-0 !text-sm !rounded-sm !font-sm transition-colors ${
                      project.isApproved
                        ? "bg-red-200 text-red-700 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400"
                        : "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400"
                    }`}
                  >
                    {project.isApproved ? "Reject" : "Approve"}
                  </button>

                  <button
                    onClick={() =>
                      handleToggleFeatured(project._id)
                    }
                    className={`!p-2 !rounded-sm transition-colors ${
                      project.isFeatured
                        ? "bg-yellow-500 text-white"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600"
                    }`}
                    title={
                      project.isFeatured
                        ? "Remove featured"
                        : "Make featured"
                    }
                  >
                    <svg
                      className="w-5 h-5 "
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </button>

                  <button
                    onClick={() =>
                      handleDeleteProject(
                        project._id,
                        project.title
                      )
                    }
                    className="!p-2 bg-red-200 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 !rounded-sm transition-colors"
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
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white dark:bg-gray-800 !rounded-sm shadow px-6 py-4 flex items-center justify-between">
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.max(1, prev - 1))
            }
            disabled={currentPage === 1}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() =>
              setCurrentPage((prev) =>
                Math.min(totalPages, prev + 1)
              )
            }
            disabled={currentPage === totalPages}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

/* ---------------- FilterBar COMPONENT (same style as you gave) ---------------- */

function FilterBar({
  categories = [],
  selectedCategory,
  setSelectedCategory,
  sortBy,
  setSortBy,
  dateRange,
  setDateRange,
  projects = [],
  filteredProjects = [],
}) {
  return (
    <div className="mb-6 bg-white dark:bg-stone-800 rounded-sm shadow-lg overflow-hidden">
      {/* Compact Filters Content */}
      <div className="p-5">
        <div className="flex flex-col gap-4">
          {/* Mobile Category Dropdown */}
          <div className="w-full lg:hidden">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
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
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                />
              </svg>
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl bg-white text-gray-900 hover:border-blue-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all cursor-pointer font-medium"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat} (
                  {cat === "All"
                    ? projects.length
                    : projects.filter((p) =>
                        p.category?.startsWith(cat)
                      ).length}
                  )
                </option>
              ))}
            </select>
          </div>

          {/* Compact Filters Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Sort Dropdown with Modern Icons */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-stone-800 dark:text-stone-300 mb-2">
                <svg
                  className="w-4 h-4text-stone-800 dark:text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"
                  />
                </svg>
                Sort By
              </label>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-2.5 pl-10 text-sm border-1 border-stone-300 dark:border-stone-700 rounded-sm bg-gray-50 dark:bg-stone-900 text-stone-600 dark:text-stone-100 hover:border-blue-400 transition-all cursor-pointer font-medium appearance-none pr-10"
                >
                  <option value="random">Default (Random)</option>
                  <option value="latest">Latest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="likes-high">Most Liked</option>
                  <option value="likes-low">Least Liked</option>
                  <option value="views-high">Most Viewed</option>
                  <option value="views-low">Least Viewed</option>
                </select>

                {/* Left Icon */}
                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  {sortBy === "random" && (
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
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  )}
                  {(sortBy === "latest" || sortBy === "oldest") && (
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
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  )}
                  {(sortBy === "likes-high" ||
                    sortBy === "likes-low") && (
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
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                  )}
                  {(sortBy === "views-high" ||
                    sortBy === "views-low") && (
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
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </div>

                {/* Right Dropdown Arrow */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg
                    className="w-4 h-4 text-stone-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Date Range Dropdown with Modern Icons */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-stone-800 dark:text-stone-300 mb-2">
                <svg
                  className="w-4 h-4 text-stone-800 dark:text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                Time Period
              </label>
              <div className="relative">
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="w-full px-4 py-2.5 pl-10 text-sm border-1 border-stone-300 dark:border-stone-700 rounded-sm bg-gray-50 dark:bg-stone-900 text-stone-600 dark:text-stone-100 hover:border-blue-400 transition-all cursor-pointer font-medium appearance-none pr-10"
                >
                  <option value="all">All Time</option>
                  <option value="week">Last Week</option>
                  <option value="month">Last Month</option>
                  <option value="3months">Last 3 Months</option>
                  <option value="4months">Last 4 Months</option>
                  <option value="6months">Last 6 Months</option>
                  <option value="year">Last Year</option>
                </select>

                {/* Left Icon */}
                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  {dateRange === "all" && (
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
                        d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  )}
                  {dateRange === "week" && (
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
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  )}
                  {(dateRange === "month" ||
                    dateRange === "3months" ||
                    dateRange === "4months") && (
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
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                  )}
                  {(dateRange === "6months" ||
                    dateRange === "year") && (
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
                        d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  )}
                </div>

                {/* Right Dropdown Arrow */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
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
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Compact Results Footer */}
      <div className="bg-white dark:bg-stone-900 px-5 py-3 border-t border-stone-300 dark:border-stone-700">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-7 h-7 bg-stone-100 rounded-full">
            <svg
              className="w-4 h-4 text-stone-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
              />
            </svg>
          </div>
          <p className="text-sm text-stone-600 dark:text-stone-400">
            Showing{" "}
            <span className="font-bold text-blue-600">
              {filteredProjects.length}
            </span>{" "}
            {filteredProjects.length === 1 ? "project" : "projects"}
            {selectedCategory !== "All" && (
              <span>
                {" "}
                in{" "}
                <span className="font-semibold text-gray-900">
                  {selectedCategory}
                </span>
              </span>
            )}
            {dateRange !== "all" && (
              <span>
                {" "}
                from{" "}
                <span className="font-semibold text-gray-900">
                  {dateRange === "week" && "last week"}
                  {dateRange === "month" && "last month"}
                  {dateRange === "3months" && "last 3 months"}
                  {dateRange === "4months" && "last 4 months"}
                  {dateRange === "6months" && "last 6 months"}
                  {dateRange === "year" && "last year"}
                </span>
              </span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}