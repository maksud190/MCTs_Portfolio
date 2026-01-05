// import { useState, useEffect } from "react";
// import { API } from "../api/api";
// import { useAuth } from "../context/AuthContext";
// import { useNavigate, useParams } from "react-router-dom";
// import TagsInput from "../components/TagsInput";
// import { toast } from 'sonner';

// export default function EditProject() {
//   const { projectId } = useParams();
//   const [data, setData] = useState({
//     title: "",
//     description: "",
//     category: "",
//     subcategory: "",
//   });
//   const [currentThumbnail, setCurrentThumbnail] = useState(null);
//   const [existingImages, setExistingImages] = useState([]);
//   const [newThumbnail, setNewThumbnail] = useState(null);
//   const [newThumbnailPreview, setNewThumbnailPreview] = useState(null);
//   const [newFiles, setNewFiles] = useState([]);
//   const [newPreviews, setNewPreviews] = useState([]);
//   const [tags, setTags] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [fetchLoading, setFetchLoading] = useState(true);
  
//   const { user } = useAuth();
//   const navigate = useNavigate();

//   const categories = {
//     "3d": ["Character Modeling", "Environment Modeling", "Product Visualization", "Architectural Visualization", "3D Animation"],
//     "Art": ["Digital Art", "Traditional Art", "3D Modeling", "Character Design", "Concept Art"],
//     "Branding": ["Brand Strategy", "Visual Identity", "Brand Guidelines", "Rebranding", "Brand Messaging"],
//     "Web Development": ["Frontend", "Backend", "Full Stack", "UI/UX Design", "E-commerce"],
//     "Game Development": ["2D Games", "3D Games", "Unity", "Unreal Engine", "Mobile Games"],
//     "Graphics Design": ["Logo Design", "Branding", "Illustration", "Print Design", "Social Media"],
//     "Mobile Apps": ["Android", "iOS", "React Native", "Flutter", "Cross-platform"],
//     "Music": ["Production", "Composition", "Sound Design", "Mixing", "Cover Songs"],
//     "Photography": ["Portrait", "Landscape", "Product", "Wildlife", "Fashion"],
//     "Video Production": ["Animation", "Video Editing", "Motion Graphics", "Documentary", "Commercial"],
//     "Writing": ["Blog Posts", "Copywriting", "Technical Writing", "Creative Writing", "Content Strategy"],
//   };

//   useEffect(() => {
//     API.get(`/projects/${projectId}`)
//       .then((res) => {
//         const project = res.data;
        
//         if (project.userId._id !== user._id) {
//           alert("You can only edit your own projects!");
//           navigate("/profile");
//           return;
//         }

//         const [mainCat, subCat] = project.category.split(" - ");
        
//         setData({
//           title: project.title,
//           description: project.description,
//           category: mainCat || "",
//           subcategory: subCat || "",
//         });
        
//         if (project.tags) {
//           setTags(project.tags);
//         }
        
//         if (project.images && project.images.length > 0) {
//           setCurrentThumbnail(project.images[0]);
//           setExistingImages(project.images.slice(1));
//         }
        
//         setFetchLoading(false);
//       })
//       .catch((err) => {
//         console.error("Error fetching project:", err);
//         alert("Failed to load project");
//         navigate("/profile");
//       });
//   }, [projectId, user._id, navigate]);

//   const removeCurrentThumbnail = () => {
//     if (!newThumbnail && existingImages.length === 0 && newFiles.length === 0) {
//       alert("Project must have at least one image. Please add a new thumbnail before removing this one.");
//       return;
//     }

//     if (!newThumbnail) {
//       alert("Please upload a new thumbnail before removing the current one.");
//       return;
//     }

//     if (window.confirm("Remove current thumbnail? You have selected a new thumbnail to replace it.")) {
//       setCurrentThumbnail(null);
//     }
//   };

