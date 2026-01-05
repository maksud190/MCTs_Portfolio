// import { useState, useEffect } from "react"; // ✅ Add useEffect
// import { useAuth } from "../context/AuthContext";
// import { useNavigate } from "react-router-dom";
// import { API } from "../api/api";
// import toast from "react-hot-toast";
// import ReactCrop from "react-image-crop";
// import "react-image-crop/dist/ReactCrop.css";

// export default function ProfileSettings() {
//   const { user, updateUser } = useAuth();
//   const navigate = useNavigate();

//   const [formData, setFormData] = useState({
//     username: user?.username || "",
//     bio: user?.bio || "",
//     studentId: user?.studentId || "",
//     batch: user?.batch || "",
//     batchAdvisor: user?.batchAdvisor || "",
//     batchMentor: user?.batchMentor || "",
//   });

//   const [avatar, setAvatar] = useState(null);
//   const [avatarPreview, setAvatarPreview] = useState(user?.avatar || null);
//   const [loading, setLoading] = useState(false);

//   // ✅ Add social links state
//   const [socialLinks, setSocialLinks] = useState({
//     linkedin: "",
//     github: "",
//     behance: "",
//     portfolio: "",
//     twitter: "",
//     instagram: "",
//     facebook: "",
//   });

//   // Image crop states
//   const [showCropper, setShowCropper] = useState(false);
//   const [imageToCrop, setImageToCrop] = useState(null);
//   const [crop, setCrop] = useState({
//     unit: "%",
//     width: 50,
//     height: 50,
//     x: 25,
//     y: 25,
//     aspect: 1,
//   });
//   const [completedCrop, setCompletedCrop] = useState(null);
//   const [imageRef, setImageRef] = useState(null);

//   // ✅ Load user data including social links
//   useEffect(() => {
//     if (user) {
//       setFormData({
//         username: user.username || "",
//         bio: user.bio || "",
//         studentId: user.studentId || "",
//         batch: user.batch || "",
//         batchAdvisor: user.batchAdvisor || "",
//         batchMentor: user.batchMentor || "",
//       });

//       setAvatarPreview(user.avatar || null);

//       // ✅ Load social links
//       setSocialLinks(
//         user.socialLinks || {
//           linkedin: "",
//           github: "",
//           behance: "",
//           portfolio: "",
//           twitter: "",
//           instagram: "",
//           facebook: "",
//         }
//       );
//     }
//   }, [user]);

//   const handleAvatarChange = (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     if (!file.type.startsWith("image/")) {
//       toast.error("Please select an image file");
//       return;
//     }

//     if (file.size > 5 * 1024 * 1024) {
//       toast.error("Image size should be less than 5MB");
//       return;
//     }

//     const reader = new FileReader();
//     reader.onloadend = () => {
//       setImageToCrop(reader.result);
//       setShowCropper(true);
//       setCrop({
//         unit: "%",
//         width: 50,
//         height: 50,
//         x: 25,
//         y: 25,
//         aspect: 1,
//       });
//     };
//     reader.readAsDataURL(file);
//   };

//   const getCroppedImg = () => {
//     if (!completedCrop || !imageRef) {
//       toast.error("Please select a crop area");
//       return null;
//     }

//     const canvas = document.createElement("canvas");
//     const scaleX = imageRef.naturalWidth / imageRef.width;
//     const scaleY = imageRef.naturalHeight / imageRef.height;

//     canvas.width = completedCrop.width;
//     canvas.height = completedCrop.height;
//     const ctx = canvas.getContext("2d");

//     ctx.drawImage(
//       imageRef,
//       completedCrop.x * scaleX,
//       completedCrop.y * scaleY,
//       completedCrop.width * scaleX,
//       completedCrop.height * scaleY,
//       0,
//       0,
//       completedCrop.width,
//       completedCrop.height
//     );

//     return new Promise((resolve) => {
//       canvas.toBlob(
//         (blob) => {
//           if (!blob) {
//             toast.error("Failed to crop image");
//             resolve(null);
//             return;
//           }
//           const file = new File([blob], "avatar.jpg", { type: "image/jpeg" });
//           resolve(file);
//         },
//         "image/jpeg",
//         0.95
//       );
//     });
//   };

//   const handleCropComplete = async () => {
//     const croppedFile = await getCroppedImg();
//     if (croppedFile) {
//       setAvatar(croppedFile);

//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setAvatarPreview(reader.result);
//         setShowCropper(false);
//         toast.success("Image cropped successfully!");
//       };
//       reader.readAsDataURL(croppedFile);
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     const loadingToast = toast.loading("Updating profile...");

