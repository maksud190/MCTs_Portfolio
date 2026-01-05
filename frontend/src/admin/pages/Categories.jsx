// import { useState, useEffect } from 'react';
// import { API } from '../../api/api';
// import { toast } from 'sonner';

// export default function Categories() {
//   const [categories, setCategories] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [showModal, setShowModal] = useState(false);
//   const [editingCategory, setEditingCategory] = useState(null);
//   const [form, setForm] = useState({
//     name: '',
//     icon: '📁',
//     subcategories: '',
//     isActive: true
//   });

//   useEffect(() => {
//     fetchCategories();
//   }, []);

//   const fetchCategories = async () => {
//     try {
//       setLoading(true);
//       const token = localStorage.getItem('token');
//       const res = await API.get('/admin/categories', {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       setCategories(res.data);
//     } catch (err) {
//       console.error('Error fetching categories:', err);
//       toast.error('Failed to load categories');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!form.name.trim()) {
//       toast.error('Category name is required');
//       return;
//     }

//     try {
//       const token = localStorage.getItem('token');
//       const data = {
//         ...form,
//         subcategories: form.subcategories.split(',').map(s => s.trim()).filter(s => s)
//       };

//       if (editingCategory) {
//         await API.put(`/admin/categories/${editingCategory._id}`, data, {
//           headers: { Authorization: `Bearer ${token}` }
//         });
//         toast.success('Category updated successfully');
//       } else {
//         await API.post('/admin/categories', data, {
//           headers: { Authorization: `Bearer ${token}` }
//         });
//         toast.success('Category created successfully');
//       }

//       setShowModal(false);
//       setEditingCategory(null);
//       setForm({ name: '', icon: '📁', subcategories: '', isActive: true });
//       fetchCategories();
//     } catch (err) {
//       console.error('Error saving category:', err);
//       toast.error(err.response?.data?.message || 'Failed to save category');
//     }
//   };

//   const handleEdit = (category) => {
//     setEditingCategory(category);
//     setForm({
//       name: category.name,
//       icon: category.icon,
//       subcategories: category.subcategories?.join(', ') || '',
//       isActive: category.isActive
//     });
//     setShowModal(true);
//   };

//   const handleDelete = async (categoryId, name) => {
//     if (!window.confirm(`⚠️ Delete category "${name}"?\n\nThis action cannot be undone.`)) return;

//     try {
//       const token = localStorage.getItem('token');
//       await API.delete(`/admin/categories/${categoryId}`, {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       toast.success('Category deleted successfully');
//       fetchCategories();
//     } catch (err) {
//       console.error('Error deleting category:', err);
//       toast.error('Failed to delete category');
//     }
//   };

//   const resetForm = () => {
//     setForm({ name: '', icon: '📁', subcategories: '', isActive: true });
//     setEditingCategory(null);
//     setShowModal(false);
//   };

//   const commonIcons = ['📁', '🎨', '💻', '📸', '🎬', '🎮', '🎵', '✍️', '🎲', '📱', '🌐', '🎯'];

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
//         <div>
//           <h1 className="!text-3xl md:text-3xl font-bold text-stone-800 dark:text-stone-100">
//             Categories Management
//           </h1>
//           <p className="text-stone-600 dark:text-stone-400 mt-0 font-medium">
//             Manage project categories and subcategories
//           </p>
//         </div>
//         <button
//           onClick={() => setShowModal(true)}
//           className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
//         >
//           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
//           </svg>
//           Add Category
//         </button>
//       </div>

//       {/* Categories Grid */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//         {loading ? (
//           [...Array(6)].map((_, i) => (
//             <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 animate-pulse">
//               <div className="flex items-center gap-3 mb-4">
//                 <div className="w-12 h-12 bg-gray-300 dark:bg-gray-700 rounded-lg"></div>
//                 <div className="flex-1">
//                   <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
//                   <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
//                 </div>
//               </div>
//             </div>
//           ))
//         ) : categories.length === 0 ? (
//           <div className="col-span-full bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
//             <p className="text-gray-500 dark:text-gray-400">No categories yet</p>
//           </div>
//         ) : (
//           categories.map((category) => (
//             <div
//               key={category._id}
//               className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow p-6"
//             >
//               <div className="flex items-start justify-between mb-4">
//                 <div className="flex items-center gap-3">
//                   <div className="text-4xl">{category.icon}</div>
//                   <div>
//                     <h3 className="font-bold text-gray-900 dark:text-white">
//                       {category.name}
//                     </h3>
//                     <p className="text-sm text-gray-500 dark:text-gray-400">
//                       {category.projectCount || 0} projects
//                     </p>
//                   </div>
//                 </div>
//                 <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
//                   category.isActive
//                     ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
//                     : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
//                 }`}>
//                   {category.isActive ? 'Active' : 'Inactive'}
//                 </span>
//               </div>

