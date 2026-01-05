// import { useEffect, useState, useRef } from "react";
// import { Link } from "react-router-dom";
// import { API } from "../api/api";
// import { useAuth } from "../context/AuthContext";
// import ProjectCard from "../components/ProjectCard";
// import CategorySidebar from "../components/CategorySidebar";
// import FilterBar from "../components/FilterBar";
// import ToolsShowcase from "../components/ToolsShowcase";
// import TestimonialSection from "../components/TestimonialSection";

// export default function Home() {
//   const { user } = useAuth();
//   const [projects, setProjects] = useState([]);
//   const [filteredProjects, setFilteredProjects] = useState([]);
//   const [selectedCategory, setSelectedCategory] = useState("All");
//   const [sortBy, setSortBy] = useState("random");
//   const [dateRange, setDateRange] = useState("all");

//   const [visibleCount, setVisibleCount] = useState(15);
//   const [loading, setLoading] = useState(false);
//   const [initialLoading, setInitialLoading] = useState(true);

//   const shuffledProjectsRef = useRef(null);
//   const lastSortRef = useRef("random");

//   const categories = [
//     "All",
//     "3d",
//     "Art",
//     "Branding",
//     "Web Development",
//     "Game Development",
//     "Graphics Design",
//     "Mobile Apps",
//     "Music",
//     "Photography",
//     "Video Production",
//     "Writing",
//   ];

//   const shuffleArray = (array) => {
//     const shuffled = [...array];
//     for (let i = shuffled.length - 1; i > 0; i--) {
//       const j = Math.floor(Math.random() * (i + 1));
//       [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
//     }
//     return shuffled;
//   };

//   // ✅ Helper function to get likes count
//   const getLikesCount = (project) => {
//     if (!project.likes) return 0;
//     // If likes is an array, return its length
//     if (Array.isArray(project.likes)) return project.likes.length;
//     // If likes is a number, return it directly
//     if (typeof project.likes === 'number') return project.likes;
//     return 0;
//   };

//   useEffect(() => {
//     setInitialLoading(true);
//     API.get("/projects")
//       .then((res) => {
//         console.log("Sample project likes:", res.data[0]?.likes); // ✅ Debug log
//         setProjects(res.data);
//         setInitialLoading(false);
//       })
//       .catch((err) => {
//         console.error("❌ Error fetching projects:", err);
//         setInitialLoading(false);
//       });
//   }, []);

//   useEffect(() => {
//     if (projects.length > 0 && sortBy === "random") {
//       if (!shuffledProjectsRef.current || lastSortRef.current !== "random") {
//         shuffledProjectsRef.current = shuffleArray(projects);
//       }
//     }
//     lastSortRef.current = sortBy;
//   }, [projects, sortBy]);

//   useEffect(() => {
//     if (projects.length === 0) return;

//     let filtered = [...projects];

//     // Apply random sorting first if selected
//     if (sortBy === "random" && shuffledProjectsRef.current) {
//       filtered = [...shuffledProjectsRef.current];
//     }

//     // Apply category filter
//     if (selectedCategory !== "All") {
//       filtered = filtered.filter((p) =>
//         p.category.startsWith(selectedCategory)
//       );
//     }

//     // Apply date range filter
//     if (dateRange !== "all") {
//       const now = new Date();
//       const filterDate = new Date();

//       switch (dateRange) {
//         case "week":
//           filterDate.setDate(now.getDate() - 7);
//           break;
//         case "month":
//           filterDate.setMonth(now.getMonth() - 1);
//           break;
//         case "3months":
//           filterDate.setMonth(now.getMonth() - 3);
//           break;
//         case "4months":
//           filterDate.setMonth(now.getMonth() - 4);
//           break;
//         case "6months":
//           filterDate.setMonth(now.getMonth() - 6);
//           break;
//         case "year":
//           filterDate.setFullYear(now.getFullYear() - 1);
//           break;
//       }

//       filtered = filtered.filter((p) => new Date(p.createdAt) >= filterDate);
//     }

