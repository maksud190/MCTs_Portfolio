// import { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { API } from "../api/api";
// import ProjectCard from "../components/ProjectCard";
// import toast from "react-hot-toast";

// export default function UserProfile() {
//   const { userId } = useParams();
//   const navigate = useNavigate();
//   const [userData, setUserData] = useState(null);
//   const [projects, setProjects] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     if (userId) {
//       fetchUserData();
//       fetchUserProjects();
//     }
//   }, [userId]);

//   const fetchUserData = async () => {
//     try {
//       const res = await API.get(`/users/${userId}`);
//       setUserData(res.data);
//     } catch (err) {
//       console.error("Error fetching user data:", err);
//       toast.error("Failed to load user profile");
//     }
//   };

//   const fetchUserProjects = async () => {
//     try {
//       const res = await API.get(`/projects/user/${userId}`);
//       setProjects(res.data);
//       setLoading(false);
//     } catch (err) {
//       console.error("Error fetching user projects:", err);
//       setLoading(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center min-h-screen">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
//       </div>
//     );
//   }

//   if (!userData) {
//     return (
//       <div className="flex flex-col justify-center items-center min-h-screen">
//         <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">
//           User not found
//         </p>
//         <button
//           onClick={() => navigate(-1)}
//           className="text-blue-500 hover:text-blue-600"
//         >
//           Go Back
//         </button>
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-7xl mx-auto px-4 py-8">
//       {/* Back button */}
//       <button
//         onClick={() => navigate(-1)}
//         className="mb-4 flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-500 transition-colors"
//       >
//         <span>←</span>
//         <span>Back</span>
//       </button>

//       {/* User Info Card - Same style as Profile page */}
//       <div className="bg-white rounded-sm shadow-md p-6 mb-8">
//         <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
//           {/* Avatar */}
//           <div className="flex-shrink-0">
//             {userData.avatar ? (
//               <img
//                 src={userData.avatar}
//                 alt={userData.username}
//                 className="w-32 h-32 rounded-full object-cover border-4 border-stone-800"
//               />
//             ) : (
//               <div className="w-32 h-32 rounded-full bg-amber-400 flex items-center justify-center text-white text-4xl font-bold">
//                 {userData.username?.charAt(0).toUpperCase()}
//               </div>
//             )}
//           </div>

//           {/* User Details */}
//           <div className="flex-1 text-center md:text-left">
//             <div className="mb-4">
//               <h2 className="text-3xl font-bold text-stone-800 mb-1">
//                 {userData.username}
//               </h2>
//               <p className="text-stone-600">
//                 {userData.email}
//               </p>
//             </div>

//             {/* Bio */}
//             <p className="text-stone-600 mb-4">
//               {userData.bio || "No bio yet."}
//             </p>

//             {/* ✅ Social Links - ADD THIS */}
//             {userData.socialLinks &&
//               Object.values(userData.socialLinks).some((link) => link) && (
//                 <div className="flex flex-wrap gap-3 mb-4">
//                   {userData.socialLinks.linkedin && (
//                     <a
//                       href={userData.socialLinks.linkedin}
//                       target="_blank"
//                       rel="noopener noreferrer"
//                       className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
//                     >
//                       🔗 LinkedIn
//                     </a>
//                   )}
//                   {userData.socialLinks.github && (
//                     <a
//                       href={userData.socialLinks.github}
//                       target="_blank"
//                       rel="noopener noreferrer"
//                       className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-900 text-white rounded-lg text-sm transition-colors"
//                     >
//                       💻 GitHub
//                     </a>
//                   )}
//                   {userData.socialLinks.behance && (
//                     <a
//                       href={userData.socialLinks.behance}
//                       target="_blank"
//                       rel="noopener noreferrer"
//                       className="flex items-center gap-2 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm transition-colors"
//                     >
//                       🎨 Behance
//                     </a>
//                   )}
//                   {userData.socialLinks.portfolio && (
//                     <a
//                       href={userData.socialLinks.portfolio}
//                       target="_blank"
//                       rel="noopener noreferrer"
//                       className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm transition-colors"
//                     >
//                       🌐 Portfolio
//                     </a>
//                   )}
//                   {userData.socialLinks.twitter && (
//                     <a
//                       href={userData.socialLinks.twitter}
//                       target="_blank"
//                       rel="noopener noreferrer"
//                       className="flex items-center gap-2 px-3 py-1.5 bg-sky-500 hover:bg-sky-600 text-white rounded-lg text-sm transition-colors"
//                     >
//                       🐦 Twitter
//                     </a>
//                   )}
//                   {userData.socialLinks.instagram && (
//                     <a
//                       href={userData.socialLinks.instagram}
//                       target="_blank"
//                       rel="noopener noreferrer"
//                       className="flex items-center gap-2 px-3 py-1.5 bg-pink-600 hover:bg-pink-700 text-white rounded-lg text-sm transition-colors"
//                     >
//                       📷 Instagram
//                     </a>
//                   )}
//                   {userData.socialLinks.facebook && (
//                     <a
//                       href={userData.socialLinks.facebook}
//                       target="_blank"
//                       rel="noopener noreferrer"
//                       className="flex items-center gap-2 px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-sm transition-colors"
//                     >
//                       📘 Facebook
//                     </a>
//                   )}
//                 </div>
//               )}

//             {/* 🔥 Student Details - Public view */}
//             {(userData.studentId ||
//               userData.batch ||
//               userData.batchAdvisor ||
//               userData.batchMentor) && (
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
//                 {userData.studentId && (
//                   <div>
//                     <span className="font-semibold text-gray-600 dark:text-gray-400">
//                       Student ID:
//                     </span>
//                     <span className="ml-2 text-gray-800 dark:text-white">
//                       {userData.studentId}
//                     </span>
//                   </div>
//                 )}
//                 {userData.batch && (
//                   <div>
//                     <span className="font-semibold text-gray-600 dark:text-gray-400">
//                       Batch:
//                     </span>
//                     <span className="ml-2 text-gray-800 dark:text-white">
//                       {userData.batch}
//                     </span>
//                   </div>
//                 )}
//                 {userData.batchAdvisor && (
//                   <div>
//                     <span className="font-semibold text-gray-600 dark:text-gray-400">
//                       Advisor:
//                     </span>
//                     <span className="ml-2 text-gray-800 dark:text-white">
//                       {userData.batchAdvisor}
//                     </span>
//                   </div>
//                 )}
//                 {userData.batchMentor && (
//                   <div>
//                     <span className="font-semibold text-gray-600 dark:text-gray-400">
//                       Mentor:
//                     </span>
//                     <span className="ml-2 text-gray-800 dark:text-white">
//                       {userData.batchMentor}
//                     </span>
//                   </div>
//                 )}
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Projects Section */}
//       <h3 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">
//         Projects ({projects.length})
//       </h3>

//       {projects.length > 0 ? (
//         <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4">
//           {projects.map((p) => (
//             <div key={p._id} className="break-inside-avoid mb-4">
//               <ProjectCard project={p} />
//             </div>
//           ))}
//         </div>
//       ) : (
//         <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
//           <p className="text-gray-500 dark:text-gray-400">
//             This user hasn't uploaded any projects yet.
//           </p>
//         </div>
//       )}
//     </div>
//   );
// }
