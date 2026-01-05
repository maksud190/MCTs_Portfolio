// import { useState, useEffect } from 'react';
// import { API } from '../../api/api';
// import { toast } from 'sonner';
// import StatCard from '../components/StatCard';
// import { Link } from 'react-router-dom';

// export default function AdminDashboard() {
//   const [stats, setStats] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchDashboardStats();
//   }, []);

//   const fetchDashboardStats = async () => {
//     try {
//       const token = localStorage.getItem('token');
//       const res = await API.get('/admin/dashboard/stats', {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       setStats(res.data);
//     } catch (err) {
//       console.error('Error fetching dashboard stats:', err);
//       toast.error('Failed to load dashboard stats');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="space-y-6">
//       {/* Page Header */}
//       <div>
//         <h1 className="!text-3xl md:text-3xl font-bold text-stone-800 dark:text-stone-100 mb-0">
//           Dashboard Overview
//         </h1>
//         <p className="text-stone-700 dark:text-stone-400 font-medium">
//           Welcome back! Here's what's happening with your platform.
//         </p>
//       </div>

//       {/* Stats Grid */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
//         <StatCard className="bg-amber-400"
//           title="Total Users"
//           value={stats?.totalUsers}
//           icon={
//             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
//             </svg>
//           }
//           color="blue"
//           trend={{
//             direction: 'up',
//             value: `+${stats?.newUsersWeek || 0} this week`
//           }}
//           loading={loading}
//         />

//         <StatCard
//           title="Total Projects"
//           value={stats?.totalProjects}
//           icon={
//             <svg className="w-6 h-6 " fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
//             </svg>
//           }
//           color="green"
//           trend={{
//             direction: 'up',
//             value: `+${stats?.newProjectsWeek || 0} this week`
//           }}
//           loading={loading}
//         />

//         <StatCard
//           title="Total Comments"
//           value={stats?.totalComments}
//           icon={
//             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
//             </svg>
//           }
//           color="purple"
//           loading={loading}
//         />

//         <StatCard
//           title="Pending Reports"
//           value={stats?.pendingReports}
//           icon={
//             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
//             </svg>
//           }
//           color="red"
//           loading={loading}
//         />
//       </div>

//       {/* Recent Activity Grid */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         {/* Most Viewed Projects */}
//         <div className="bg-white dark:bg-gray-900 rounded-sm shadow p-6">
//           <div className="flex items-center justify-between mb-4">
//             <h2 className="text-lg font-bold text-stone-800 dark:text-stone-100">
//               Most Viewed Projects
//             </h2>
//             <Link
//               to="/admin/projects"
//               className="text-sm text-blue-600 dark:hover:!text-stone-100 hover:bg-blue-200 dark:hover:bg-blue-500/30 py-1.5 px-2.5 rounded-sm"
//             >
//               View All →
//             </Link>
//           </div>

//           {loading ? (
//             <div className="space-y-3">
//               {[1, 2, 3, 4, 5].map((i) => (
//                 <div key={i} className="animate-pulse flex items-center gap-3 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
//                   <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded"></div>
//                   <div className="flex-1">
//                     <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
//                     <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           ) : stats?.mostViewedProjects?.length > 0 ? (
//             <div className="space-y-3">
//               {stats.mostViewedProjects.map((project, index) => (
//                 <div
//                   key={project._id}
//                   className="flex items-center gap-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-sm transition-colors"
//                 >
//                   <div className="flex-shrink-0">
//                     <img
//                       src={project.thumbnail}
//                       alt={project.title}
//                       className="w-12 h-12 rounded object-cover"
//                     />
//                   </div>
//                   <div className="flex-1 min-w-0">
//                     <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
//                       {project.title}
//                     </p>
//                     <p className="text-xs text-gray-500 dark:text-gray-400">
//                       by {project.userId?.username}
//                     </p>
//                   </div>
//                   <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
//                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
//                     </svg>
//                     <span>{project.views}</span>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           ) : (
//             <div className="text-center py-8 text-gray-500 dark:text-gray-400">
//               No projects yet
//             </div>
//           )}
//         </div>