//               {category.subcategories && category.subcategories.length > 0 && (
//                 <div className="mb-4">
//                   <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
//                     Subcategories:
//                   </p>
//                   <div className="flex flex-wrap gap-2">
//                     {category.subcategories.map((sub, idx) => (
//                       <span
//                         key={idx}
//                         className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs"
//                       >
//                         {sub}
//                       </span>
//                     ))}
//                   </div>
//                 </div>
//               )}

//               <div className="flex gap-2">
//                 <button
//                   onClick={() => handleEdit(category)}
//                   className="flex-1 px-3 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 rounded-lg text-sm font-medium transition-colors"
//                 >
//                   Edit
//                 </button>
//                 <button
//                   onClick={() => handleDelete(category._id, category.name)}
//                   className="flex-1 px-3 py-2 bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 rounded-lg text-sm font-medium transition-colors"
//                 >
//                   Delete
//                 </button>
//               </div>
//             </div>
//           ))
//         )}
//       </div>

//       {/* Modal */}
//       {showModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
//             <div className="flex items-center justify-between mb-6">
//               <h2 className="text-xl font-bold text-gray-900 dark:text-white">
//                 {editingCategory ? 'Edit Category' : 'Add Category'}
//               </h2>
//               <button
//                 onClick={resetForm}
//                 className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
//               >
//                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                 </svg>
//               </button>
//             </div>

//             <form onSubmit={handleSubmit} className="space-y-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                   Category Name *
//                 </label>
//                 <input
//                   type="text"
//                   value={form.name}
//                   onChange={(e) => setForm({ ...form, name: e.target.value })}
//                   className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
//                   placeholder="e.g., Web Development"
//                   required
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                   Icon
//                 </label>
//                 <div className="flex flex-wrap gap-2 mb-2">
//                   {commonIcons.map((icon) => (
//                     <button
//                       key={icon}
//                       type="button"
//                       onClick={() => setForm({ ...form, icon })}
//                       className={`text-2xl p-2 rounded-lg transition-colors ${
//                         form.icon === icon
//                           ? 'bg-blue-100 dark:bg-blue-900/30'
//                           : 'hover:bg-gray-100 dark:hover:bg-gray-700'
//                       }`}
//                     >
//                       {icon}
//                     </button>
//                   ))}
//                 </div>
//                 <input
//                   type="text"
//                   value={form.icon}
//                   onChange={(e) => setForm({ ...form, icon: e.target.value })}
//                   className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
//                   placeholder="Or enter custom emoji"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                   Subcategories (comma-separated)
//                 </label>
//                 <textarea
//                   value={form.subcategories}
//                   onChange={(e) => setForm({ ...form, subcategories: e.target.value })}
//                   className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
//                   rows="3"
//                   placeholder="e.g., Frontend, Backend, Full Stack"
//                 />
//               </div>

//               <div className="flex items-center gap-3">
//                 <input
//                   type="checkbox"
//                   id="isActive"
//                   checked={form.isActive}
//                   onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
//                   className="w-4 h-4 text-blue-600 rounded"
//                 />
//                 <label htmlFor="isActive" className="text-sm text-gray-700 dark:text-gray-300">
//                   Active (visible to users)
//                 </label>
//               </div>

//               <div className="flex gap-3 pt-4">
//                 <button
//                   type="button"
//                   onClick={resetForm}
//                   className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
//                 >
//                   {editingCategory ? 'Update' : 'Create'}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }


