//     try {
//       const form = new FormData();
//       form.append("username", formData.username);
//       form.append("bio", formData.bio);
//       form.append("studentId", formData.studentId);
//       form.append("batch", formData.batch);
//       form.append("batchAdvisor", formData.batchAdvisor);
//       form.append("batchMentor", formData.batchMentor);

//       // ✅ Add social links
//       form.append("socialLinks", JSON.stringify(socialLinks));

//       if (avatar) {
//         console.log("📤 Uploading avatar:", avatar);
//         form.append("avatar", avatar);
//       }

//       const token = localStorage.getItem("token");

//       console.log("📤 Sending update request...");

//       const res = await API.put("/users/profile", form, {
//         headers: {
//           "Content-Type": "multipart/form-data",
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       console.log("✅ Response received:", res.data);

//       updateUser(res.data.user);

//       if (res.data.user.avatar) {
//         setAvatarPreview(res.data.user.avatar);
//       }

//       toast.success("Profile updated successfully!", {
//         id: loadingToast,
//       });

//       setTimeout(() => {
//         navigate("/profile");
//       }, 1000);
//     } catch (err) {
//       console.error("❌ Update error:", err);
//       toast.error(err.response?.data?.message || "Failed to update profile", {
//         id: loadingToast,
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="max-w-2xl mx-auto p-6">
//       <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
//         <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
//           Profile Settings
//         </h2>

//         {/* Image Cropper Modal */}
//         {showCropper && imageToCrop && (
//           <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
//             <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-auto">
//               <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
//                 Crop Profile Picture
//               </h3>

//               <div className="mb-4 flex justify-center">
//                 <ReactCrop
//                   crop={crop}
//                   onChange={(c) => setCrop(c)}
//                   onComplete={(c) => setCompletedCrop(c)}
//                   aspect={1}
//                   circularCrop
//                 >
//                   <img
//                     src={imageToCrop}
//                     alt="Crop preview"
//                     onLoad={(e) => setImageRef(e.target)}
//                     style={{ maxHeight: "60vh", maxWidth: "100%" }}
//                   />
//                 </ReactCrop>
//               </div>

//               <div className="flex gap-4">
//                 <button
//                   type="button"
//                   onClick={handleCropComplete}
//                   className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
//                 >
//                   Apply Crop
//                 </button>
//                 <button
//                   type="button"
//                   onClick={() => {
//                     setShowCropper(false);
//                     setImageToCrop(null);
//                   }}
//                   className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
//                 >
//                   Cancel
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}

//         <form onSubmit={handleSubmit}>
//           {/* Avatar */}
//           <div className="mb-6 text-center">
//             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//               Profile Picture
//             </label>

//             <div className="flex flex-col items-center">
//               {avatarPreview ? (
//                 <img
//                   src={avatarPreview}
//                   alt="Avatar"
//                   className="w-32 h-32 rounded-full object-cover border-4 border-gray-200 dark:border-gray-700 mb-4"
//                 />
//               ) : (
//                 <div className="w-32 h-32 rounded-full bg-amber-400 flex items-center justify-center text-white text-4xl font-bold mb-4">
//                   {formData.username?.charAt(0).toUpperCase()}
//                 </div>
//               )}

//               <input
//                 type="file"
//                 accept="image/*"
//                 onChange={handleAvatarChange}
//                 className="hidden"
//                 id="avatar-upload"
//                 disabled={loading}
//               />
//               <label
//                 htmlFor="avatar-upload"
//                 className="bg-amber-400 hover:bg-amber-400/80 text-white px-4 py-2 rounded-lg cursor-pointer transition-colors"
//               >
//                 {avatarPreview ? "Change Picture" : "Upload Picture"}
//               </label>
//             </div>
//           </div>

//           {/* Username */}
//           <div className="mb-4">
//             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//               Username
//             </label>
//             <input
//               type="text"
//               value={formData.username}
//               onChange={(e) =>
//                 setFormData({ ...formData, username: e.target.value })
//               }
//               className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
//               required
//               disabled={loading}
//             />
//           </div>

//           {/* Bio */}
//           <div className="mb-4">
//             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//               Bio
//             </label>
//             <textarea
//               value={formData.bio}
//               onChange={(e) =>
//                 setFormData({ ...formData, bio: e.target.value })
//               }
//               rows="4"
//               className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
//               disabled={loading}
//               placeholder="Tell us about yourself..."
//             />
//           </div>

