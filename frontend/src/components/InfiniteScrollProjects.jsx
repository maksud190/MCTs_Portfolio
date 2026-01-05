import { useState, useEffect, useCallback } from "react";
import { useInView } from "react-intersection-observer";
import { API } from "../api/api";
import ProjectCard from "./ProjectCard";
import SkeletonCard from "./SkeletonCard";

export default function InfiniteScrollProjects({ 
  category = "All", 
  sortBy = "random", 
  dateRange = "all",
  tags = ""
}) {
  const [projects, setProjects] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const { ref, inView } = useInView({
    threshold: 0,
  });

  // Reset when filters change
  useEffect(() => {
    setProjects([]);
    setPage(1);
    setHasMore(true);
    setInitialLoading(true);
    fetchProjects(1, true);
  }, [category, sortBy, dateRange, tags]);

  // Load more when scrolling
  useEffect(() => {
    if (inView && hasMore && !loading && !initialLoading) {
      fetchProjects(page);
    }
  }, [inView, hasMore, loading, initialLoading]);

  const fetchProjects = async (currentPage, isReset = false) => {
    if (loading) return;
    
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: 12,
        category,
        sortBy,
        dateRange,
      });

      if (tags) {
        params.append('tags', tags);
      }

      const res = await API.get(`/projects/paginated/projects?${params}`);
      
      if (isReset) {
        setProjects(res.data.projects);
      } else {
        setProjects(prev => [...prev, ...res.data.projects]);
      }
      
      setHasMore(res.data.hasMore);
      setPage(currentPage + 1);
    } catch (err) {
      console.error("Fetch projects error:", err);
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  // Shuffle for random sort (client-side)
  const displayProjects = sortBy === 'random' 
    ? [...projects].sort(() => Math.random() - 0.5)
    : projects;

  return (
    <div>
      {/* Projects Grid */}
      {displayProjects.length > 0 ? (
        <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4">
          {displayProjects.map((project) => (
            <div key={project._id} className="break-inside-avoid mb-4">
              <ProjectCard project={project} />
            </div>
          ))}
        </div>
      ) : initialLoading ? (
        // Initial Loading Skeletons
        <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4">
          {[...Array(8)].map((_, idx) => (
            <div key={idx} className="break-inside-avoid mb-4">
              <SkeletonCard />
            </div>
          ))}
        </div>
      ) : (
        // No Projects Found
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No Projects Found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Try adjusting your filters
          </p>
        </div>
      )}

      {/* Loading More Indicator */}
      {loading && !initialLoading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-400"></div>
        </div>
      )}

      {/* Infinite Scroll Trigger */}
      {hasMore && !initialLoading && (
        <div ref={ref} className="h-10"></div>
      )}

      {/* End of Results */}
      {!hasMore && projects.length > 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p>You've reached the end! 🎉</p>
        </div>
      )}
    </div>
  );
}