//     // ✅ Apply sorting (Updated with better likes handling)
//     if (sortBy !== "random") {
//       switch (sortBy) {
//         case "latest":
//           filtered.sort(
//             (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
//           );
//           break;
//         case "oldest":
//           filtered.sort(
//             (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
//           );
//           break;
//         case "likes-high":
//           // ✅ Fixed: Using helper function for consistent likes counting
//           filtered.sort((a, b) => {
//             const aLikes = getLikesCount(a);
//             const bLikes = getLikesCount(b);
//             console.log(`Comparing: ${a.title} (${aLikes} likes) vs ${b.title} (${bLikes} likes)`); // Debug
//             return bLikes - aLikes; // High to low
//           });
//           break;
//         case "likes-low":
//           // ✅ Fixed: Using helper function for consistent likes counting
//           filtered.sort((a, b) => {
//             const aLikes = getLikesCount(a);
//             const bLikes = getLikesCount(b);
//             return aLikes - bLikes; // Low to high
//           });
//           break;
//         case "views-high":
//           filtered.sort((a, b) => (b.views || 0) - (a.views || 0));
//           break;
//         case "views-low":
//           filtered.sort((a, b) => (a.views || 0) - (b.views || 0));
//           break;
//         default:
//           break;
//       }
//     }

//     console.log("Filtered projects after sorting:", filtered.slice(0, 3).map(p => ({
//       title: p.title,
//       likes: getLikesCount(p)
//     }))); // ✅ Debug log

//     setFilteredProjects(filtered);
//     setVisibleCount(15);
//   }, [projects, selectedCategory, sortBy, dateRange]);

//   const handleSeeMore = () => {
//     setLoading(true);
//     setTimeout(() => {
//       setVisibleCount((prev) => prev + 15);
//       setLoading(false);
//     }, 500);
//   };

//   const currentYear = new Date().getFullYear();

//   const [stats, setStats] = useState({
//     projects: 0,
//     users: 0,
//   });

//   useEffect(() => {
//     fetchStats();
//   }, []);

//   const fetchStats = async () => {
//     try {
//       const [projectsRes, usersRes] = await Promise.all([
//         API.get("/projects"),
//         API.get("/users/all"),
//       ]);

//       setStats({
//         projects: projectsRes.data.length || 0,
//         users: usersRes.data.length || 0,
//       });
//     } catch (err) {
//       console.error("Error fetching stats:", err);
//     }
//   };

//   const visibleProjects = filteredProjects.slice(0, visibleCount);
//   const hasMoreProjects = visibleCount < filteredProjects.length;
//   const remainingCount = filteredProjects.length - visibleCount;

//   return (
//     <div className="mb-20">
//       {/* Header Section */}
//       <div className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 overflow-hidden">
//         {/* Decorative Background Elements */}
//         <div className="absolute inset-0 overflow-hidden">
//           {/* Floating Circles */}
//           <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-200/30 !rounded-sm blur-3xl"></div>
//           <div className="absolute top-1/2 -right-32 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl"></div>
//           <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl"></div>

//           {/* Grid Pattern Overlay */}
//           <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLW9wYWNpdHk9IjAuMDMiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-40"></div>
//         </div>

//         {/* Content Container */}
//         <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 md:py-36 lg:py-30">
//           <div className="text-center space-y-8">
//             {/* Badge */}
//             <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg border border-gray-200">
//               <span className="relative flex h-2 w-2">
//                 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
//                 <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
//               </span>
//               <span className="text-sm font-semibold text-gray-700">
//                 MCT's Portfolio
//               </span>
//             </div>

//             {/* Main Heading */}
//             <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-gray-900 leading-tight">
//               Discover Amazing
//               <span className="block bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
//                 Creative Projects
//               </span>
//             </h1>

//             {/* Subtitle */}
//             <p className="text-lg sm:text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
//               Explore a diverse collection of projects across various
//               categories.
//               <br className="hidden sm:block" />
//               Find inspiration, collaborate, and showcase your own work.
//             </p>

