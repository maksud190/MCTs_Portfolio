// import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { useAuth } from "../context/AuthContext";
// import { API } from "../api/api";
// import { toast } from 'sonner';
// import ReactCrop from "react-image-crop";
// import "react-image-crop/dist/ReactCrop.css";

// export default function Settings() {
//   const { user, logout, updateUser } = useAuth();
//   const navigate = useNavigate();

//   const [activeTab, setActiveTab] = useState("profile");
//   const [loading, setLoading] = useState(false);

//   // Profile Settings
//   const [profileData, setProfileData] = useState({
//     username: "",
//     bio: "",
//     studentId: "",
//     batch: "",
//     batchAdvisor: "",
//     batchMentor: "",
//     role: "student",
//     designation: "",
//     department: "Multimedia and Creative Technology",
//   });

//   const [avatar, setAvatar] = useState(null);
//   const [avatarPreview, setAvatarPreview] = useState(null);

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

//   // Account Settings
//   const [accountData, setAccountData] = useState({
//     currentPassword: "",
//     newPassword: "",
//     confirmPassword: "",
//   });

//   // Social Links
//   const [socialLinks, setSocialLinks] = useState({
//     linkedin: "",
//     github: "",
//     behance: "",
//     portfolio: "",
//     twitter: "",
//     instagram: "",
//     facebook: "",
//   });

//   useEffect(() => {
//     if (!user) {
//       navigate("/login");
//       return;
//     }

//     setProfileData({
//       username: user.username || "",
//       bio: user.bio || "",
//       studentId: user.studentId || "",
//       batch: user.batch || "",
//       batchAdvisor: user.batchAdvisor || "",
//       batchMentor: user.batchMentor || "",
//       role: user.role || "student",
//       designation: user.designation || "",
//       department: user.department || "Multimedia and Creative Technology",
//     });

//     setAvatarPreview(user.avatar || null);

//     setSocialLinks(
//       user.socialLinks || {
//         linkedin: "",
//         github: "",
//         behance: "",
//         portfolio: "",
//         twitter: "",
//         instagram: "",
//         facebook: "",
//       }
//     );
//   }, [user, navigate]);

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

//   const handleUpdateProfile = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       const form = new FormData();
//       form.append("username", profileData.username);
//       form.append("bio", profileData.bio);
//       form.append("studentId", profileData.studentId);
//       form.append("batch", profileData.batch);
//       form.append("batchAdvisor", profileData.batchAdvisor);
//       form.append("batchMentor", profileData.batchMentor);
//       form.append("role", profileData.role);
//       form.append("designation", profileData.designation);
//       form.append("department", profileData.department);
//       form.append("socialLinks", JSON.stringify(socialLinks));

//       if (avatar) {
//         form.append("avatar", avatar);
//       }

//       const token = localStorage.getItem("token");

//       const res = await API.put("/users/profile", form, {
//         headers: {
//           "Content-Type": "multipart/form-data",
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       updateUser(res.data.user);

//       if (res.data.user.avatar) {
//         setAvatarPreview(res.data.user.avatar);
//       }

//       toast.success("Profile updated successfully!");
//     } catch (err) {
//       console.error("❌ Update error:", err);
//       toast.error(err.response?.data?.message || "Failed to update profile");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleUpdateAccount = async (e) => {
//     e.preventDefault();

//     if (
//       accountData.newPassword &&
//       accountData.newPassword !== accountData.confirmPassword
//     ) {
//       toast.error("Passwords don't match!");
//       return;
//     }

//     if (accountData.newPassword && accountData.newPassword.length < 6) {
//       toast.error("Password must be at least 6 characters");
//       return;
//     }

//     setLoading(true);

//     try {
//       const token = localStorage.getItem("token");
//       const updateData = {
//         username: profileData.username,
//       };

//       if (accountData.newPassword) {
//         updateData.currentPassword = accountData.currentPassword;
//         updateData.newPassword = accountData.newPassword;
//       }

//       await API.put("/users/account", updateData, {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       toast.success("Account updated successfully!");

//       setAccountData({
//         currentPassword: "",
//         newPassword: "",
//         confirmPassword: "",
//       });
//     } catch (err) {
//       console.error("Update account error:", err);
//       toast.error(err.response?.data?.message || "Failed to update account");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDeleteAccount = async () => {
//     const confirmed = window.confirm(
//       "⚠️ WARNING: This will permanently delete your account and all your projects!\n\nType 'DELETE' to confirm:"
//     );

//     if (!confirmed) return;

//     const userInput = prompt("Type 'DELETE' to confirm:");
//     if (userInput !== "DELETE") {
//       toast.error("Account deletion cancelled");
//       return;
//     }

//     setLoading(true);

//     try {
//       const token = localStorage.getItem("token");

