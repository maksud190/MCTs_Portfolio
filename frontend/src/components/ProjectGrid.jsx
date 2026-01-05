import ProjectCard from "./ProjectCard";

export default function ProjectGrid({ 
  filteredProjects, 
  selectedCategory,
  clearFilters 
}) {
  // 🔥 যদি projects থাকে
  if (filteredProjects.length > 0) {
    return (
      <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-5 gap-4">
        {filteredProjects.map((p) => (
          <div key={p._id} className="break-inside-avoid mb-4">
            <ProjectCard project={p} />
          </div>
        ))}
      </div>
    );
  }

  // 🔥 Empty state - যদি projects না থাকে
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="text-6xl mb-4">📭</div>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        No projects found
      </h3>
      <p className="text-gray-600 dark:text-gray-400 text-center max-w-md mb-4">
        {selectedCategory !== "All"
          ? `No projects in "${selectedCategory}" category with the selected filters.`
          : "No projects match your selected filters."}
      </p>
      <button
        onClick={clearFilters}
        className="px-6 py-2 bg-blue-500 text-white hover:bg-blue-600 transition-colors"
      >
        Clear Filters
      </button>
    </div>
  );
}