//             {/* Department Tag */}
//             <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full shadow-xl font-medium text-sm">
//               <svg
//                 className="w-5 h-5"
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
//                 />
//               </svg>
//               <span>Multimedia and Creative Technology</span>
//             </div>

//             {/* CTA Buttons */}
//             <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
//               {user ? (
//                 <a
//                   href="/profile"
//                   className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 !text-white rounded-xl font-semibold shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 flex items-center gap-2"
//                 >
//                   <svg
//                     className="w-5 h-5"
//                     fill="none"
//                     stroke="currentColor"
//                     viewBox="0 0 24 24"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
//                     />
//                   </svg>
//                   <span>Visit Your Profile</span>
//                   <svg
//                     className="w-5 h-5 group-hover:translate-x-1 transition-transform"
//                     fill="none"
//                     stroke="currentColor"
//                     viewBox="0 0 24 24"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M13 7l5 5m0 0l-5 5m5-5H6"
//                     />
//                   </svg>
//                 </a>
//               ) : (
//                 <a
//                   href="/register"
//                   className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 !text-white rounded-xl font-semibold shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 flex items-center gap-2"
//                 >
//                   <svg
//                     className="w-5 h-5"
//                     fill="none"
//                     stroke="currentColor"
//                     viewBox="0 0 24 24"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
//                     />
//                   </svg>
//                   <span>Create New Profile</span>
//                   <svg
//                     className="w-5 h-5 group-hover:translate-x-1 transition-transform"
//                     fill="none"
//                     stroke="currentColor"
//                     viewBox="0 0 24 24"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M13 7l5 5m0 0l-5 5m5-5H6"
//                     />
//                   </svg>
//                 </a>
//               )}

//               <a
//                 href="/upload"
//                 className="px-8 py-4 bg-white text-gray-900 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 border-2 border-gray-200 hover:border-blue-300"
//               >
//                 Upload Your Project
//               </a>
//             </div>

//             {/* Stats */}
//             <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto pt-8">
//               <div className="text-center">
//                 <div className="text-3xl sm:text-4xl font-black text-gray-900">
//                   {stats.projects}+
//                 </div>
//                 <div className="text-sm sm:text-base text-gray-600 font-medium mt-1">
//                   Projects
//                 </div>
//               </div>
//               <div className="text-center">
//                 <div className="text-3xl sm:text-4xl font-black text-gray-900">
//                   {stats.users}+
//                 </div>
//                 <div className="text-sm sm:text-base text-gray-600 font-medium mt-1">
//                   Creators
//                 </div>
//               </div>
//               <div className="text-center">
//                 <div className="text-3xl sm:text-4xl font-black text-gray-900">
//                   50+
//                 </div>
//                 <div className="text-sm sm:text-base text-gray-600 font-medium mt-1">
//                   Views
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Bottom Wave */}
//         <div className="absolute bottom-0 left-0 right-0">
//           <svg
//             className="w-full h-20 sm:h-32"
//             viewBox="0 0 1440 120"
//             fill="none"
//             xmlns="http://www.w3.org/2000/svg"
//             preserveAspectRatio="none"
//           >
//             <path
//               d="M0 0L60 10C120 20 240 40 360 46.7C480 53 600 47 720 43.3C840 40 960 40 1080 46.7C1200 53 1320 67 1380 73.3L1440 80V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V0Z"
//               fill="white"
//             />
//           </svg>
//         </div>
//       </div>

//       <ToolsShowcase />

//       <div className="flex bg-gradient-to-t from-gray-100 to-white">
//         <CategorySidebar
//           categories={categories}
//           selectedCategory={selectedCategory}
//           setSelectedCategory={setSelectedCategory}
//           projects={projects}
//         />

//         <div className="flex-1 px-3 md:px-6 pb-12 md:pb-20">
//           <FilterBar
//             categories={categories}
//             selectedCategory={selectedCategory}
//             setSelectedCategory={setSelectedCategory}
//             sortBy={sortBy}
//             setSortBy={setSortBy}
//             dateRange={dateRange}
//             setDateRange={setDateRange}
//             projects={projects}
//             filteredProjects={filteredProjects}
//           />