import { useState, useEffect } from 'react';
import { API } from '../../api/api';
import { toast } from 'sonner';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [form, setForm] = useState({
    name: '',
    icon: '📁',
    subcategories: '',
    isActive: true
  });

  useEffect(() => {
    fetchCategoriesWithCount();
  }, []);

  // ✅ Updated function - এখানে projects fetch করে count করা হয়েছে
  const fetchCategoriesWithCount = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Fetch both categories and projects
      const [categoriesRes, projectsRes] = await Promise.all([
        API.get('/admin/categories', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        API.get('/projects') // Public route, no token needed
      ]);
      
      const fetchedCategories = categoriesRes.data;
      const allProjects = projectsRes.data;
      
      // Count projects for each category
      const categoriesWithCount = fetchedCategories.map(category => {
        const projectCount = allProjects.filter(project => 
          project.category.toLowerCase().startsWith(category.name.toLowerCase())
        ).length;
        
        return {
          ...category,
          projectCount
        };
      });
      
      setCategories(categoriesWithCount);
    } catch (err) {
      console.error('Error fetching categories:', err);
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      toast.error('Category name is required');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const data = {
        ...form,
        subcategories: form.subcategories.split(',').map(s => s.trim()).filter(s => s)
      };

      if (editingCategory) {
        await API.put(`/admin/categories/${editingCategory._id}`, data, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Category updated successfully');
      } else {
        await API.post('/admin/categories', data, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Category created successfully');
      }

      setShowModal(false);
      setEditingCategory(null);
      setForm({ name: '', icon: '📁', subcategories: '', isActive: true });
      fetchCategoriesWithCount(); // ✅ Updated function call
    } catch (err) {
      console.error('Error saving category:', err);
      toast.error(err.response?.data?.message || 'Failed to save category');
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setForm({
      name: category.name,
      icon: category.icon,
      subcategories: category.subcategories?.join(', ') || '',
      isActive: category.isActive
    });
    setShowModal(true);
  };

  const handleDelete = async (categoryId, name) => {
    if (!window.confirm(`⚠️ Delete category "${name}"?\n\nThis action cannot be undone.`)) return;

    try {
      const token = localStorage.getItem('token');
      await API.delete(`/admin/categories/${categoryId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Category deleted successfully');
      fetchCategoriesWithCount(); // ✅ Updated function call
    } catch (err) {
      console.error('Error deleting category:', err);
      toast.error('Failed to delete category');
    }
  };

  const resetForm = () => {
    setForm({ name: '', icon: '📁', subcategories: '', isActive: true });
    setEditingCategory(null);
    setShowModal(false);
  };

  const commonIcons = ['📁', '🎨', '💻', '📸', '🎬', '🎮', '🎵', '✍️', '🎲', '📱', '🌐', '🎯'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="!text-3xl md:text-3xl font-bold text-stone-800 dark:text-stone-100">
            Categories Management
          </h1>
          <p className="text-stone-600 dark:text-stone-400 mt-0 font-medium">
            Manage project categories and subcategories
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Category
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [...Array(6)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 animate-pulse">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gray-300 dark:bg-gray-700 rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))
        ) : categories.length === 0 ? (
          <div className="col-span-full bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
            <p className="text-gray-500 dark:text-gray-400">No categories yet</p>
          </div>
        ) : (
          categories.map((category) => (
            <div
              key={category._id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="text-4xl">{category.icon}</div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">
                      {category.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {category.projectCount || 0} projects
                    </p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  category.isActive
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                }`}>
                  {category.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              {category.subcategories && category.subcategories.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
                    Subcategories:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {category.subcategories.map((sub, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs"
                      >
                        {sub}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(category)}
                  className="flex-1 px-3 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 rounded-lg text-sm font-medium transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(category._id, category.name)}
                  className="flex-1 px-3 py-2 bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 rounded-lg text-sm font-medium transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingCategory ? 'Edit Category' : 'Add Category'}
              </h2>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category Name *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="e.g., Web Development"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Icon
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {commonIcons.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setForm({ ...form, icon })}
                      className={`text-2xl p-2 rounded-lg transition-colors ${
                        form.icon === icon
                          ? 'bg-blue-100 dark:bg-blue-900/30'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={form.icon}
                  onChange={(e) => setForm({ ...form, icon: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Or enter custom emoji"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Subcategories (comma-separated)
                </label>
                <textarea
                  value={form.subcategories}
                  onChange={(e) => setForm({ ...form, subcategories: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows="3"
                  placeholder="e.g., Frontend, Backend, Full Stack"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <label htmlFor="isActive" className="text-sm text-gray-700 dark:text-gray-300">
                  Active (visible to users)
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  {editingCategory ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
