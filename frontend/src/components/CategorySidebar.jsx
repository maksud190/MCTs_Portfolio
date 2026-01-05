import { useState, useEffect } from "react";
import { API } from "../api/api";

export default function CategorySidebar({ selectedCategory, setSelectedCategory, projects }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await API.get("/categories");
      setCategories(res.data);
    } catch (err) {
      console.error("Error fetching categories:", err);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryCount = (categoryName) => {
    if (categoryName === "All") return projects.length;
    return projects.filter((p) => p.category.startsWith(categoryName)).length;
  };

  return (
    <aside className="hidden lg:block w-64 xl:w-72 px-6 sticky top-20 h-[calc(100vh)] overflow-y-auto">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          Categories
        </h3>
        <p className="text-sm text-gray-500">
          Filter projects by category
        </p>
      </div>

      {/* Category List */}
      {loading ? (
        <div className="space-y-2">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-12 bg-gray-200 rounded-xl"></div>
            </div>
          ))}
        </div>
      ) : (
        <ul className="space-y-2">
          {/* All Category */}
          <li>
            <button
              onClick={() => setSelectedCategory("All")}
              className={`group w-full text-left px-4 py-3 rounded-xl transition-all duration-300 flex items-center justify-between ${
                selectedCategory === "All"
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg scale-105"
                  : "bg-white text-gray-700 hover:bg-blue-50 hover:shadow-md hover:scale-102 border border-gray-200"
              }`}
            >
              <span className={`font-semibold text-sm xl:text-base flex items-center gap-2 ${
                selectedCategory === "All" ? "text-white" : "text-gray-900"
              }`}>
                
                All
              </span>
              
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                selectedCategory === "All"
                  ? "bg-white/20 text-white"
                  : "bg-blue-100 text-blue-600 group-hover:bg-blue-200"
              }`}>
                {getCategoryCount("All")}
              </span>
            </button>
          </li>

          {/* Dynamic Categories */}
          {categories.map((cat) => {
            const count = getCategoryCount(cat.name);
            const isActive = selectedCategory === cat.name;

            return (
              <li key={cat._id}>
                <button
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`group w-full text-left px-4 py-3 rounded-xl transition-all duration-300 flex items-center justify-between ${
                    isActive
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg scale-105"
                      : "bg-white text-gray-700 hover:bg-blue-50 hover:shadow-md hover:scale-102 border border-gray-200"
                  }`}
                >
                  <span className={`font-semibold text-sm xl:text-base flex items-center gap-2 ${
                    isActive ? "text-white" : "text-gray-900"
                  }`}>
                    <span>{cat.icon}</span>
                    {cat.name}
                  </span>
                  
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-blue-100 text-blue-600 group-hover:bg-blue-200"
                  }`}>
                    {count}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {/* Bottom Info */}
      <div className="mt-8 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
        <div className="flex items-center gap-2 mb-2">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h4 className="font-semibold text-gray-900 text-sm">
            Quick Tip
          </h4>
        </div>
        <p className="text-xs text-gray-600 leading-relaxed">
          Browse different categories to discover amazing creative projects from MCT students
        </p>
      </div>
    </aside>
  );
}