//           {initialLoading ? (
//             <div className="flex flex-col items-center justify-center py-20 md:py-32">
//               <div className="relative">
//                 <div className="w-20 h-20 md:w-24 md:h-24 border-4 border-stone-200 rounded-full"></div>
//                 <div className="absolute top-0 left-0 w-20 h-20 md:w-24 md:h-24 border-4 border-t-blue-600 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
//                 <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
//                   <svg
//                     className="w-8 h-8 md:w-10 md:h-10 text-stone-700"
//                     fill="none"
//                     stroke="currentColor"
//                     viewBox="0 0 24 24"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
//                     />
//                   </svg>
//                 </div>
//               </div>
//               <p className="mt-6 text-stone-600 font-medium text-base md:text-lg">
//                 Loading Projects...
//               </p>
//               <p className="mt-2 text-stone-500 text-sm md:text-base">
//                 Please wait a moment
//               </p>
//             </div>
//           ) : filteredProjects.length > 0 ? (
//             <>
//               <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 md:gap-4 lg:gap-6 px-2 sm:px-4 md:px-8 lg:px-12">
//                 {visibleProjects.map((project) => (
//                   <ProjectCard key={project._id} project={project} />
//                 ))}
//               </div>

//               {hasMoreProjects && (
//                 <div className="flex flex-col items-center mt-8 md:mt-12">
//                   <p className="text-xs md:text-sm text-stone-500 mb-3">
//                     Showing {visibleProjects.length} of{" "}
//                     {filteredProjects.length} projects
//                   </p>
//                   <button
//                     onClick={handleSeeMore}
//                     disabled={loading}
//                     className="group flex items-center gap-2 bg-stone-800 hover:bg-stone-900 text-white px-6 md:px-8 py-3 md:py-4 rounded-lg font-semibold text-sm md:text-base transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed hover:-translate-y-1 animate-fadeInUp"
//                   >
//                     {loading ? (
//                       <>
//                         <svg
//                           className="animate-spin h-4 w-4 md:h-5 md:w-5 text-white"
//                           xmlns="http://www.w3.org/2000/svg"
//                           fill="none"
//                           viewBox="0 0 24 24"
//                         >
//                           <circle
//                             className="opacity-25"
//                             cx="12"
//                             cy="12"
//                             r="10"
//                             stroke="currentColor"
//                             strokeWidth="4"
//                           ></circle>
//                           <path
//                             className="opacity-75"
//                             fill="currentColor"
//                             d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//                           ></path>
//                         </svg>
//                         <span>Loading...</span>
//                       </>
//                     ) : (
//                       <>
//                         <span>See More</span>
//                         <span className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white px-2 py-0.5 rounded-sm text-xs font-bold">
//                           {remainingCount > 15 ? "15+" : remainingCount}
//                         </span>
//                         <svg
//                           className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-y-1 transition-transform"
//                           fill="none"
//                           stroke="currentColor"
//                           viewBox="0 0 24 24"
//                         >
//                           <path
//                             strokeLinecap="round"
//                             strokeLinejoin="round"
//                             strokeWidth={2}
//                             d="M19 14l-7 7m0 0l-7-7m7 7V3"
//                           />
//                         </svg>
//                       </>
//                     )}
//                   </button>
//                 </div>
//               )}