//   const removeExistingImage = (index) => {
//     if (!currentThumbnail && !newThumbnail && existingImages.length === 1 && newFiles.length === 0) {
//       alert("Project must have at least one image.");
//       return;
//     }

//     if (window.confirm("Remove this image?")) {
//       setExistingImages(existingImages.filter((_, i) => i !== index));
//     }
//   };

//   const handleThumbnailChange = (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     if (!file.type.startsWith('image/')) {
//       alert("Please select an image file");
//       return;
//     }
    
//     if (file.size > 5 * 1024 * 1024) {
//       alert("Image size should be less than 5MB");
//       return;
//     }

//     setNewThumbnail(file);
    
//     const reader = new FileReader();
//     reader.onloadend = () => {
//       setNewThumbnailPreview(reader.result);
//     };
//     reader.readAsDataURL(file);
//   };

//   const removeNewThumbnail = () => {
//     if (!currentThumbnail && existingImages.length === 0 && newFiles.length === 0) {
//       alert("Project must have at least one image");
//       return;
//     }
//     setNewThumbnail(null);
//     setNewThumbnailPreview(null);
//   };

//   const handleFileChange = (e) => {
//     const files = Array.from(e.target.files);
//     if (files.length === 0) return;

//     const thumbnailCount = (currentThumbnail ? 1 : 0) + (newThumbnail ? 1 : 0);
//     const totalImages = thumbnailCount + existingImages.length + newFiles.length + files.length;
    
//     if (totalImages > 5) {
//       alert(`Maximum 5 images allowed. Current total: ${thumbnailCount + existingImages.length + newFiles.length}`);
//       return;
//     }

//     const validFiles = [];
//     const previews = [];

//     files.forEach((file) => {
//       if (!file.type.startsWith('image/')) {
//         alert(`${file.name} is not an image`);
//         return;
//       }
      
//       if (file.size > 5 * 1024 * 1024) {
//         alert(`${file.name} is too large`);
//         return;
//       }

//       validFiles.push(file);
      
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         previews.push(reader.result);
//         if (previews.length === validFiles.length) {
//           setNewPreviews([...newPreviews, ...previews]);
//         }
//       };
//       reader.readAsDataURL(file);
//     });

//     setNewFiles([...newFiles, ...validFiles]);
//   };

//   const removeNewFile = (index) => {
//     const thumbnailCount = (currentThumbnail ? 1 : 0) + (newThumbnail ? 1 : 0);
//     if (thumbnailCount === 0 && existingImages.length === 0 && newFiles.length === 1) {
//       alert("Project must have at least one image");
//       return;
//     }
//     setNewFiles(newFiles.filter((_, i) => i !== index));
//     setNewPreviews(newPreviews.filter((_, i) => i !== index));
//   };

//   const handleCategoryChange = (e) => {
//     setData({ ...data, category: e.target.value, subcategory: "" });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     if (!data.title || !data.description || !data.category || !data.subcategory) {
//       alert("Please fill all fields");
//       return;
//     }

//     if (!currentThumbnail && !newThumbnail) {
//       alert("Thumbnail is required. Please upload a thumbnail.");
//       return;
//     }

//     setLoading(true);

//     try {
//       const form = new FormData();
//       form.append("title", data.title);
//       form.append("description", data.description);
//       form.append("category", `${data.category} - ${data.subcategory}`);
      
//       if (tags.length > 0) {
//         form.append("tags", JSON.stringify(tags));
//       }
      
//       form.append("currentThumbnail", currentThumbnail || "");
//       form.append("existingImages", JSON.stringify(existingImages));
      
//       if (newThumbnail) {
//         form.append("newThumbnail", newThumbnail);
//       }
      
//       newFiles.forEach((file) => {
//         form.append("files", file);
//       });

//       console.log("Update data:", {
//         currentThumbnail: !!currentThumbnail,
//         newThumbnail: !!newThumbnail,
//         existingImages: existingImages.length,
//         newFiles: newFiles.length
//       });