//         {/* Most Liked Projects */}
//         <div className="bg-white dark:bg-gray-900 rounded-sm shadow p-6">
//           <div className="flex items-center justify-between mb-4">
//             <h2 className="text-lg font-bold text-gray-900 dark:text-white">
//               Most Liked Projects
//             </h2>
//             <Link
//               to="/admin/projects"
//               className="text-sm text-blue-600 dark:hover:!text-stone-100 hover:bg-blue-200 dark:hover:bg-blue-500/30 py-1.5 px-2.5 rounded-sm"
//             >
//               View All →
//             </Link>
//           </div>

//           {loading ? (
//             <div className="space-y-3">
//               {[1, 2, 3, 4, 5].map((i) => (
//                 <div key={i} className="animate-pulse flex items-center gap-3 p-3 bg-gray-100 dark:bg-gray-700 rounded-sm">
//                   <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded"></div>
//                   <div className="flex-1">
//                     <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
//                     <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           ) : stats?.mostLikedProjects?.length > 0 ? (
//             <div className="space-y-3">
//               {stats.mostLikedProjects.map((project, index) => (
//                 <div
//                   key={project._id}
//                   className="flex items-center gap-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-sm transition-colors"
//                 >
//                   <div className="flex-shrink-0">
//                     <img
//                       src={project.thumbnail}
//                       alt={project.title}
//                       className="w-12 h-12 rounded object-cover"
//                     />
//                   </div>
//                   <div className="flex-1 min-w-0">
//                     <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
//                       {project.title}
//                     </p>
//                     <p className="text-xs text-gray-500 dark:text-gray-400">
//                       by {project.userId?.username}
//                     </p>
//                   </div>
//                   <div className="flex items-center gap-1 text-sm text-red-600">
//                     <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
//                       <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
//                     </svg>
//                     <span>{project.likes}</span>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           ) : (
//             <div className="text-center py-8 text-gray-500 dark:text-gray-400">
//               No projects yet
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Quick Actions */}
//       <div className="bg-white dark:bg-stone-900 rounded-sm shadow p-6">
//         <h2 className="text-lg font-bold text-stone-800 dark:text-stone-100 mb-4">
//           Quick Actions
//         </h2>
//         <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
//           <Link
//             to="/admin/users"
//             className="flex flex-col items-center gap-2 p-4 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-sm transition-colors"
//           >
//             <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
//             </svg>
//             <span className="text-sm font-medium text-gray-900 dark:text-white">Manage Users</span>
//           </Link>

//           <Link
//             to="/admin/projects"
//             className="flex flex-col items-center gap-2 p-4 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-sm transition-colors"
//           >
//             <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
//             </svg>
//             <span className="text-sm font-medium text-gray-900 dark:text-white">Manage Projects</span>
//           </Link>

//           <Link
//             to="/admin/announcements"
//             className="flex flex-col items-center gap-2 p-4 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-sm transition-colors"
//           >
//             <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
//             </svg>
//             <span className="text-sm font-medium text-gray-900 dark:text-white">Announcements</span>
//           </Link>

//           <Link
//             to="/admin/settings"
//             className="flex flex-col items-center gap-2 p-4 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-sm transition-colors"
//           >
//             <svg className="w-8 h-8 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
//             </svg>
//             <span className="text-sm font-medium text-gray-900 dark:text-white">Settings</span>
//           </Link>
//         </div>
//       </div>
//     </div>
//   );
// }






