//               {!hasMoreProjects && filteredProjects.length > 15 && (
//                 <div className="flex flex-col items-center mt-8 md:mt-12">
//                   <div className="flex items-center gap-1 text-stone-500 text-sm md:text-base">
//                     <svg
//                       className="w-7 h-7 text-green-600 mb-3"
//                       fill="none"
//                       stroke="currentColor"
//                       viewBox="0 0 24 24"
//                     >
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         strokeWidth={1.5}
//                         fill="#000000"
//                         d="M18.9 8.1L9 18l-4.95-4.95l.71-.71L9 16.59l9.19-9.2l.71.71Z"
//                       />
//                     </svg>
//                     <span>All {filteredProjects.length} projects loaded</span>
//                   </div>
//                 </div>
//               )}
//             </>
//           ) : (
//             <div className="text-center py-12 md:py-20">
//               <div className="text-4xl md:text-6xl mb-3 md:mb-4">🔍</div>
//               <h3 className="text-lg md:text-xl font-semibold text-stone-800 mb-2">
//                 No Projects Found
//               </h3>
//               <p className="text-sm md:text-base text-stone-700">
//                 Try adjusting your filters or check back later
//               </p>
//             </div>
//           )}
//         </div>
//       </div>
//       <TestimonialSection />

//       <style>{`        
//         .animate-fadeInUp {
//           animation: fadeInUp 0.6s ease-out;
//         }
//       `}</style>
//     </div>
//   );
// }






























import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { API } from "../api/api";
import { useAuth } from "../context/AuthContext";
import ProjectCard from "../components/ProjectCard";
import CategorySidebar from "../components/CategorySidebar";
import FilterBar from "../components/FilterBar";
import ToolsShowcase from "../components/ToolsShowcase";
import TestimonialSection from "../components/TestimonialSection";