//       const token = localStorage.getItem("token");
      
//       if (!token) {
//         alert("Please login again");
//         navigate("/login");
//         return;
//       }

//       await API.put(`/projects/${projectId}`, form, {
//         headers: {
//           'Content-Type': 'multipart/form-data',
//           Authorization: `Bearer ${token}`
//         }
//       });

//       toast.success("✅ Project updated successfully!");
//       navigate("/profile");
      
//     } catch (err) {
//       console.error("Update error:", err);
//       toast.error("❌ " + (err.response?.data?.message || "Update failed"));
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (fetchLoading) {
//     return (
//       <div className="flex justify-center items-center min-h-screen">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
//       </div>
//     );
//   }

//   const thumbnailCount = (currentThumbnail ? 1 : 0) + (newThumbnail ? 1 : 0);
//   const totalImages = thumbnailCount + existingImages.length + newFiles.length;
//   const canAddMore = totalImages < 5;
//   const hasThumbnail = currentThumbnail || newThumbnail;

//   return (
//     <div className="min-h-screen p-3 md:p-6 flex items-center justify-center">
//       <div className="w-full max-w-3xl">
//         <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-4 md:p-6 lg:p-8 rounded-xl shadow-lg">
//           <div className="flex items-center justify-between mb-4 md:mb-6">
//             <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
//               Edit Project
//             </h2>
//             <button
//               type="button"
//               onClick={() => navigate("/profile")}
//               className="text-gray-600 dark:text-gray-400 hover:text-blue-500 text-sm md:text-base"
//             >
//               ← Back
//             </button>
//           </div>

//           {/* Current Thumbnail */}
//           {currentThumbnail && !newThumbnail && (
//             <div className="mb-4 md:mb-6">
//               <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                 Current Thumbnail
//               </label>
//               <div className="relative w-full h-48 md:h-64">
//                 <img src={currentThumbnail} alt="Current Thumbnail" className="w-full h-full object-cover rounded-lg" />
//                 <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 md:px-3 py-1 rounded-full">
//                   Current Thumbnail
//                 </div>
//                 <button
//                   type="button"
//                   onClick={removeCurrentThumbnail}
//                   className="absolute top-2 right-2 bg-red-500 text-white p-1.5 md:p-2 rounded-full hover:bg-red-600 transition-colors"
//                   title="Remove current thumbnail"
//                 >
//                   ✕
//                 </button>
//               </div>
//             </div>
//           )}

//           {/* New Thumbnail Preview */}
//           {newThumbnailPreview && (
//             <div className="mb-4 md:mb-6">
//               <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                 New Thumbnail {currentThumbnail && "(will replace current)"}
//               </label>
//               <div className="relative w-full h-48 md:h-64">
//                 <img src={newThumbnailPreview} alt="New Thumbnail" className="w-full h-full object-cover rounded-lg" />
//                 <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 md:px-3 py-1 rounded-full">
//                   New Thumbnail
//                 </div>
//                 <button
//                   type="button"
//                   onClick={removeNewThumbnail}
//                   className="absolute top-2 right-2 bg-red-500 text-white p-1.5 md:p-2 rounded-full hover:bg-red-600"
//                 >
//                   ✕
//                 </button>
//               </div>
//             </div>
//           )}

//           {/* Upload New Thumbnail */}
//           {!newThumbnailPreview && (
//             <div className="mb-4 md:mb-6">
//               <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                 {currentThumbnail ? "Replace Thumbnail (Optional)" : "Upload Thumbnail *"}
//               </label>
//               <input
//                 type="file"
//                 accept="image/*"
//                 className="hidden"
//                 id="thumbnail-upload"
//                 onChange={handleThumbnailChange}
//                 disabled={loading}
//               />
//               <label
//                 htmlFor="thumbnail-upload"
//                 className="flex items-center justify-center w-full h-40 md:h-48 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition-all bg-gray-50 dark:bg-gray-700"
//               >
//                 <div className="text-center">
//                   <p className="text-3xl md:text-4xl mb-2">🖼️</p>
//                   <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 font-medium">
//                     Click to {currentThumbnail ? "replace" : "upload"} thumbnail
//                   </p>
//                   <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
//                     PNG, JPG, GIF up to 5MB
//                   </p>
//                 </div>
//               </label>
//             </div>
//           )}

//           {/* Existing Additional Images */}
//           {existingImages.length > 0 && (
//             <div className="mb-4 md:mb-6">
//               <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                 Additional Images ({existingImages.length})
//               </label>
//               <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
//                 {existingImages.map((img, index) => (
//                   <div key={index} className="relative group">
//                     <img src={img} alt={`Additional ${index + 1}`} className="w-full h-32 md:h-40 object-cover rounded-lg" />
//                     <button
//                       type="button"
//                       onClick={() => removeExistingImage(index)}
//                       className="absolute top-1 md:top-2 right-1 md:right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity text-sm"
//                     >
//                       ✕
//                     </button>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}

//           {/* New Additional Images Preview */}
//           {newPreviews.length > 0 && (
//             <div className="mb-4 md:mb-6">
//               <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                 New Additional Images ({newPreviews.length})
//               </label>
//               <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
//                 {newPreviews.map((preview, index) => (
//                   <div key={index} className="relative group">
//                     <img src={preview} alt={`New ${index + 1}`} className="w-full h-32 md:h-40 object-cover rounded-lg" />
//                     <button
//                       type="button"
//                       onClick={() => removeNewFile(index)}
//                       className="absolute top-1 md:top-2 right-1 md:right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity text-sm"
//                     >
//                       ✕
//                     </button>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}

//           {/* Upload Additional Images */}
//           {canAddMore && (
//             <div className="mb-4 md:mb-6">
//               <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                 Add More Images ({totalImages}/5)
//               </label>
//               <input
//                 type="file"
//                 accept="image/*"
//                 multiple
//                 className="hidden"
//                 id="files-upload"
//                 onChange={handleFileChange}
//                 disabled={loading}
//               />
//               <label
//                 htmlFor="files-upload"
//                 className="flex items-center justify-center w-full p-3 md:p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition-all bg-gray-50 dark:bg-gray-700"
//               >
//                 <div className="text-center">
//                   <p className="text-xl md:text-2xl mb-1">📁</p>
//                   <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
//                     Click to add more images ({5 - totalImages} remaining)
//                   </p>
//                 </div>
//               </label>
//             </div>
//           )}

//           {/* Title */}
//           <div className="mb-3 md:mb-4">
//             <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//               Project Title <span className="text-red-500">*</span>
//             </label>
//             <input
//               type="text"
//               value={data.title}
//               onChange={(e) => setData({ ...data, title: e.target.value })}
//               className="w-full p-2 md:p-3 text-sm md:text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
//               disabled={loading}
//               required
//             />
//           </div>

//           {/* Description */}
//           <div className="mb-3 md:mb-4">
//             <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//               Description <span className="text-red-500">*</span>
//             </label>
//             <textarea
//               value={data.description}
//               rows="4"
//               onChange={(e) => setData({ ...data, description: e.target.value })}
//               className="w-full p-2 md:p-3 text-sm md:text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 resize-none"
//               disabled={loading}
//               required
//             />
//           </div>

//           {/* Category */}
//           <div className="mb-3 md:mb-4">
//             <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//               Category <span className="text-red-500">*</span>
//             </label>
//             <select
//               value={data.category}
//               onChange={handleCategoryChange}
//               className="w-full p-2 md:p-3 text-sm md:text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 cursor-pointer"
//               disabled={loading}
//               required
//             >
//               <option value="">Select category</option>
//               {Object.keys(categories).map((cat) => (
//                 <option key={cat} value={cat}>{cat}</option>
//               ))}
//             </select>
//           </div>

//           {/* Subcategory */}
//           {data.category && (
//             <div className="mb-4 md:mb-6">
//               <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                 Subcategory <span className="text-red-500">*</span>
//               </label>
//               <select
//                 value={data.subcategory}
//                 onChange={(e) => setData({ ...data, subcategory: e.target.value })}
//                 className="w-full p-2 md:p-3 text-sm md:text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 cursor-pointer"
//                 disabled={loading}
//                 required
//               >
//                 <option value="">Select subcategory</option>
//                 {categories[data.category].map((subcat) => (
//                   <option key={subcat} value={subcat}>{subcat}</option>
//                 ))}
//               </select>
//             </div>
//           )}

//           {/* Tags Input */}
//           <div className="mb-4 md:mb-6">
//             <TagsInput tags={tags} setTags={setTags} />
//           </div>

//           {/* Warning if no thumbnail */}
//           {!hasThumbnail && (
//             <div className="mb-3 md:mb-4 p-2 md:p-3 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-600 rounded-lg">
//               <p className="text-xs md:text-sm text-red-800 dark:text-red-300">
//                 ⚠️ Thumbnail is required. Please upload a thumbnail.
//               </p>
//             </div>
//           )}

//           {/* Buttons */}
//           <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
//             <button
//               type="submit"
//               disabled={loading || !hasThumbnail}
//               className="flex-1 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-semibold px-4 md:px-6 py-2 md:py-3 rounded-lg transition-all shadow-md hover:shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed text-sm md:text-base"
//             >
//               {loading ? "Updating..." : !hasThumbnail ? "Thumbnail Required" : "Update Project"}
//             </button>
//             <button
//               type="button"
//               onClick={() => navigate("/profile")}
//               className="px-4 md:px-6 py-2 md:py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm md:text-base"
//             >
//               Cancel
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }





























