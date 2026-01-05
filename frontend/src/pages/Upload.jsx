import { useState, useEffect } from "react";
import { API } from "../api/api";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import TagsInput from "../components/TagsInput";

export default function Upload() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [data, setData] = useState({
    title: "",
    description: "",
    category: "",
    subcategory: "",
    thumbnail: null,
    files: [],
  });

  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tags, setTags] = useState([]);

  // 🔥 NEW: Dynamic categories from database
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

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

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    setData({ ...data, thumbnail: file });

    const reader = new FileReader();
    reader.onloadend = () => {
      setThumbnailPreview(reader.result);
    };
    reader.readAsDataURL(file);

    toast.success("Thumbnail selected!");
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);

    if (files.length === 0) return;

    if (data.files.length + files.length > 4) {
      toast.error("You can upload maximum 4 additional images");
      return;
    }

    const validFiles = [];
    const newPreviews = [];
    let hasError = false;

    files.forEach((file) => {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} is not an image file`);
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
        newPreviews.push(reader.result);
        if (newPreviews.length === validFiles.length) {
          setPreviews([...previews, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });

    if (validFiles.length > 0) {
      setData({ ...data, files: [...data.files, ...validFiles] });
      if (!hasError) {
        toast.success(
          `${validFiles.length} image${
            validFiles.length > 1 ? "s" : ""
          } selected!`
        );
      }
    }
  };

  const removeThumbnail = () => {
    setData({ ...data, thumbnail: null });
    setThumbnailPreview(null);
    toast.success("Thumbnail removed");
  };

  const removeImage = (index) => {
    const newFiles = data.files.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);

    setData({ ...data, files: newFiles });
    setPreviews(newPreviews);
    toast.success("Image removed");
  };

  const handleCategoryChange = (e) => {
    setData({ ...data, category: e.target.value, subcategory: "" });
  };

  const resetForm = () => {
    setData({
      title: "",
      description: "",
      category: "",
      subcategory: "",
      thumbnail: null,
      files: [],
    });
    setThumbnailPreview(null);
    setPreviews([]);
    setTags([]);
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();

  //   if (!user || !user._id) {
  //     toast.error("Please login to upload projects");
  //     navigate("/login");
  //     return;
  //   }

  //   if (!data.title || !data.description || !data.category || !data.subcategory || !data.thumbnail) {
  //     toast.error("Please fill all required fields and select a thumbnail");
  //     return;
  //   }

  //   setLoading(true);

  //   try {
  //     const form = new FormData();
  //     form.append("title", data.title);
  //     form.append("description", data.description);
  //     form.append("category", `${data.category} - ${data.subcategory}`);
  //     form.append("userId", user._id.toString());
  //     form.append("thumbnail", data.thumbnail);

  //     if (tags.length > 0) {
  //       form.append("tags", JSON.stringify(tags));
  //     }

  //     data.files.forEach((file) => {
  //       form.append("files", file);
  //     });

  //     const token = localStorage.getItem("token");

  //     if (!token) {
  //       toast.error("Session expired. Please login again.");
  //       navigate("/login");
  //       return;
  //     }

  //     const response = await API.post("/projects/upload", form, {
  //       headers: {
  //         'Content-Type': 'multipart/form-data',
  //         Authorization: `Bearer ${token}`,
  //       }
  //     });

  //     toast.success("Project uploaded successfully! 🎉");

  //     resetForm();

  //     setTimeout(() => {
  //       navigate("/profile");
  //     }, 1000);

  //   } catch (err) {
  //     console.error("❌ Upload error:", err);

  //     if (err.response?.status === 401) {
  //       toast.error("Session expired. Please login again.");
  //       localStorage.removeItem("token");
  //       localStorage.removeItem("user");
  //       navigate("/login");
  //     } else {
  //       toast.error(
  //         err.response?.data?.message || "Upload failed. Please try again."
  //       );
  //     }
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user || !user._id) {
      toast.error("Please login to upload projects");
      navigate("/login");
      return;
    }

    if (
      !data.title ||
      !data.description ||
      !data.category ||
      !data.subcategory ||
      !data.thumbnail
    ) {
      toast.error("Please fill all required fields and select a thumbnail");
      return;
    }

    setLoading(true);

    try {
      const form = new FormData();
      form.append("title", data.title);
      form.append("description", data.description);
      form.append("category", `${data.category} - ${data.subcategory}`);
      form.append("userId", user._id.toString());
      form.append("thumbnail", data.thumbnail);

      if (tags.length > 0) {
        form.append("tags", JSON.stringify(tags));
      }

      data.files.forEach((file) => {
        form.append("files", file);
      });

      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("Session expired. Please login again.");
        navigate("/login");
        return;
      }

      const response = await API.post("/projects/upload", form, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      // 🔥 UPDATED SUCCESS MESSAGE
      toast.success(
        "Project uploaded successfully! ⏳ Waiting for admin approval...",
        {
          duration: 5000,
        }
      );

      resetForm();

      setTimeout(() => {
        navigate("/profile");
      }, 1000);
    } catch (err) {
      console.error("❌ Upload error:", err);

      if (err.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
      } else {
        toast.error(
          err.response?.data?.message || "Upload failed. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // 🔥 Get selected category object
  const selectedCategoryObj = categories.find(
    (cat) => cat.name === data.category
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-6 mb-30">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg border border-gray-200 mb-4">
            <svg
              className="w-5 h-5 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <span className="text-sm font-semibold text-gray-700">
              Upload Project
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-3">
            Share Your Work
          </h1>
          <p className="text-lg text-gray-600">
            Showcase your creativity with the MCT community
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-3xl shadow-2xl border border-gray-200 p-8"
        >
          {/* Thumbnail Upload */}
          <div className="mb-8">
            <label className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-3">
              <svg
                className="w-5 h-5 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              Thumbnail Image
              <span className="text-red-500">*</span>
            </label>

            {thumbnailPreview ? (
              <div className="relative group">
                <img
                  src={thumbnailPreview}
                  alt="Thumbnail"
                  className="w-full h-80 object-cover rounded-2xl border-2 border-gray-200"
                />
                <div className="absolute top-3 left-3 px-3 py-1 bg-blue-600 text-white rounded-full text-xs font-bold">
                  Thumbnail
                </div>
                <button
                  type="button"
                  onClick={removeThumbnail}
                  className="absolute top-3 right-3 p-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all shadow-lg hover:scale-110"
                  disabled={loading}
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ) : (
              <>
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
                      <svg
                        className="w-10 h-10 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <p className="text-lg font-semibold text-gray-700 mb-2">
                      Click to upload thumbnail
                    </p>
                    <p className="text-sm text-gray-500">
                      PNG, JPG, GIF up to 5MB
                    </p>
                  </div>
                </label>
              </>
            )}
          </div>

          {/* Additional Images */}
          {previews.length > 0 && (
            <div className="mb-8">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-3">
                <svg
                  className="w-5 h-5 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                Additional Images
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                  {previews.length}/4
                </span>
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {previews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-40 object-cover rounded-xl border-2 border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all shadow-lg opacity-0 group-hover:opacity-100"
                      disabled={loading}
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add More Images Button */}
          {data.files.length < 4 && (
            <div className="mb-8">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-3">
                <svg
                  className="w-5 h-5 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Add More Images (Optional)
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
                    <svg
                      className="w-8 h-8 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                  </div>
                  <p className="text-sm font-semibold text-gray-700">
                    Add more images ({4 - data.files.length} remaining)
                  </p>
                </div>
              </label>
            </div>
          )}

          {/* Title */}
          <div className="mb-6">
            <label className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-2">
              <svg
                className="w-5 h-5 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                />
              </svg>
              Project Title
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={data.title}
              onChange={(e) => setData({ ...data, title: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all text-gray-900 placeholder-gray-400"
              placeholder="Enter your project title..."
              disabled={loading}
              required
            />
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-2">
              <svg
                className="w-5 h-5 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h7"
                />
              </svg>
              Description
              <span className="text-red-500">*</span>
            </label>
            <textarea
              value={data.description}
              rows="5"
              onChange={(e) =>
                setData({ ...data, description: e.target.value })
              }
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all text-gray-900 placeholder-gray-400 resize-none"
              placeholder="Describe your project in detail..."
              disabled={loading}
              required
            />
          </div>

          {/* 🔥 Category & Subcategory Grid (DYNAMIC) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Category */}
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-2">
                <svg
                  className="w-5 h-5 text-blue-600"
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
                  {loadingCategories
                    ? "Loading categories..."
                    : "Select category"}
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
                <svg
                  className="w-5 h-5 text-blue-600"
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
                Subcategory
                <span className="text-red-500">*</span>
              </label>
              <select
                value={data.subcategory}
                onChange={(e) =>
                  setData({ ...data, subcategory: e.target.value })
                }
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed"
                disabled={loading || !data.category || !selectedCategoryObj}
                required
              >
                <option value="">Select subcategory</option>
                {selectedCategoryObj?.subcategories?.map((subcat, idx) => (
                  <option key={idx} value={subcat}>
                    {subcat}
                  </option>
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

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !data.thumbnail || loadingCategories}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold px-6 py-4 rounded-xl transition-all shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                <span>Uploading...</span>
              </>
            ) : !data.thumbnail ? (
              <>
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <span>Select Thumbnail to Upload</span>
              </>
            ) : (
              <>
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <span>Upload Project</span>
              </>
            )}
          </button>

          {/* 🔥 UPDATED: Approval Notice + Required Fields */}
          <div className="space-y-4 mt-4">
            {/* Approval Notice */}
            <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border-2 border-amber-300">
              <div className="flex items-start gap-3">
                <svg
                  className="w-6 h-6 text-amber-600 mt-0.5 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <div className="text-sm text-amber-900">
                  <p className="font-bold mb-2 text-base">
                    ⏳ Admin Approval Required
                  </p>
                  <p className="leading-relaxed">
                    Your project will be{" "}
                    <span className="font-semibold">pending approval</span>{" "}
                    after upload. An admin will review it, and you'll receive a
                    notification once it's approved or if any changes are
                    needed. Approved projects will be visible to everyone!
                  </p>
                </div>
              </div>
            </div>

            {/* Required Fields Note */}
            <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
              <div className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div className="text-sm text-gray-700">
                  <p className="font-semibold mb-1">Required fields:</p>
                  <p>
                    Thumbnail image, title, description, category, and
                    subcategory are mandatory to upload your project.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

// {/* Required Fields Note */}
//           {/* 🔥 UPDATED: Approval Notice + Required Fields */}
//           <div className="space-y-4 mt-4">
//             {/* Approval Notice */}
//             <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border-2 border-amber-300">
//               <div className="flex items-start gap-3">
//                 <svg
//                   className="w-6 h-6 text-amber-600 mt-0.5 flex-shrink-0"
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
//                   />
//                 </svg>
//                 <div className="text-sm text-amber-900">
//                   <p className="font-bold mb-2 text-base">
//                     ⏳ Admin Approval Required
//                   </p>
//                   <p className="leading-relaxed">
//                     Your project will be{" "}
//                     <span className="font-semibold">pending approval</span>{" "}
//                     after upload. An admin will review it, and you'll receive a
//                     notification once it's approved or if any changes are
//                     needed. Approved projects will be visible to everyone!
//                   </p>
//                 </div>
//               </div>
//             </div>

//             {/* Required Fields Note */}
//             <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
//               <div className="flex items-start gap-3">
//                 <svg
//                   className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0"
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
//                   />
//                 </svg>
//                 <div className="text-sm text-gray-700">
//                   <p className="font-semibold mb-1">Required fields:</p>
//                   <p>
//                     Thumbnail image, title, description, category, and
//                     subcategory are mandatory to upload your project.
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </div>