import { useState, useEffect } from 'react';
import { API } from '../../api/api';
import { toast } from 'sonner';
import StatCard from '../components/StatCard';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      // FIXED: Removed duplicate Authorization header - interceptor handles it
      const res = await API.get('/admin/dashboard/stats');
      setStats(res.data);
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      console.error('Response:', err.response);
      toast.error('Failed to load dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="!text-3xl md:text-3xl font-bold text-stone-800 dark:text-stone-100 mb-0">
          Dashboard Overview
        </h1>
        <p className="text-stone-700 dark:text-stone-400 font-medium">
          Welcome back! Here's what's happening with your platform.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard
          title="Total Users"
          value={stats?.totalUsers}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          }
          color="blue"
          trend={{
            direction: 'up',
            value: `+${stats?.newUsersWeek || 0} this week`
          }}
          loading={loading}
        />

        <StatCard
          title="Total Projects"
          value={stats?.totalProjects}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          }
          color="green"
          trend={{
            direction: 'up',
            value: `+${stats?.newProjectsWeek || 0} this week`
          }}
          loading={loading}
        />

        <StatCard
          title="Total Comments"
          value={stats?.totalComments}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
          }
          color="purple"
          loading={loading}
        />

        <StatCard
          title="Pending Reports"
          value={stats?.pendingReports}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          }
          color="red"
          loading={loading}
        />
      </div>

      {/* Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Viewed Projects */}
        <div className="bg-white dark:bg-gray-900 rounded-sm shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-stone-800 dark:text-stone-100">
              Most Viewed Projects
            </h2>
            <Link
              to="/admin/projects"
              className="text-sm text-blue-600 dark:hover:!text-stone-100 hover:bg-blue-200 dark:hover:bg-blue-500/30 py-1.5 px-2.5 rounded-sm"
            >
              View All →
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="animate-pulse flex items-center gap-3 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : stats?.mostViewedProjects?.length > 0 ? (
            <div className="space-y-3">
              {stats.mostViewedProjects.map((project) => (
                <div
                  key={project._id}
                  className="flex items-center gap-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-sm transition-colors"
                >
                  <div className="flex-shrink-0">
                    <img
                      src={project.thumbnail}
                      alt={project.title}
                      className="w-12 h-12 rounded object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {project.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      by {project.userId?.username}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span>{project.views}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No projects yet
            </div>
          )}
        </div>

        {/* Most Liked Projects */}
        <div className="bg-white dark:bg-gray-900 rounded-sm shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Most Liked Projects
            </h2>
            <Link
              to="/admin/projects"
              className="text-sm text-blue-600 dark:hover:!text-stone-100 hover:bg-blue-200 dark:hover:bg-blue-500/30 py-1.5 px-2.5 rounded-sm"
            >
              View All →
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="animate-pulse flex items-center gap-3 p-3 bg-gray-100 dark:bg-gray-700 rounded-sm">
                  <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : stats?.mostLikedProjects?.length > 0 ? (
            <div className="space-y-3">
              {stats.mostLikedProjects.map((project) => (
                <div
                  key={project._id}
                  className="flex items-center gap-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-sm transition-colors"
                >
                  <div className="flex-shrink-0">
                    <img
                      src={project.thumbnail}
                      alt={project.title}
                      className="w-12 h-12 rounded object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {project.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      by {project.userId?.username}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-red-600">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                    <span>{project.likes}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No projects yet
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-stone-900 rounded-sm shadow p-6">
        <h2 className="text-lg font-bold text-stone-800 dark:text-stone-100 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Link
            to="/admin/users"
            className="flex flex-col items-center gap-2 p-4 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-sm transition-colors"
          >
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <span className="text-sm font-medium text-gray-900 dark:text-white">Manage Users</span>
          </Link>

          <Link
            to="/admin/projects"
            className="flex flex-col items-center gap-2 p-4 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-sm transition-colors"
          >
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <span className="text-sm font-medium text-gray-900 dark:text-white">Manage Projects</span>
          </Link>

          <Link
            to="/admin/announcements"
            className="flex flex-col items-center gap-2 p-4 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-sm transition-colors"
          >
            <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
            </svg>
            <span className="text-sm font-medium text-gray-900 dark:text-white">Announcements</span>
          </Link>

          <Link
            to="/admin/settings"
            className="flex flex-col items-center gap-2 p-4 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-sm transition-colors"
          >
            <svg className="w-8 h-8 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-sm font-medium text-gray-900 dark:text-white">Settings</span>
          </Link>
        </div>
      </div>
    </div>
  );
}