// pages/EditProject.jsx - MODERN DESIGN + DYNAMIC CATEGORIES

import { useState, useEffect } from "react";
import { API } from "../api/api";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useParams } from "react-router-dom";
import TagsInput from "../components/TagsInput";
import { toast } from 'sonner';

export default function EditProject() {
  const { projectId } = useParams();
  const [data, setData] = useState({
    title: "",
    description: "",
    category: "",
    subcategory: "",
  });
  const [currentThumbnail, setCurrentThumbnail] = useState(null);
  const [existingImages, setExistingImages] = useState([]);
  const [newThumbnail, setNewThumbnail] = useState(null);
  const [newThumbnailPreview, setNewThumbnailPreview] = useState(null);
  const [newFiles, setNewFiles] = useState([]);
  const [newPreviews, setNewPreviews] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  
  // 🔥 Dynamic categories
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  
  const { user } = useAuth();
  const navigate = useNavigate();

  // 🔥 Fetch categories from API
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const res = await API.get("/categories");
      setCategories(res.data);
    } catch (err) {
      console.error("Error fetching categories:", err);
      toast.error("Failed to load categories");
    } finally {
      setLoadingCategories(false);
    }
  };

  useEffect(() => {
    API.get(`/projects/${projectId}`)
      .then((res) => {
        const project = res.data;
        
        if (project.userId._id !== user._id) {
          toast.error("You can only edit your own projects!");
          navigate("/profile");
          return;
        }

        const [mainCat, subCat] = project.category.split(" - ");
        
        setData({
          title: project.title,
          description: project.description,
          category: mainCat || "",
          subcategory: subCat || "",
        });
        
        if (project.tags) {
          setTags(project.tags);
        }
        
        if (project.images && project.images.length > 0) {
          setCurrentThumbnail(project.images[0]);
          setExistingImages(project.images.slice(1));
        }
        
        setFetchLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching project:", err);
        toast.error("Failed to load project");
        navigate("/profile");
      });
  }, [projectId, user._id, navigate]);

  const removeCurrentThumbnail = () => {
    if (!newThumbnail && existingImages.length === 0 && newFiles.length === 0) {
      toast.error("Project must have at least one image. Please add a new thumbnail before removing this one.");
      return;
    }

    if (!newThumbnail) {
      toast.error("Please upload a new thumbnail before removing the current one.");
      return;
    }

    if (window.confirm("Remove current thumbnail? You have selected a new thumbnail to replace it.")) {
      setCurrentThumbnail(null);
      toast.success("Current thumbnail removed");
    }
  };

  const removeExistingImage = (index) => {
    if (!currentThumbnail && !newThumbnail && existingImages.length === 1 && newFiles.length === 0) {
      toast.error("Project must have at least one image.");
      return;
    }

    if (window.confirm("Remove this image?")) {
      setExistingImages(existingImages.filter((_, i) => i !== index));
      toast.success("Image removed");
    }
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error("Please select an image file");
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    setNewThumbnail(file);
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setNewThumbnailPreview(reader.result);
    };
    reader.readAsDataURL(file);
    
    toast.success("New thumbnail selected!");
  };

  const removeNewThumbnail = () => {
    if (!currentThumbnail && existingImages.length === 0 && newFiles.length === 0) {
      toast.error("Project must have at least one image");
      return;
    }
    setNewThumbnail(null);
    setNewThumbnailPreview(null);
    toast.success("New thumbnail removed");
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const thumbnailCount = (currentThumbnail ? 1 : 0) + (newThumbnail ? 1 : 0);
    const totalImages = thumbnailCount + existingImages.length + newFiles.length + files.length;
    
    if (totalImages > 5) {
      toast.error(`Maximum 5 images allowed. Current total: ${thumbnailCount + existingImages.length + newFiles.length}`);
      return;
    }

    const validFiles = [];
    const previews = [];
    let hasError = false;

    files.forEach((file) => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image`);
        hasError = true;
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 5MB)`);
        hasError = true;
        return;
      }

      validFiles.push(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        previews.push(reader.result);
        if (previews.length === validFiles.length) {
          setNewPreviews([...newPreviews, ...previews]);
        }
      };
      reader.readAsDataURL(file);
    });

    if (validFiles.length > 0) {
      setNewFiles([...newFiles, ...validFiles]);
      if (!hasError) {
        toast.success(`${validFiles.length} image${validFiles.length > 1 ? 's' : ''} added!`);
      }
    }
  };

  const removeNewFile = (index) => {
    const thumbnailCount = (currentThumbnail ? 1 : 0) + (newThumbnail ? 1 : 0);
    if (thumbnailCount === 0 && existingImages.length === 0 && newFiles.length === 1) {
      toast.error("Project must have at least one image");
      return;
    }
    setNewFiles(newFiles.filter((_, i) => i !== index));
    setNewPreviews(newPreviews.filter((_, i) => i !== index));
    toast.success("Image removed");
  };

  const handleCategoryChange = (e) => {
    setData({ ...data, category: e.target.value, subcategory: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!data.title || !data.description || !data.category || !data.subcategory) {
      toast.error("Please fill all required fields");
      return;
    }

    if (!currentThumbnail && !newThumbnail) {
      toast.error("Thumbnail is required. Please upload a thumbnail.");
      return;
    }

    setLoading(true);

    try {
      const form = new FormData();
      form.append("title", data.title);
      form.append("description", data.description);
      form.append("category", `${data.category} - ${data.subcategory}`);
      
      if (tags.length > 0) {
        form.append("tags", JSON.stringify(tags));
      }
      
      form.append("currentThumbnail", currentThumbnail || "");
      form.append("existingImages", JSON.stringify(existingImages));
      
      if (newThumbnail) {
        form.append("newThumbnail", newThumbnail);
      }
      
      newFiles.forEach((file) => {
        form.append("files", file);
      });

      const token = localStorage.getItem("token");
      
      if (!token) {
        toast.error("Please login again");
        navigate("/login");
        return;
      }

      await API.put(`/projects/${projectId}`, form, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });

      toast.success("Project updated successfully! 🎉");
      navigate("/profile");
      
    } catch (err) {
      console.error("Update error:", err);
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  // 🔥 Get selected category object
  const selectedCategoryObj = categories.find(cat => cat.name === data.category);

  if (fetchLoading || loadingCategories) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-gray-200 rounded-full"></div>
          <div className="absolute top-0 left-0 w-20 h-20 border-4 border-t-blue-600 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
        </div>
        <p className="mt-4 text-gray-600 font-semibold">Loading project...</p>
      </div>
    );
  }

  const thumbnailCount = (currentThumbnail ? 1 : 0) + (newThumbnail ? 1 : 0);
  const totalImages = thumbnailCount + existingImages.length + newFiles.length;
  const canAddMore = totalImages < 5;
  const hasThumbnail = currentThumbnail || newThumbnail;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pb-40 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg border border-gray-200 mb-4">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span className="text-sm font-semibold text-gray-700">Edit Project</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-3">
            Update Your Work
          </h1>
          <p className="text-lg text-gray-600">
            Make changes to your project details
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-2xl border-2 border-gray-200 p-8">
          
          {/* Current Thumbnail */}
          {currentThumbnail && !newThumbnail && (
            <div className="mb-8">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-3">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Current Thumbnail
              </label>
              <div className="relative group">
                <img 
                  src={currentThumbnail} 
                  alt="Current Thumbnail" 
                  className="w-full h-80 object-cover rounded-2xl border-2 border-gray-200"
                />
                <div className="absolute top-3 left-3 px-3 py-1 bg-blue-600 text-white rounded-full text-xs font-bold">
                  Current Thumbnail
                </div>
                <button
                  type="button"
                  onClick={removeCurrentThumbnail}
                  className="absolute top-3 right-3 p-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all shadow-lg hover:scale-110"
                  title="Remove current thumbnail"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* New Thumbnail Preview */}
          {newThumbnailPreview && (
            <div className="mb-8">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-3">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                New Thumbnail {currentThumbnail && "(will replace current)"}
              </label>
              <div className="relative group">
                <img 
                  src={newThumbnailPreview} 
                  alt="New Thumbnail" 
                  className="w-full h-80 object-cover rounded-2xl border-2 border-green-300"
                />
                <div className="absolute top-3 left-3 px-3 py-1 bg-green-600 text-white rounded-full text-xs font-bold">
                  New Thumbnail
                </div>
                <button
                  type="button"
                  onClick={removeNewThumbnail}
                  className="absolute top-3 right-3 p-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all shadow-lg hover:scale-110"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Upload New Thumbnail */}
          {!newThumbnailPreview && (
            <div className="mb-8">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-3">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {currentThumbnail ? "Replace Thumbnail (Optional)" : "Upload Thumbnail"}
                {!currentThumbnail && <span className="text-red-500">*</span>}
              </label>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                id="thumbnail-upload"
                onChange={handleThumbnailChange}
                disabled={loading}
              />
              <label
                htmlFor="thumbnail-upload"
                className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all group"
              >
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-lg font-semibold text-gray-700 mb-2">
                    Click to {currentThumbnail ? "replace" : "upload"} thumbnail
                  </p>
                  <p className="text-sm text-gray-500">
                    PNG, JPG, GIF up to 5MB
                  </p>
                </div>
              </label>
            </div>
          )}

          {/* Existing Additional Images */}
          {existingImages.length > 0 && (
            <div className="mb-8">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-3">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Additional Images
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                  {existingImages.length}
                </span>
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {existingImages.map((img, index) => (
                  <div key={index} className="relative group">
                    <img 
                      src={img} 
                      alt={`Additional ${index + 1}`} 
                      className="w-full h-40 object-cover rounded-xl border-2 border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(index)}
                      className="absolute top-2 right-2 p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all shadow-lg opacity-0 group-hover:opacity-100"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New Additional Images Preview */}
          {newPreviews.length > 0 && (
            <div className="mb-8">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-3">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                New Additional Images
                <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                  {newPreviews.length}
                </span>
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {newPreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img 
                      src={preview} 
                      alt={`New ${index + 1}`} 
                      className="w-full h-40 object-cover rounded-xl border-2 border-green-300"
                    />
                    <button
                      type="button"
                      onClick={() => removeNewFile(index)}
                      className="absolute top-2 right-2 p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all shadow-lg opacity-0 group-hover:opacity-100"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload Additional Images */}
          {canAddMore && (
            <div className="mb-8">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-3">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add More Images (Optional)
                <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full text-xs font-bold">
                  {totalImages}/5
                </span>
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                id="files-upload"
                onChange={handleFileChange}
                disabled={loading}
              />
              <label
                htmlFor="files-upload"
                className="flex items-center justify-center w-full p-6 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all group"
              >
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <p className="text-sm font-semibold text-gray-700">
                    Add more images ({5 - totalImages} remaining)
                  </p>
                </div>
              </label>
            </div>
          )}

          {/* Title */}
          <div className="mb-6">
            <label className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
              Project Title
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={data.title}
              onChange={(e) => setData({ ...data, title: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all text-gray-900 placeholder-gray-400"
              placeholder="Enter project title..."
              disabled={loading}
              required
            />
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
              </svg>
              Description
              <span className="text-red-500">*</span>
            </label>
            <textarea
              value={data.description}
              rows="5"
              onChange={(e) => setData({ ...data, description: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all text-gray-900 placeholder-gray-400 resize-none"
              placeholder="Describe your project..."
              disabled={loading}
              required
            />
          </div>

          {/* 🔥 Category & Subcategory Grid (DYNAMIC) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Category */}
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                Category
                <span className="text-red-500">*</span>
              </label>
              <select
                value={data.category}
                onChange={handleCategoryChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all text-gray-900 font-medium disabled:bg-gray-100 disabled:cursor-not-allowed"
                disabled={loading || loadingCategories}
                required
              >
                <option value="">
                  {loadingCategories ? "Loading categories..." : "Select category"}
                </option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat.name}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Subcategory */}
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                Subcategory
                <span className="text-red-500">*</span>
              </label>
              <select
                value={data.subcategory}
                onChange={(e) => setData({ ...data, subcategory: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed"
                disabled={loading || !data.category || !selectedCategoryObj}
                required
              >
                <option value="">Select subcategory</option>
                {selectedCategoryObj?.subcategories?.map((subcat, idx) => (
                  <option key={idx} value={subcat}>{subcat}</option>
                ))}
              </select>
              {data.category && !selectedCategoryObj?.subcategories?.length && (
                <p className="text-xs text-amber-600 mt-1">
                  No subcategories available for this category
                </p>
              )}
            </div>
          </div>

          {/* Tags Input */}
          <div className="mb-8">
            <TagsInput tags={tags} setTags={setTags} />
          </div>

          {/* Warning if no thumbnail */}
          {!hasThumbnail && (
            <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-300 rounded-2xl">
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <h4 className="text-sm font-bold text-red-800 mb-1">
                    Thumbnail Required
                  </h4>
                  <p className="text-sm text-red-700">
                    Please upload a thumbnail image to update your project.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              disabled={loading || !hasThumbnail}
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold px-6 py-4 rounded-xl transition-all shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Updating...</span>
                </>
              ) : !hasThumbnail ? (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span>Thumbnail Required</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Update Project</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate("/profile")}
              className="px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 transition-all font-semibold"
            >
              Cancel
            </button>
          </div>

          {/* Info Note */}
          <div className="mt-6 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm text-gray-700">
                <p className="font-semibold mb-1">Note:</p>
                <p>Changes will be applied immediately after updating. Make sure all information is correct before saving.</p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}