import { useState, useEffect } from 'react';
import { API } from '../../api/api';
import { toast } from 'sonner';

export default function Analytics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await API.get('/admin/dashboard/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(res.data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="!text-3xl md:text-3xl font-bold text-stone-800 dark:text-stone-100 mb-0">
          Analytics & Reports
        </h1>
        <p className="text-stone-600 dark:text-stone-400 font-medium">
          Platform insights and user growth statistics
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {loading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 animate-pulse">
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-24 mb-2"></div>
              <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-16"></div>
            </div>
          ))
        ) : (
          <>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Users</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats?.totalUsers || 0}</p>
              <p className="text-xs text-green-600 mt-2">+{stats?.newUsersWeek || 0} this week</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Projects</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats?.totalProjects || 0}</p>
              <p className="text-xs text-green-600 mt-2">+{stats?.newProjectsWeek || 0} this week</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">New Users (Month)</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats?.newUsersMonth || 0}</p>
              <p className="text-xs text-gray-500 mt-2">Last 30 days</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">New Projects (Month)</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats?.newProjectsMonth || 0}</p>
              <p className="text-xs text-gray-500 mt-2">Last 30 days</p>
            </div>
          </>
        )}
      </div>

      {/* User Growth Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          User Growth (Last 7 Days)
        </h2>
        
        {loading ? (
          <div className="animate-pulse">
            <div className="h-64 bg-gray-300 dark:bg-gray-700 rounded"></div>
          </div>
        ) : stats?.userGrowth && stats.userGrowth.length > 0 ? (
          <div className="space-y-3">
            {stats.userGrowth.map((day, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <span className="text-sm text-gray-600 dark:text-gray-400 w-24">
                  {new Date(day._id).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-8 relative">
                  <div
                    className="bg-blue-600 h-full rounded-full flex items-center justify-end pr-3"
                    style={{ width: `${Math.min((day.count / Math.max(...stats.userGrowth.map(d => d.count))) * 100, 100)}%` }}
                  >
                    <span className="text-white text-sm font-semibold">{day.count}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            No user growth data available
          </div>
        )}
      </div>

      {/* Top Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Viewed */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            Most Viewed Projects
          </h2>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse flex gap-3 p-3">
                  <div className="w-12 h-12 bg-gray-300 dark:bg-gray-700 rounded"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : stats?.mostViewedProjects?.length > 0 ? (
            <div className="space-y-3">
              {stats.mostViewedProjects.map((project, idx) => (
                <div key={project._id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-2xl font-bold text-gray-400 w-8">{idx + 1}</span>
                  <img src={project.thumbnail} alt={project.title} className="w-12 h-12 rounded object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white truncate">{project.title}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">👁️ {project.views} views</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-8 text-gray-500 dark:text-gray-400">No data available</p>
          )}
        </div>

        {/* Most Liked */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            Most Liked Projects
          </h2>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse flex gap-3 p-3">
                  <div className="w-12 h-12 bg-gray-300 dark:bg-gray-700 rounded"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : stats?.mostLikedProjects?.length > 0 ? (
            <div className="space-y-3">
              {stats.mostLikedProjects.map((project, idx) => (
                <div key={project._id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-2xl font-bold text-gray-400 w-8">{idx + 1}</span>
                  <img src={project.thumbnail} alt={project.title} className="w-12 h-12 rounded object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white truncate">{project.title}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">❤️ {project.likes} likes</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-8 text-gray-500 dark:text-gray-400">No data available</p>
          )}
        </div>
      </div>
    </div>
  );
}