//       await API.delete("/users/account", {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       toast.success("Account deleted successfully");
//       logout();
//       navigate("/");
//     } catch (err) {
//       console.error("Delete account error:", err);
//       toast.error(err.response?.data?.message || "Failed to delete account");
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (!user) {
//     return null;
//   }

//   return (
//     <div className="max-w-6xl mx-auto p-3 md:p-4 lg:p-6">
//       {/* Image Cropper Modal */}
//       {showCropper && imageToCrop && (
//         <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
//           <div className="bg-white dark:bg-gray-800 rounded-lg p-4 md:p-6 w-full max-w-2xl max-h-[90vh] overflow-auto">
//             <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-3 md:mb-4">
//               Crop Profile Picture
//             </h3>

//             <div className="mb-3 md:mb-4 flex justify-center">
//               <ReactCrop
//                 crop={crop}
//                 onChange={(c) => setCrop(c)}
//                 onComplete={(c) => setCompletedCrop(c)}
//                 aspect={1}
//                 circularCrop
//               >
//                 <img
//                   src={imageToCrop}
//                   alt="Crop preview"
//                   onLoad={(e) => setImageRef(e.target)}
//                   style={{ maxHeight: "60vh", maxWidth: "100%" }}
//                 />
//               </ReactCrop>
//             </div>

//             <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
//               <button
//                 type="button"
//                 onClick={handleCropComplete}
//                 className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm md:text-base"
//               >
//                 Apply Crop
//               </button>
//               <button
//                 type="button"
//                 onClick={() => {
//                   setShowCropper(false);
//                   setImageToCrop(null);
//                 }}
//                 className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm md:text-base"
//               >
//                 Cancel
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       <div className="bg-stone-900 rounded-lg shadow-lg">
//         {/* Header */}
//         <div className="border-b-1 border-stone-700 p-4 md:p-6">
//           <div className="flex items-center justify-between">
//             <h1 className="text-2xl md:text-3xl font-bold text-stone-100">
//               Settings
//             </h1>
//             <button
//               onClick={() => navigate("/profile")}
//               className="text-stone-300 hover:text-blue-400 transition-colors text-sm md:text-base"
//             >
//               ← Back to Profile
//             </button>
//           </div>
//         </div>

//         <div className="flex flex-col md:flex-row">
//           {/* Sidebar Tabs */}
//           <div className="md:w-64 border-b md:border-b-0 md:border-r border-stone-700 p-4 md:p-6">
//             <nav className="space-y-2">
//               <button
//                 onClick={() => setActiveTab("profile")}
//                 className={`w-full text-left px-3 md:px-4 py-2 !rounded-sm transition-colors text-sm md:text-base ${
//                   activeTab === "profile"
//                     ? "bg-blue-600 text-stone-100"
//                     : "text-stone-300 hover:bg-stone-800"
//                 }`}
//               >
//                  Profile
//               </button>
//               <button
//                 onClick={() => setActiveTab("account")}
//                 className={`w-full text-left px-3 md:px-4 py-2 !rounded-sm transition-colors text-sm md:text-base ${
//                   activeTab === "account"
//                     ? "bg-blue-600 text-stone-100"
//                     : "text-stone-300 hover:bg-stone-800"
//                 }`}
//               >
//                  Account
//               </button>
//               <button
//                 onClick={() => setActiveTab("social")}
//                 className={`w-full text-left px-3 md:px-4 py-2 !rounded-sm transition-colors text-sm md:text-base ${
//                   activeTab === "social"
//                     ? "bg-blue-600 text-stone-100"
//                     : "text-stone-300 hover:bg-stone-800"
//                 }`}
//               >
//                  Social Links
//               </button>
//               <button
//                 onClick={() => setActiveTab("danger")}
//                 className={`w-full text-left px-3 md:px-4 py-2 !rounded-sm transition-colors text-sm md:text-base ${
//                   activeTab === "danger"
//                     ? "bg-red-600 text-stone-100"
//                     : "text-red-600 hover:bg-red-900/40"
//                 }`}
//               >
//                  Danger Zone
//               </button>
//             </nav>
//           </div>

//           {/* Main Content */}
//           <div className="flex-1 p-4 md:p-6">
//             {/* Profile Tab */}
//             {activeTab === "profile" && (
//               <div>
//                 <h2 className="text-xl md:text-2xl font-bold text-stone-100 mb-4 md:mb-6">
//                   Profile Settings
//                 </h2>
//                 <form onSubmit={handleUpdateProfile}>
//                   {/* Avatar */}
//                   <div className="mb-4 md:mb-6 text-center">
//                     <label className="block text-xs md:text-sm font-medium text-stone-300 mb-2">
//                       Profile Picture
//                     </label>

//                     <div className="flex flex-col items-center">
//                       {avatarPreview ? (
//                         <img
//                           src={avatarPreview}
//                           alt="Avatar"
//                           className="w-24 h-24 md:w-32 md:h-32 rounded-sm object-cover border-4 border-stone-800 mb-3 md:mb-4"
//                         />
//                       ) : (
//                         <div className="w-24 h-24 md:w-32 md:h-32 border-4 border-stone-800 rounded-sm bg-stone-900 flex items-center justify-center text-stone-100 !text-5xl md:text-4xl font-bold mb-3 md:mb-4">
//                           {profileData.username?.charAt(0).toUpperCase()}
//                         </div>
//                       )}

//                       <input
//                         type="file"
//                         accept="image/*"
//                         onChange={handleAvatarChange}
//                         className="hidden"
//                         id="avatar-upload"
//                         disabled={loading}
//                       />
//                       <label
//                         htmlFor="avatar-upload"
//                         className="bg-blue-600 hover:bg-stone-800 text-white px-3 md:px-4 py-2 rounded-sm cursor-pointer transition-colors text-sm md:text-base"
//                       >
//                         {avatarPreview ? "Change Picture" : "Upload Picture"}
//                       </label>
//                     </div>
//                   </div>

//                   {/* Username */}
//                   <div className="mb-3 md:mb-4">
//                     <label className="block text-xs md:text-sm font-medium text-stone-300 mb-2">
//                       Username
//                     </label>
//                     <input
//                       type="text"
//                       value={profileData.username}
//                       onChange={(e) =>
//                         setProfileData({ ...profileData, username: e.target.value })
//                       }
//                       className="w-full p-2 md:p-3 text-sm md:text-base border border-stone-600 rounded-sm bg-stone-800 text-stone-200"
//                       required
//                       disabled={loading}
//                     />
//                   </div>

//                   {/* Bio */}
//                   <div className="mb-3 md:mb-4">
//                     <label className="block text-xs md:text-sm font-medium text-stone-300 mb-2">
//                       Bio
//                     </label>
//                     <textarea
//                       value={profileData.bio}
//                       onChange={(e) =>
//                         setProfileData({ ...profileData, bio: e.target.value })
//                       }
//                       rows="4"
//                       className="w-full p-2 md:p-3 text-sm md:text-base border border-stone-600 rounded-sm bg-stone-800 text-stone-200"
//                       disabled={loading}
//                       placeholder="Tell us about yourself..."
//                     />
//                   </div>

//                   {/* Role Selection */}
//                   <div className="mb-3 md:mb-4">
//                     <label className="block text-xs md:text-sm font-medium text-stone-300 mb-2">
//                       I am a
//                     </label>
//                     <select
//                       value={profileData.role}
//                       onChange={(e) =>
//                         setProfileData({ ...profileData, role: e.target.value })
//                       }
//                       className="w-full h-full p-2 md:p-3 text-sm md:text-base border border-stone-600 rounded-sm bg-stone-800 text-stone-200"
//                       disabled={loading}
//                     >
//                       <option value="student">Student</option>
//                       <option value="teacher">Teacher/Instructor</option>
//                     </select>
//                   </div>

//                   {/* Designation */}
//                   <div className="mb-3 md:mb-4">
//                     <label className="block text-xs md:text-sm font-medium text-stone-300 mb-2">
//                       Designation
//                     </label>
//                     <input
//                       type="text"
//                       value={profileData.designation}
//                       onChange={(e) =>
//                         setProfileData({
//                           ...profileData,
//                           designation: e.target.value,
//                         })
//                       }
//                       className="w-full p-2 md:p-3 text-sm md:text-base border border-stone-600 rounded-sm bg-stone-800 text-stone-200"
//                       disabled={loading}
//                       placeholder="e.g. Undergraduate Student, Lecturer, etc."
//                     />
//                   </div>

//                   {/* Department */}
//                   <div className="mb-3 md:mb-4">
//                     <label className="block text-xs md:text-sm font-medium text-stone-300 mb-2">
//                       Department
//                     </label>
//                     <input
//                       type="text"
//                       value={profileData.department}
//                       onChange={(e) =>
//                         setProfileData({
//                           ...profileData,
//                           department: e.target.value,
//                         })
//                       }
//                       className="w-full p-2 md:p-3 text-sm md:text-base border border-stone-600 rounded-sm bg-stone-800 text-stone-200"
//                       disabled={loading}
//                       placeholder="e.g. Multimedia and Creative Technology"
//                     />
//                   </div>

//                   {/* Student Details */}
//                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 mb-4">
//                     <div>
//                       <label className="block text-xs md:text-sm font-medium text-stone-300 mb-2">
//                         Student ID
//                       </label>
//                       <input
//                         type="text"
//                         value={profileData.studentId}
//                         onChange={(e) =>
//                           setProfileData({ ...profileData, studentId: e.target.value })
//                         }
//                         className="w-full p-2 md:p-3 text-sm md:text-base border border-stone-600 rounded-sm bg-stone-800 text-stone-200"
//                         disabled={loading}
//                         placeholder="e.g. 221-40-041"
//                       />
//                     </div>

//                     <div>
//                       <label className="block text-xs md:text-sm font-medium text-stone-300 mb-2">
//                         Batch
//                       </label>
//                       <input
//                         type="text"
//                         value={profileData.batch}
//                         onChange={(e) =>
//                           setProfileData({ ...profileData, batch: e.target.value })
//                         }
//                         className="w-full p-2 md:p-3 text-sm md:text-base border border-stone-600 rounded-sm bg-stone-800 text-stone-200"
//                         disabled={loading}
//                         placeholder="e.g. 31"
//                       />
//                     </div>

//                     <div>
//                       <label className="block text-xs md:text-sm font-medium text-stone-300 mb-2">
//                         Batch Advisor
//                       </label>
//                       <input
//                         type="text"
//                         value={profileData.batchAdvisor}
//                         onChange={(e) =>
//                           setProfileData({
//                             ...profileData,
//                             batchAdvisor: e.target.value,
//                           })
//                         }
//                         className="w-full p-2 md:p-3 text-sm md:text-base border border-stone-600 rounded-sm bg-stone-800 text-stone-200"
//                         disabled={loading}
//                         placeholder="Advisor name"
//                       />
//                     </div>

//                     <div>
//                       <label className="block text-xs md:text-sm font-medium text-stone-300 mb-2">
//                         Batch Mentor
//                       </label>
//                       <input
//                         type="text"
//                         value={profileData.batchMentor}
//                         onChange={(e) =>
//                           setProfileData({
//                             ...profileData,
//                             batchMentor: e.target.value,
//                           })
//                         }
//                         className="w-full p-2 md:p-3 text-sm md:text-base border border-stone-600 rounded-sm bg-stone-800 text-stone-200"
//                         disabled={loading}
//                         placeholder="Mentor name"
//                       />
//                     </div>
//                   </div>

//                   <button
//                     type="submit"
//                     disabled={loading}
//                     className="w-full bg-blue-600 hover:bg-stone-800 text-white font-semibold px-4 md:px-6 py-2 md:py-3 !rounded-sm transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-sm md:text-base"
//                   >
//                     {loading ? "Saving..." : "Save Profile"}
//                   </button>
//                 </form>
//               </div>
//             )}

//             {/* Account Tab */}
//             {activeTab === "account" && (
//               <div>
//                 <h2 className="text-xl md:text-2xl font-bold text-stone-100 mb-4 md:mb-6">
//                   Account Settings
//                 </h2>
//                 <form onSubmit={handleUpdateAccount} className="space-y-3 md:space-y-4">
//                   {/* Email (Read-only) */}
//                   <div>
//                     <label className="block text-xs md:text-sm font-medium text-stone-300 mb-2">
//                       Email
//                     </label>
//                     <input
//                       type="email"
//                       value={user.email}
//                       className="w-full p-2 md:p-3 text-sm md:text-base border border-stone-600 rounded-sm bg-stone-800 text-stone-500"
//                       disabled
//                     />
//                     <p className="text-xs text-stone-400 mt-1">
//                       Email cannot be changed
//                     </p>
//                   </div>

//                   {/* Change Password Section */}
//                   <div className="pt-3 md:pt-4 border-t border-stone-700">
//                     <h3 className="text-base md:text-lg font-semibold text-stone-200 mb-3 md:mb-4">
//                       Change Password
//                     </h3>

//                     <div className="space-y-3 md:space-y-4">
//                       {/* Current Password */}
//                       <div>
//                         <label className="block text-xs md:text-sm font-medium text-stone-300 mb-2">
//                           Current Password
//                         </label>
//                         <input
//                           type="password"
//                           value={accountData.currentPassword}
//                           onChange={(e) =>
//                             setAccountData({
//                               ...accountData,
//                               currentPassword: e.target.value,
//                             })
//                           }
//                           className="w-full p-2 md:p-3 text-sm md:text-base border border-stone-600 rounded-sm bg-stone-800 text-stone-200"
//                           disabled={loading}
//                           placeholder="Enter current password"
//                         />
//                       </div>

//                       {/* New Password */}
//                       <div>
//                         <label className="block text-xs md:text-sm font-medium text-stone-300 mb-2">
//                           New Password
//                         </label>
//                         <input
//                           type="password"
//                           value={accountData.newPassword}
//                           onChange={(e) =>
//                             setAccountData({
//                               ...accountData,
//                               newPassword: e.target.value,
//                             })
//                           }
//                           className="w-full p-2 md:p-3 text-sm md:text-base border border-stone-600 rounded-sm bg-stone-800 text-stone-200"
//                           disabled={loading}
//                           placeholder="Enter new password (min 6 characters)"
//                           minLength={6}
//                         />
//                       </div>

//                       {/* Confirm Password */}
//                       <div>
//                         <label className="block text-xs md:text-sm font-medium text-stone-300 mb-2">
//                           Confirm New Password
//                         </label>
//                         <input
//                           type="password"
//                           value={accountData.confirmPassword}
//                           onChange={(e) =>
//                             setAccountData({
//                               ...accountData,
//                               confirmPassword: e.target.value,
//                             })
//                           }
//                           className="w-full p-2 md:p-3 text-sm md:text-base border border-stone-600 rounded-sm bg-stone-800 text-stone-200"
//                           disabled={loading}
//                           placeholder="Confirm new password"
//                         />
//                       </div>
//                     </div>
//                   </div>

//                   <button
//                     type="submit"
//                     disabled={loading}
//                     className="w-full bg-blue-600 hover:bg-stone-800 text-white font-semibold px-4 md:px-6 py-2 md:py-3 !rounded-sm transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-sm md:text-base"
//                   >
//                     {loading ? "Saving..." : "Save Changes"}
//                   </button>
//                 </form>
//               </div>
//             )}

//             {/* Social Links Tab */}
//             {activeTab === "social" && (
//               <div>
//                 <h2 className="text-xl md:text-2xl font-bold text-stone-100 mb-4 md:mb-6">
//                   Social Links
//                 </h2>
//                 <form onSubmit={handleUpdateProfile} className="space-y-3 md:space-y-4">

//                   {/* Portfolio */}
//                   <div>
//                     <label className="block text-xs md:text-sm font-medium text-stone-300 mb-2">
//                       Portfolio Website
//                     </label>
//                     <input
//                       type="url"
//                       value={socialLinks.portfolio || ""}
//                       onChange={(e) =>
//                         setSocialLinks({
//                           ...socialLinks,
//                           portfolio: e.target.value,
//                         })
//                       }
//                       className="w-full p-2 md:p-3 text-sm md:text-base border border-stone-600 rounded-sm bg-stone-800 text-stone-200"
//                       disabled={loading}
//                       placeholder="https://yourportfolio.com"
//                     />
//                   </div>

//                   {/* LinkedIn */}
//                   <div>
//                     <label className="block text-xs md:text-sm font-medium text-stone-300 mb-2">
//                       LinkedIn
//                     </label>
//                     <input
//                       type="url"
//                       value={socialLinks.linkedin || ""}
//                       onChange={(e) =>
//                         setSocialLinks({ ...socialLinks, linkedin: e.target.value })
//                       }
//                       className="w-full p-2 md:p-3 text-sm md:text-base border border-stone-600 rounded-sm bg-stone-800 text-stone-200"
//                       disabled={loading}
//                       placeholder="https://linkedin.com/in/username"
//                     />
//                   </div>

//                   {/* GitHub */}
//                   <div>
//                     <label className="block text-xs md:text-sm font-medium text-stone-300 mb-2">
//                       GitHub
//                     </label>
//                     <input
//                       type="url"
//                       value={socialLinks.github || ""}
//                       onChange={(e) =>
//                         setSocialLinks({ ...socialLinks, github: e.target.value })
//                       }
//                       className="w-full p-2 md:p-3 text-sm md:text-base border border-stone-600 rounded-sm bg-stone-800 text-stone-200"
//                       disabled={loading}
//                       placeholder="https://github.com/username"
//                     />
//                   </div>

//                   {/* Behance */}
//                   <div>
//                     <label className="block text-xs md:text-sm font-medium text-stone-300 mb-2">
//                       Behance
//                     </label>
//                     <input
//                       type="url"
//                       value={socialLinks.behance || ""}
//                       onChange={(e) =>
//                         setSocialLinks({ ...socialLinks, behance: e.target.value })
//                       }
//                       className="w-full p-2 md:p-3 text-sm md:text-base border border-stone-600 rounded-sm bg-stone-800 text-stone-200"
//                       disabled={loading}
//                       placeholder="https://behance.net/username"
//                     />
//                   </div>

//                   {/* Twitter */}
//                   <div>
//                     <label className="block text-xs md:text-sm font-medium text-stone-300 mb-2">
//                       Twitter
//                     </label>
//                     <input
//                       type="url"
//                       value={socialLinks.twitter || ""}
//                       onChange={(e) =>
//                         setSocialLinks({ ...socialLinks, twitter: e.target.value })
//                       }
//                       className="w-full p-2 md:p-3 text-sm md:text-base border border-stone-600 rounded-sm bg-stone-800 text-stone-200"
//                       disabled={loading}
//                       placeholder="https://twitter.com/username"
//                     />
//                   </div>

//                   {/* Instagram */}
//                   <div>
//                     <label className="block text-xs md:text-sm font-medium text-stone-300 mb-2">
//                        Instagram
//                     </label>
//                     <input
//                       type="url"
//                       value={socialLinks.instagram || ""}
//                       onChange={(e) =>
//                         setSocialLinks({
//                           ...socialLinks,
//                           instagram: e.target.value,
//                         })
//                       }
//                       className="w-full p-2 md:p-3 text-sm md:text-base border border-stone-600 rounded-sm bg-stone-800 text-stone-200"
//                       disabled={loading}
//                       placeholder="https://instagram.com/username"
//                     />
//                   </div>

//                   {/* Facebook */}
//                   <div>
//                     <label className="block text-xs md:text-sm font-medium text-stone-300 mb-2">
//                        Facebook
//                     </label>
//                     <input
//                       type="url"
//                       value={socialLinks.facebook || ""}
//                       onChange={(e) =>
//                         setSocialLinks({ ...socialLinks, facebook: e.target.value })
//                       }
//                       className="w-full p-2 md:p-3 text-sm md:text-base border border-stone-600 rounded-sm bg-stone-800 text-stone-200"
//                       disabled={loading}
//                       placeholder="https://facebook.com/username"
//                     />
//                   </div>

//                   <button
//                     type="submit"
//                     disabled={loading}
//                     className="w-full bg-blue-600 hover:bg-stone-800 text-white font-semibold px-4 md:px-6 py-2 md:py-3 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-sm md:text-base"
//                   >
//                     {loading ? "Saving..." : "Save Social Links"}
//                   </button>
//                 </form>
//               </div>
//             )}

//             {/* Danger Zone Tab */}
//             {activeTab === "danger" && (
//               <div>
//                 <h2 className="text-xl md:text-2xl font-bold text-red-600 dark:text-red-400 mb-4 md:mb-6">
//                   ⚠️ Danger Zone
//                 </h2>
//                 <div className="space-y-3 md:space-y-4">
//                   <div className="bg-red-900/20 border border-red-800 rounded-sm p-4 md:p-6">
//                     <h3 className="text-base md:text-lg font-semibold text-red-400 mb-2">
//                       Delete Account
//                     </h3>
//                     <p className="text-xs md:text-sm text-red-300 mb-3 md:mb-4">
//                       Once you delete your account, there is no going back. This will
//                       permanently delete all your projects, comments, and data.
//                     </p>
//                     <button
//                       onClick={handleDeleteAccount}
//                       disabled={loading}
//                       className="bg-red-600 hover:bg-stone-800 text-stone-100 font-semibold px-4 md:px-6 py-2 md:py-3 !rounded-sm transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-sm md:text-base"
//                     >
//                       {loading ? "Deleting..." : "Delete My Account"}
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { API } from "../api/api";
import { toast } from "sonner";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

export default function Settings() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);

  // Profile Settings
  const [profileData, setProfileData] = useState({
    fullName: "",
    username: "",
    bio: "",
    studentId: "",
    batch: "",
    batchAdvisor: "",
    batchMentor: "",
    role: "student",
    designation: "",
    department: "Multimedia and Creative Technology",
  });

  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  // Image crop states
  const [showCropper, setShowCropper] = useState(false);
  const [imageToCrop, setImageToCrop] = useState(null);
  const [crop, setCrop] = useState({
    unit: "%",
    width: 50,
    height: 50,
    x: 25,
    y: 25,
    aspect: 1,
  });
  const [completedCrop, setCompletedCrop] = useState(null);
  const [imageRef, setImageRef] = useState(null);

  // Account Settings
  const [accountData, setAccountData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Social Links
  const [socialLinks, setSocialLinks] = useState({
    linkedin: "",
    github: "",
    behance: "",
    portfolio: "",
    twitter: "",
    instagram: "",
    facebook: "",
  });

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    setProfileData({
      fullName: user.fullName || "",
      username: user.username || "",
      bio: user.bio || "",
      studentId: user.studentId || "",
      batch: user.batch || "",
      batchAdvisor: user.batchAdvisor || "",
      batchMentor: user.batchMentor || "",
      role: user.role || "student",
      designation: user.designation || "",
      department: user.department || "Multimedia and Creative Technology",
    });

    setAvatarPreview(user.avatar || null);

    setSocialLinks(
      user.socialLinks || {
        linkedin: "",
        github: "",
        behance: "",
        portfolio: "",
        twitter: "",
        instagram: "",
        facebook: "",
      }
    );
  }, [user, navigate]);

  const handleAvatarChange = (e) => {
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

    const reader = new FileReader();
    reader.onloadend = () => {
      setImageToCrop(reader.result);
      setShowCropper(true);
      setCrop({
        unit: "%",
        width: 50,
        height: 50,
        x: 25,
        y: 25,
        aspect: 1,
      });
    };
    reader.readAsDataURL(file);
  };

  const getCroppedImg = () => {
    if (!completedCrop || !imageRef) {
      toast.error("Please select a crop area");
      return null;
    }

    const canvas = document.createElement("canvas");
    const scaleX = imageRef.naturalWidth / imageRef.width;
    const scaleY = imageRef.naturalHeight / imageRef.height;

    canvas.width = completedCrop.width;
    canvas.height = completedCrop.height;
    const ctx = canvas.getContext("2d");

    ctx.drawImage(
      imageRef,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width,
      completedCrop.height
    );

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            toast.error("Failed to crop image");
            resolve(null);
            return;
          }
          const file = new File([blob], "avatar.jpg", { type: "image/jpeg" });
          resolve(file);
        },
        "image/jpeg",
        0.95
      );
    });
  };

  const handleCropComplete = async () => {
    const croppedFile = await getCroppedImg();
    if (croppedFile) {
      setAvatar(croppedFile);

      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
        setShowCropper(false);
        toast.success("Image cropped successfully!");
      };
      reader.readAsDataURL(croppedFile);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const form = new FormData();
      form.append("fullName", profileData.fullName);
      form.append("username", profileData.username);
      form.append("bio", profileData.bio);
      form.append("studentId", profileData.studentId);
      form.append("batch", profileData.batch);
      form.append("batchAdvisor", profileData.batchAdvisor);
      form.append("batchMentor", profileData.batchMentor);
      form.append("role", profileData.role);
      form.append("designation", profileData.designation);
      form.append("department", profileData.department);
      form.append("socialLinks", JSON.stringify(socialLinks));

      if (avatar) {
        form.append("avatar", avatar);
      }

      const token = localStorage.getItem("token");

      const res = await API.put("/users/profile", form, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      updateUser(res.data.user);

      if (res.data.user.avatar) {
        setAvatarPreview(res.data.user.avatar);
      }

      toast.success("Profile updated successfully!");
    } catch (err) {
      console.error("❌ Update error:", err);
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAccount = async (e) => {
    e.preventDefault();

    if (
      accountData.newPassword &&
      accountData.newPassword !== accountData.confirmPassword
    ) {
      toast.error("Passwords don't match!");
      return;
    }

    if (accountData.newPassword && accountData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const updateData = {
        username: profileData.username,
      };

      if (accountData.newPassword) {
        updateData.currentPassword = accountData.currentPassword;
        updateData.newPassword = accountData.newPassword;
      }

      await API.put("/users/account", updateData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Account updated successfully!");

      setAccountData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      console.error("Update account error:", err);
      toast.error(err.response?.data?.message || "Failed to update account");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "⚠️ WARNING: This will permanently delete your account and all your projects!\n\nType 'DELETE' to confirm:"
    );

    if (!confirmed) return;

    const userInput = prompt("Type 'DELETE' to confirm:");
    if (userInput !== "DELETE") {
      toast.error("Account deletion cancelled");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      await API.delete("/users/account", {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Account deleted successfully");
      logout();
      navigate("/");
    } catch (err) {
      console.error("Delete account error:", err);
      toast.error(err.response?.data?.message || "Failed to delete account");
    } finally {
      setLoading(false);
    }
  };

  const socialLinksConfig = [
    {
      key: "portfolio",
      label: "Portfolio Website",
      placeholder: "https://yourportfolio.com",
      icon: (
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
            d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
          />
        </svg>
      ),
    },
    {
      key: "linkedin",
      label: "LinkedIn",
      placeholder: "https://linkedin.com/in/username",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      ),
    },
    {
      key: "github",
      label: "GitHub",
      placeholder: "https://github.com/username",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
        </svg>
      ),
    },
    {
      key: "behance",
      label: "Behance",
      placeholder: "https://behance.net/username",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M22 7h-7v-2h7v2zm1.726 10c-.442 1.297-2.029 3-5.101 3-3.074 0-5.564-1.729-5.564-5.675 0-3.91 2.325-5.92 5.466-5.92 3.082 0 4.964 1.782 5.375 4.426.078.506.109 1.188.095 2.14h-8.027c.13 3.211 3.483 3.312 4.588 2.029h3.168zm-7.686-4h4.965c-.105-1.547-1.136-2.219-2.477-2.219-1.466 0-2.277.768-2.488 2.219zm-9.574 6.988h-6.466v-14.967h6.953c5.476.081 5.58 5.444 2.72 6.906 3.461 1.26 3.577 8.061-3.207 8.061zm-3.466-8.988h3.584c2.508 0 2.906-3-.312-3h-3.272v3zm3.391 3h-3.391v3.016h3.341c3.055 0 2.868-3.016.05-3.016z" />
        </svg>
      ),
    },
    {
      key: "twitter",
      label: "Twitter",
      placeholder: "https://twitter.com/username",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
        </svg>
      ),
    },
    {
      key: "instagram",
      label: "Instagram",
      placeholder: "https://instagram.com/username",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      ),
    },
    {
      key: "facebook",
      label: "Facebook",
      placeholder: "https://facebook.com/username",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
    },
  ];

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-6 mb-30">
      {/* Image Cropper Modal */}
      {showCropper && imageToCrop && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-2xl max-h-[90vh] overflow-auto shadow-2xl">
            <h3 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
              <svg
                className="w-7 h-7 text-blue-600"
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
              Crop Profile Picture
            </h3>

            <div className="mb-6 flex justify-center bg-gray-100 rounded-2xl p-4">
              <ReactCrop
                crop={crop}
                onChange={(c) => setCrop(c)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={1}
                circularCrop
              >
                <img
                  src={imageToCrop}
                  alt="Crop preview"
                  onLoad={(e) => setImageRef(e.target)}
                  style={{
                    maxHeight: "60vh",
                    maxWidth: "100%",
                    borderRadius: "12px",
                  }}
                />
              </ReactCrop>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={handleCropComplete}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl"
              >
                Apply Crop
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCropper(false);
                  setImageToCrop(null);
                }}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 font-semibold transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-black text-gray-900 mb-2">
                Settings
              </h1>
              <p className="text-gray-600">
                Manage your account and preferences
              </p>
            </div>
            <button
              onClick={() => navigate("/profile")}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-2 font-semibold"
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
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back to Profile
            </button>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden">
          <div className="flex flex-col md:flex-row">
            {/* Sidebar Tabs */}
            <div className="md:w-64 border-b md:border-b-0 md:border-r border-gray-200 bg-gray-50 p-6">
              <nav className="space-y-2">
                {[
                  {
                    id: "profile",
                    label: "Profile",
                    icon: (
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
                    ),
                  },
                  {
                    id: "account",
                    label: "Account",
                    icon: (
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
                          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    ),
                  },
                  {
                    id: "social",
                    label: "Social Links",
                    icon: (
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
                          d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                        />
                      </svg>
                    ),
                  },
                  {
                    id: "danger",
                    label: "Danger Zone",
                    icon: (
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
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                    ),
                    danger: true,
                  },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold ${
                      activeTab === tab.id
                        ? tab.danger
                          ? "bg-red-600 text-white shadow-lg"
                          : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
                        : tab.danger
                        ? "text-red-600 hover:bg-red-50"
                        : "text-gray-700 hover:bg-white hover:shadow-md"
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-8">
              {/* Profile Tab */}
              {activeTab === "profile" && (
                <div>
                  <h2 className="text-2xl font-black text-gray-900 mb-6">
                    Profile Settings
                  </h2>
                  <form onSubmit={handleUpdateProfile} className="space-y-6">
                    {/* Avatar */}
                    <div className="text-center pb-6 border-b border-gray-200">
                      <label className="block text-sm font-bold text-gray-900 mb-4">
                        Profile Picture
                      </label>
                      <div className="flex flex-col items-center">
                        {avatarPreview ? (
                          <img
                            src={avatarPreview}
                            alt="Avatar"
                            className="w-32 h-32 rounded-3xl object-cover border-4 border-white shadow-2xl mb-4"
                          />
                        ) : (
                          <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-5xl font-bold mb-4 shadow-2xl">
                            {profileData.username?.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarChange}
                          className="hidden"
                          id="avatar-upload"
                          disabled={loading}
                        />
                        <label
                          htmlFor="avatar-upload"
                          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl cursor-pointer transition-all font-semibold shadow-lg hover:shadow-xl"
                        >
                          {avatarPreview ? "Change Picture" : "Upload Picture"}
                        </label>
                      </div>
                    </div>

                    {/* Full Name */}
                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={profileData.fullName}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            fullName: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all text-gray-900"
                        disabled={loading}
                        placeholder="e.g. Maksudur Rahaman"
                        required
                      />
                    </div>

                    {/* Username */}
                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-2">
                        Username
                      </label>
                      <input
                        type="text"
                        value={profileData.username}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            username: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all text-gray-900"
                        required
                        disabled={loading}
                      />
                    </div>

                    {/* Bio */}
                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-2">
                        Bio
                      </label>
                      <textarea
                        value={profileData.bio}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            bio: e.target.value,
                          })
                        }
                        rows="4"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all text-gray-900 resize-none"
                        disabled={loading}
                        placeholder="Tell us about yourself..."
                      />
                    </div>

                    {/* Role & Designation Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2">
                          I am a
                        </label>
                        <select
                          value={profileData.role}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              role: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all text-gray-900 font-medium"
                          disabled={loading}
                        >
                          <option value="student">Student</option>
                          <option value="teacher">Teacher/Instructor</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2">
                          Designation
                        </label>
                        <input
                          type="text"
                          value={profileData.designation}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              designation: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all text-gray-900"
                          disabled={loading}
                          placeholder="e.g. Undergraduate Student"
                        />
                      </div>
                    </div>

                    {/* Department */}
                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-2">
                        Department
                      </label>
                      <input
                        type="text"
                        value={profileData.department}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            department: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all text-gray-900"
                        disabled={loading}
                        placeholder="e.g. Multimedia and Creative Technology"
                      />
                    </div>

                    {/* Student Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2">
                          Student ID
                        </label>
                        <input
                          type="text"
                          value={profileData.studentId}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              studentId: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all text-gray-900"
                          disabled={loading}
                          placeholder="e.g. 221-40-041"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2">
                          Batch
                        </label>
                        <input
                          type="text"
                          value={profileData.batch}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              batch: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all text-gray-900"
                          disabled={loading}
                          placeholder="e.g. 31"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2">
                          Batch Advisor
                        </label>
                        <input
                          type="text"
                          value={profileData.batchAdvisor}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              batchAdvisor: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all text-gray-900"
                          disabled={loading}
                          placeholder="Advisor name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2">
                          Batch Mentor
                        </label>
                        <input
                          type="text"
                          value={profileData.batchMentor}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              batchMentor: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all text-gray-900"
                          disabled={loading}
                          placeholder="Mentor name"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold px-6 py-4 rounded-xl transition-all shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? "Saving..." : "Save Profile"}
                    </button>
                  </form>
                </div>
              )}

              {/* Account Tab */}
              {activeTab === "account" && (
                <div>
                  <h2 className="text-2xl font-black text-gray-900 mb-6">
                    Account Settings
                  </h2>
                  <form onSubmit={handleUpdateAccount} className="space-y-6">
                    {/* Email (Read-only) */}
                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={user.email}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-100 text-gray-500 cursor-not-allowed"
                        disabled
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        Email cannot be changed
                      </p>
                    </div>

                    {/* Change Password Section */}
                    <div className="pt-6 border-t border-gray-200">
                      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
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
                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                          />
                        </svg>
                        Change Password
                      </h3>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-bold text-gray-900 mb-2">
                            Current Password
                          </label>
                          <input
                            type="password"
                            value={accountData.currentPassword}
                            onChange={(e) =>
                              setAccountData({
                                ...accountData,
                                currentPassword: e.target.value,
                              })
                            }
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all text-gray-900"
                            disabled={loading}
                            placeholder="Enter current password"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-bold text-gray-900 mb-2">
                            New Password
                          </label>
                          <input
                            type="password"
                            value={accountData.newPassword}
                            onChange={(e) =>
                              setAccountData({
                                ...accountData,
                                newPassword: e.target.value,
                              })
                            }
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all text-gray-900"
                            disabled={loading}
                            placeholder="Enter new password (min 6 characters)"
                            minLength={6}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-bold text-gray-900 mb-2">
                            Confirm New Password
                          </label>
                          <input
                            type="password"
                            value={accountData.confirmPassword}
                            onChange={(e) =>
                              setAccountData({
                                ...accountData,
                                confirmPassword: e.target.value,
                              })
                            }
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all text-gray-900"
                            disabled={loading}
                            placeholder="Confirm new password"
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold px-6 py-4 rounded-xl transition-all shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? "Saving..." : "Save Changes"}
                    </button>
                  </form>
                </div>
              )}

              {/* Social Links Tab */}
              {activeTab === "social" && (
                <div>
                  <h2 className="text-2xl font-black text-gray-900 mb-6">
                    Social Links
                  </h2>
                  <form onSubmit={handleUpdateProfile} className="space-y-6">
                    {socialLinksConfig.map(
                      ({ key, label, placeholder, icon }) => (
                        <div key={key}>
                          <label className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-2">
                            {icon}
                            {label}
                          </label>
                          <input
                            type="url"
                            value={socialLinks[key] || ""}
                            onChange={(e) =>
                              setSocialLinks({
                                ...socialLinks,
                                [key]: e.target.value,
                              })
                            }
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all text-gray-900"
                            disabled={loading}
                            placeholder={placeholder}
                          />
                        </div>
                      )
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold px-6 py-4 rounded-xl transition-all shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? "Saving..." : "Save Social Links"}
                    </button>
                  </form>
                </div>
              )}

              {/* Danger Zone Tab */}
              {activeTab === "danger" && (
                <div>
                  <h2 className="text-2xl font-black text-red-600 mb-6 flex items-center gap-2">
                    <svg
                      className="w-7 h-7"
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
                    Danger Zone
                  </h2>

                  <div className="bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-red-600 mb-3">
                      Delete Account
                    </h3>
                    <p className="text-sm text-gray-700 mb-6">
                      Once you delete your account, there is no going back. This
                      will permanently delete all your projects, comments, and
                      data.
                    </p>
                    <button
                      onClick={handleDeleteAccount}
                      disabled={loading}
                      className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? "Deleting..." : "Delete My Account"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