export default function Home() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("random");
  const [dateRange, setDateRange] = useState("all");

  const [visibleCount, setVisibleCount] = useState(15);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const shuffledProjectsRef = useRef(null);
  const lastSortRef = useRef("random");

  const categories = [
    "All",
    "3d",
    "Art",
    "Branding",
    "Web Development",
    "Game Development",
    "Graphics Design",
    "Mobile Apps",
    "Music",
    "Photography",
    "Video Production",
    "Writing",
  ];

  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const getLikesCount = (project) => {
    if (!project.likes) return 0;
    if (Array.isArray(project.likes)) return project.likes.length;
    if (typeof project.likes === 'number') return project.likes;
    return 0;
  };

  useEffect(() => {
    setInitialLoading(true);
    API.get("/projects")
      .then((res) => {
        console.log("Sample project likes:", res.data[0]?.likes);
        
        // 🔥 FILTER: Only show APPROVED projects to all users on home page
        const approvedProjects = res.data.filter(project => 
          project.isApproved === true || project.approvalStatus === "approved"
        );
        
        setProjects(approvedProjects);
        setInitialLoading(false);
      })
      .catch((err) => {
        console.error("❌ Error fetching projects:", err);
        setInitialLoading(false);
      });
  }, []);

  useEffect(() => {
    if (projects.length > 0 && sortBy === "random") {
      if (!shuffledProjectsRef.current || lastSortRef.current !== "random") {
        shuffledProjectsRef.current = shuffleArray(projects);
      }
    }
    lastSortRef.current = sortBy;
  }, [projects, sortBy]);

  useEffect(() => {
    if (projects.length === 0) return;

    let filtered = [...projects];

    if (sortBy === "random" && shuffledProjectsRef.current) {
      filtered = [...shuffledProjectsRef.current];
    }

    if (selectedCategory !== "All") {
      filtered = filtered.filter((p) =>
        p.category.startsWith(selectedCategory)
      );
    }

    if (dateRange !== "all") {
      const now = new Date();
      const filterDate = new Date();

      switch (dateRange) {
        case "week":
          filterDate.setDate(now.getDate() - 7);
          break;
        case "month":
          filterDate.setMonth(now.getMonth() - 1);
          break;
        case "3months":
          filterDate.setMonth(now.getMonth() - 3);
          break;
        case "4months":
          filterDate.setMonth(now.getMonth() - 4);
          break;
        case "6months":
          filterDate.setMonth(now.getMonth() - 6);
          break;
        case "year":
          filterDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      filtered = filtered.filter((p) => new Date(p.createdAt) >= filterDate);
    }

    if (sortBy !== "random") {
      switch (sortBy) {
        case "latest":
          filtered.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          );
          break;
        case "oldest":
          filtered.sort(
            (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
          );
          break;
        case "likes-high":
          filtered.sort((a, b) => {
            const aLikes = getLikesCount(a);
            const bLikes = getLikesCount(b);
            console.log(`Comparing: ${a.title} (${aLikes} likes) vs ${b.title} (${bLikes} likes)`);
            return bLikes - aLikes;
          });
          break;
        case "likes-low":
          filtered.sort((a, b) => {
            const aLikes = getLikesCount(a);
            const bLikes = getLikesCount(b);
            return aLikes - bLikes;
          });
          break;
        case "views-high":
          filtered.sort((a, b) => (b.views || 0) - (a.views || 0));
          break;
        case "views-low":
          filtered.sort((a, b) => (a.views || 0) - (b.views || 0));
          break;
        default:
          break;
      }
    }

    console.log("Filtered projects after sorting:", filtered.slice(0, 3).map(p => ({
      title: p.title,
      likes: getLikesCount(p)
    })));

    setFilteredProjects(filtered);
    setVisibleCount(15);
  }, [projects, selectedCategory, sortBy, dateRange]);

  const handleSeeMore = () => {
    setLoading(true);
    setTimeout(() => {
      setVisibleCount((prev) => prev + 15);
      setLoading(false);
    }, 500);
  };

  const currentYear = new Date().getFullYear();

  const [stats, setStats] = useState({
    projects: 0,
    users: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [projectsRes, usersRes] = await Promise.all([
        API.get("/projects"),
        API.get("/users/all"),
      ]);

      // 🔥 Count only approved projects in stats
      const approvedCount = projectsRes.data.filter(p => 
        p.isApproved === true || p.approvalStatus === "approved"
      ).length;

      setStats({
        projects: approvedCount || 0,
        users: usersRes.data.length || 0,
      });
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  const visibleProjects = filteredProjects.slice(0, visibleCount);
  const hasMoreProjects = visibleCount < filteredProjects.length;
  const remainingCount = filteredProjects.length - visibleCount;

  return (
    <div className="mb-20">
      {/* Header Section */}
      <div className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-200/30 !rounded-sm blur-3xl"></div>
          <div className="absolute top-1/2 -right-32 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl"></div>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLW9wYWNpdHk9IjAuMDMiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-40"></div>
        </div>

        {/* Content Container */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 md:py-36 lg:py-30">
          <div className="text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg border border-gray-200">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              <span className="text-sm font-semibold text-gray-700">
                MCT's Portfolio
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-gray-900 leading-tight">
              Discover Amazing
              <span className="block bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Creative Projects
              </span>
            </h1>

            <p className="text-lg sm:text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Explore a diverse collection of projects across various
              categories.
              <br className="hidden sm:block" />
              Find inspiration, collaborate, and showcase your own work.
            </p>

            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full shadow-xl font-medium text-sm">
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
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
              <span>Multimedia and Creative Technology</span>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              {user ? (
                <a
                  href="/profile"
                  className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 !text-white rounded-xl font-semibold shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 flex items-center gap-2"
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
                  <span>Visit Your Profile</span>
                  <svg
                    className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </a>
              ) : (
                <a
                  href="/register"
                  className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 !text-white rounded-xl font-semibold shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 flex items-center gap-2"
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
                      d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                    />
                  </svg>
                  <span>Create New Profile</span>
                  <svg
                    className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </a>
              )}

              <a
                href="/upload"
                className="px-8 py-4 bg-white text-gray-900 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 border-2 border-gray-200 hover:border-blue-300"
              >
                Upload Your Project
              </a>
            </div>

            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto pt-8">
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-black text-gray-900">
                  {stats.projects}+
                </div>
                <div className="text-sm sm:text-base text-gray-600 font-medium mt-1">
                  Projects
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-black text-gray-900">
                  {stats.users}+
                </div>
                <div className="text-sm sm:text-base text-gray-600 font-medium mt-1">
                  Creators
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-black text-gray-900">
                  50+
                </div>
                <div className="text-sm sm:text-base text-gray-600 font-medium mt-1">
                  Views
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg
            className="w-full h-20 sm:h-32"
            viewBox="0 0 1440 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
          >
            <path
              d="M0 0L60 10C120 20 240 40 360 46.7C480 53 600 47 720 43.3C840 40 960 40 1080 46.7C1200 53 1320 67 1380 73.3L1440 80V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V0Z"
              fill="white"
            />
          </svg>
        </div>
      </div>

      <ToolsShowcase />

      <div className="flex bg-gradient-to-t from-gray-100 to-white">
        <CategorySidebar
          categories={categories}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          projects={projects}
        />

        <div className="flex-1 px-3 md:px-6 pb-12 md:pb-20">
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

          {initialLoading ? (
            <div className="flex flex-col items-center justify-center py-20 md:py-32">
              <div className="relative">
                <div className="w-20 h-20 md:w-24 md:h-24 border-4 border-stone-200 rounded-full"></div>
                <div className="absolute top-0 left-0 w-20 h-20 md:w-24 md:h-24 border-4 border-t-blue-600 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <svg
                    className="w-8 h-8 md:w-10 md:h-10 text-stone-700"
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
              </div>
              <p className="mt-6 text-stone-600 font-medium text-base md:text-lg">
                Loading Projects...
              </p>
              <p className="mt-2 text-stone-500 text-sm md:text-base">
                Please wait a moment
              </p>
            </div>
          ) : filteredProjects.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 md:gap-4 lg:gap-6 px-2 sm:px-4 md:px-8 lg:px-12">
                {visibleProjects.map((project) => (
                  <ProjectCard key={project._id} project={project} />
                ))}
              </div>

              {hasMoreProjects && (
                <div className="flex flex-col items-center mt-8 md:mt-12">
                  <p className="text-xs md:text-sm text-stone-500 mb-3">
                    Showing {visibleProjects.length} of{" "}
                    {filteredProjects.length} projects
                  </p>
                  <button
                    onClick={handleSeeMore}
                    disabled={loading}
                    className="group flex items-center gap-2 bg-stone-800 hover:bg-stone-900 text-white px-6 md:px-8 py-3 md:py-4 rounded-lg font-semibold text-sm md:text-base transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed hover:-translate-y-1 animate-fadeInUp"
                  >
                    {loading ? (
                      <>
                        <svg
                          className="animate-spin h-4 w-4 md:h-5 md:w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
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
                        <span>Loading...</span>
                      </>
                    ) : (
                      <>
                        <span>See More</span>
                        <span className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white px-2 py-0.5 rounded-sm text-xs font-bold">
                          {remainingCount > 15 ? "15+" : remainingCount}
                        </span>
                        <svg
                          className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-y-1 transition-transform"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 14l-7 7m0 0l-7-7m7 7V3"
                          />
                        </svg>
                      </>
                    )}
                  </button>
                </div>
              )}

              {!hasMoreProjects && filteredProjects.length > 15 && (
                <div className="flex flex-col items-center mt-8 md:mt-12">
                  <div className="flex items-center gap-1 text-stone-500 text-sm md:text-base">
                    <svg
                      className="w-7 h-7 text-green-600 mb-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        fill="#000000"
                        d="M18.9 8.1L9 18l-4.95-4.95l.71-.71L9 16.59l9.19-9.2l.71.71Z"
                      />
                    </svg>
                    <span>All {filteredProjects.length} projects loaded</span>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 md:py-20">
              <div className="text-4xl md:text-6xl mb-3 md:mb-4">🔍</div>
              <h3 className="text-lg md:text-xl font-semibold text-stone-800 mb-2">
                No Projects Found
              </h3>
              <p className="text-sm md:text-base text-stone-700">
                Try adjusting your filters or check back later
              </p>
            </div>
          )}
        </div>
      </div>
      <TestimonialSection />

      <style>{`        
        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out;
        }
      `}</style>
    </div>
  );
}