//           {/* Student Details */}
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                 Student ID
//               </label>
//               <input
//                 type="text"
//                 value={formData.studentId}
//                 onChange={(e) =>
//                   setFormData({ ...formData, studentId: e.target.value })
//                 }
//                 className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
//                 disabled={loading}
//                 placeholder="e.g. 2021-1-60-123"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                 Batch
//               </label>
//               <input
//                 type="text"
//                 value={formData.batch}
//                 onChange={(e) =>
//                   setFormData({ ...formData, batch: e.target.value })
//                 }
//                 className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
//                 disabled={loading}
//                 placeholder="e.g. 60"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                 Batch Advisor
//               </label>
//               <input
//                 type="text"
//                 value={formData.batchAdvisor}
//                 onChange={(e) =>
//                   setFormData({ ...formData, batchAdvisor: e.target.value })
//                 }
//                 className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
//                 disabled={loading}
//                 placeholder="Advisor name"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                 Batch Mentor
//               </label>
//               <input
//                 type="text"
//                 value={formData.batchMentor}
//                 onChange={(e) =>
//                   setFormData({ ...formData, batchMentor: e.target.value })
//                 }
//                 className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
//                 disabled={loading}
//                 placeholder="Mentor name"
//               />
//             </div>
//           </div>

//           {/* ✅ Social Links Section */}
//           <div className="mb-6 pt-4 border-t border-gray-200 dark:border-gray-700">
//             <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
//               Social Links
//             </h3>

//             <div className="space-y-3">
//               {/* LinkedIn */}
//               <div>
//                 <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
//                   🔗 LinkedIn
//                 </label>
//                 <input
//                   type="url"
//                   value={socialLinks.linkedin || ""}
//                   onChange={(e) =>
//                     setSocialLinks({ ...socialLinks, linkedin: e.target.value })
//                   }
//                   className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
//                   disabled={loading}
//                   placeholder="https://linkedin.com/in/username"
//                 />
//               </div>

//               {/* GitHub */}
//               <div>
//                 <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
//                   💻 GitHub
//                 </label>
//                 <input
//                   type="url"
//                   value={socialLinks.github || ""}
//                   onChange={(e) =>
//                     setSocialLinks({ ...socialLinks, github: e.target.value })
//                   }
//                   className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
//                   disabled={loading}
//                   placeholder="https://github.com/username"
//                 />
//               </div>

//               {/* Behance */}
//               <div>
//                 <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
//                   🎨 Behance
//                 </label>
//                 <input
//                   type="url"
//                   value={socialLinks.behance || ""}
//                   onChange={(e) =>
//                     setSocialLinks({ ...socialLinks, behance: e.target.value })
//                   }
//                   className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
//                   disabled={loading}
//                   placeholder="https://behance.net/username"
//                 />
//               </div>

//               {/* Portfolio */}
//               <div>
//                 <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
//                   🌐 Portfolio
//                 </label>
//                 <input
//                   type="url"
//                   value={socialLinks.portfolio || ""}
//                   onChange={(e) =>
//                     setSocialLinks({
//                       ...socialLinks,
//                       portfolio: e.target.value,
//                     })
//                   }
//                   className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
//                   disabled={loading}
//                   placeholder="https://yourportfolio.com"
//                 />
//               </div>

//               {/* Twitter */}
//               <div>
//                 <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
//                   🐦 Twitter
//                 </label>
//                 <input
//                   type="url"
//                   value={socialLinks.twitter || ""}
//                   onChange={(e) =>
//                     setSocialLinks({ ...socialLinks, twitter: e.target.value })
//                   }
//                   className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
//                   disabled={loading}
//                   placeholder="https://twitter.com/username"
//                 />
//               </div>

//               {/* Instagram */}
//               <div>
//                 <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
//                   📷 Instagram
//                 </label>
//                 <input
//                   type="url"
//                   value={socialLinks.instagram || ""}
//                   onChange={(e) =>
//                     setSocialLinks({
//                       ...socialLinks,
//                       instagram: e.target.value,
//                     })
//                   }
//                   className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
//                   disabled={loading}
//                   placeholder="https://instagram.com/username"
//                 />
//               </div>

//               {/* Facebook */}
//               <div>
//                 <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
//                   📘 Facebook
//                 </label>
//                 <input
//                   type="url"
//                   value={socialLinks.facebook || ""}
//                   onChange={(e) =>
//                     setSocialLinks({ ...socialLinks, facebook: e.target.value })
//                   }
//                   className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
//                   disabled={loading}
//                   placeholder="https://facebook.com/username"
//                 />
//               </div>
//             </div>
//           </div>

//           {/* Buttons */}
//           <div className="flex gap-4">
//             <button
//               type="submit"
//               disabled={loading}
//               className="flex-1 bg-amber-400 hover:bg-amber-400/80 text-white font-semibold px-6 py-3 rounded-lg transition-all disabled:bg-gray-400 disabled:cursor-not-allowed"
//             >
//               {loading ? "Saving..." : "Save Changes"}
//             </button>
//             <button
//               type="button"
//               onClick={() => navigate("/profile")}
//               className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
//               disabled={loading}
//             >
//               Cancel
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }
