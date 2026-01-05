// import { useState, useEffect } from "react";
// import { API } from "../api/api";
// import { Link, useNavigate } from "react-router-dom";
// import { useAuth } from "../context/AuthContext";
// import { toast } from 'sonner';

// export default function Register() {
//   const [form, setForm] = useState({
//     username: "",
//     email: "",
//     password: "",
//     role: "student",
//     designation: "",
//     department: "Multimedia and Creative Technology",
//   });
//   const [loading, setLoading] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);
//   const [passwordStrength, setPasswordStrength] = useState(0);
//   const { user } = useAuth();
//   const navigate = useNavigate();

//   useEffect(() => {
//     if (user) {
//       navigate("/profile");
//     }
//   }, [user, navigate]);

//   useEffect(() => {
//     const calculateStrength = () => {
//       let strength = 0;
//       if (form.password.length >= 6) strength += 25;
//       if (form.password.length >= 8) strength += 25;
//       if (/[a-z]/.test(form.password) && /[A-Z]/.test(form.password))
//         strength += 25;
//       if (/[0-9]/.test(form.password)) strength += 25;
//       setPasswordStrength(strength);
//     };
//     calculateStrength();
//   }, [form.password]);

//   const getStrengthColor = () => {
//     if (passwordStrength <= 25) return "bg-red-500";
//     if (passwordStrength <= 50) return "bg-orange-500";
//     if (passwordStrength <= 75) return "bg-yellow-500";
//     return "bg-green-500";
//   };

//   const getStrengthText = () => {
//     if (passwordStrength <= 25) return "Weak";
//     if (passwordStrength <= 50) return "Fair";
//     if (passwordStrength <= 75) return "Good";
//     return "Strong";
//   };

//   const designationOptions = {
//     teacher: [
//       "Professor",
//       "Associate Professor",
//       "Assistant Professor",
//       "Senior Lecturer",
//       "Lecturer",
//       "Instructor",
//       "Lab Instructor",
//       "Teaching Assistant",
//     ],
//     student: [
//       "Undergraduate Student",
//       "Graduate Student",
//       "Final Year Student",
//       "Research Assistant",
//       "Teaching Assistant",
//     ],
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (form.password.length < 6) {
//       toast.error("Password must be at least 6 characters");
//       return;
//     }

//     setLoading(true);

//     try {
//       await API.post("/users/register", form);

//       toast.success("Registration successful! Please login 🎉", {
//         autoClose: 4000,
//       });

//       setForm({
//         username: "",
//         email: "",
//         password: "",
//         role: "student",
//         designation: "",
//         department: "Multimedia and Creative Technology",
//       });

//       setTimeout(() => {
//         navigate("/login");
//       }, 1500);
//     } catch (err) {
//       console.error("Registration error:", err);
//       toast.error(
//         err.response?.data?.message || "Registration failed. Please try again."
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden pb-40 pt-20">
//       {/* Animated Background Blobs */}
//       <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
//       <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-blob animation-delay-2000"></div>
//       <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>

//       {/* Main Container */}
//       <div className="max-w-2xl w-full relative z-10">
//         {/* Decorative Badge */}
//         <div className="flex justify-center mb-6">
//           <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg border border-gray-200">
//             <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
//             </svg>
//             <span className="text-sm font-semibold text-gray-700">Create Your Account</span>
//           </div>
//         </div>

//         {/* Header */}
//         <div className="text-center mb-8">
//           <h1 className="text-5xl font-black text-gray-900 mb-3 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
//             Join MCT Portfolio
//           </h1>
//           <p className="text-lg text-gray-600">
//             Showcase your creative work and connect with the community
//           </p>
//         </div>

//         {/* Form Card */}
//         <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-8">
//           <form onSubmit={handleSubmit} className="space-y-6">
//             {/* Two Column Layout for Username & Email */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               {/* Username Input */}
//               <div>
//                 <label htmlFor="username" className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-2">
//                   <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
//                   </svg>
//                   Username
//                   <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   id="username"
//                   type="text"
//                   placeholder="johndoe"
//                   className="w-full px-4 py-3.5 text-gray-900 bg-white border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all placeholder-gray-400 hover:border-gray-300"
//                   value={form.username}
//                   onChange={(e) => setForm({ ...form, username: e.target.value })}
//                   required
//                   disabled={loading}
//                 />
//               </div>

//               {/* Email Input */}
//               <div>
//                 <label htmlFor="email" className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-2">
//                   <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
//                   </svg>
//                   Email Address
//                   <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   id="email"
//                   type="email"
//                   placeholder="john@example.com"
//                   className="w-full px-4 py-3.5 text-gray-900 bg-white border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all placeholder-gray-400 hover:border-gray-300"
//                   value={form.email}
//                   onChange={(e) => setForm({ ...form, email: e.target.value })}
//                   required
//                   disabled={loading}
//                 />
//               </div>
//             </div>

//             {/* Two Column Layout for Role & Designation */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               {/* Role Selection */}
//               <div>
//                 <label htmlFor="role" className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-2">
//                   <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
//                   </svg>
//                   I am a
//                   <span className="text-red-500">*</span>
//                 </label>
//                 <select
//                   id="role"
//                   value={form.role}
//                   onChange={(e) => {
//                     setForm({ ...form, role: e.target.value, designation: "" });
//                   }}
//                   className="w-full px-4 py-3.5 text-gray-900 bg-white border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all hover:border-gray-300 cursor-pointer"
//                   required
//                   disabled={loading}
//                 >
//                   <option value="student">Student</option>
//                   <option value="teacher">Teacher/Instructor</option>
//                 </select>
//               </div>

//               {/* Designation Selection */}
//               <div>
//                 <label htmlFor="designation" className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-2">
//                   <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//                   </svg>
//                   Designation
//                   <span className="text-red-500">*</span>
//                 </label>
//                 <select
//                   id="designation"
//                   value={form.designation}
//                   onChange={(e) => setForm({ ...form, designation: e.target.value })}
//                   className="w-full px-4 py-3.5 text-gray-900 bg-white border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all hover:border-gray-300 cursor-pointer"
//                   required
//                   disabled={loading}
//                 >
//                   <option value="">Select your designation</option>
//                   {designationOptions[form.role].map((designation) => (
//                     <option key={designation} value={designation}>
//                       {designation}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//             </div>

//             {/* Department */}
//             <div>
//               <label htmlFor="department" className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-2">
//                 <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
//                 </svg>
//                 Department
//                 <span className="text-red-500">*</span>
//               </label>
//               <input
//                 id="department"
//                 type="text"
//                 value={form.department}
//                 onChange={(e) => setForm({ ...form, department: e.target.value })}
//                 className="w-full px-4 py-3.5 text-gray-900 bg-white border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all placeholder-gray-400 hover:border-gray-300"
//                 required
//                 disabled={loading}
//               />
//             </div>

//             {/* Password Input */}
//             <div>
//               <label htmlFor="password" className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-2">
//                 <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
//                 </svg>
//                 Password
//                 <span className="text-red-500">*</span>
//               </label>
//               <div className="relative group">
//                 <input
//                   id="password"
//                   type={showPassword ? "text" : "password"}
//                   placeholder="Create a strong password"
//                   className="w-full px-4 py-3.5 text-gray-900 bg-white border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all placeholder-gray-400 group-hover:border-gray-300 pr-12"
//                   value={form.password}
//                   onChange={(e) => setForm({ ...form, password: e.target.value })}
//                   required
//                   disabled={loading}
//                   minLength={6}
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShowPassword(!showPassword)}
//                   className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-blue-600 transition-colors"
//                 >
//                   {showPassword ? (
//                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
//                     </svg>
//                   ) : (
//                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
//                     </svg>
//                   )}
//                 </button>
//               </div>

//               {/* Password Strength Indicator */}
//               {form.password && (
//                 <div className="mt-3 bg-gradient-to-br from-blue-50 to-indigo-50 p-3 rounded-xl border border-blue-100">
//                   <div className="flex items-center justify-between mb-2">
//                     <span className="text-xs font-semibold text-gray-700">
//                       Password Strength
//                     </span>
//                     <span
//                       className={`text-xs font-bold px-2 py-0.5 rounded-full ${
//                         passwordStrength <= 25
//                           ? "bg-red-100 text-red-700"
//                           : passwordStrength <= 50
//                           ? "bg-orange-100 text-orange-700"
//                           : passwordStrength <= 75
//                           ? "bg-yellow-100 text-yellow-700"
//                           : "bg-green-100 text-green-700"
//                       }`}
//                     >
//                       {getStrengthText()}
//                     </span>
//                   </div>
//                   <div className="w-full bg-gray-200 rounded-full h-2.5">
//                     <div
//                       className={`h-2.5 rounded-full transition-all duration-300 ${getStrengthColor()}`}
//                       style={{ width: `${passwordStrength}%` }}
//                     ></div>
//                   </div>
//                   <p className="text-xs text-gray-600 mt-2">
//                     Use 8+ characters with mix of letters, numbers & symbols
//                   </p>
//                 </div>
//               )}
//             </div>

//             {/* Submit Button */}
//             <button
//               type="submit"
//               disabled={loading}
//               className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-lg flex items-center justify-center gap-2"
//             >
//               {loading ? (
//                 <>
//                   <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
//                   <span>Creating your account...</span>
//                 </>
//               ) : (
//                 <>
//                   <span>Create Account</span>
//                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
//                   </svg>
//                 </>
//               )}
//             </button>

//             {/* Divider */}
//             <div className="relative">
//               <div className="absolute inset-0 flex items-center">
//                 <div className="w-full border-t border-gray-300"></div>
//               </div>
//               <div className="relative flex justify-center text-sm">
//                 <span className="px-4 bg-white text-gray-500 font-medium">
//                   Already have an account?
//                 </span>
//               </div>
//             </div>

//             {/* Login Link */}
//             <a
//               href="/login"
//               className="w-full flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 font-bold py-4 px-6 rounded-xl border-2 border-gray-200 hover:border-blue-500 transition-all shadow-md hover:shadow-lg"
//             >
//               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
//               </svg>
//               <span>Sign In Instead</span>
//             </a>
//           </form>
//         </div>

//         {/* Footer Info */}
//         <div className="mt-6 text-center">
//           <p className="text-sm text-gray-600 bg-white/60 backdrop-blur-sm rounded-full px-4 py-2 inline-block border border-gray-200">
//             Showcase your MCT projects to the world
//           </p>
//         </div>
//       </div>

//       {/* Custom Animation Styles */}
//       <style>{`
//         @keyframes blob {
//           0% {
//             transform: translate(0px, 0px) scale(0.9);
//           }
//           33% {
//             transform: translate(30px, -50px) scale(1.1);
//           }
//           66% {
//             transform: translate(-20px, 20px) scale(0.9);
//           }
//           100% {
//             transform: translate(0px, 0px) scale(1);
//           }
//         }

//         .animate-blob {
//           animation: blob 5s infinite;
//         }

//         .animation-delay-2000 {
//           animation-delay: 2s;
//         }

//         .animation-delay-4000 {
//           animation-delay: 4s;
//         }
//       `}</style>
//     </div>
//   );
// }



























import { useState, useEffect } from "react";
import { API } from "../api/api";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";

export default function Register() {
  const [form, setForm] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    role: "student",
    designation: "",
    department: "Multimedia and Creative Technology",
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  // username real-time check
  const [usernameStatus, setUsernameStatus] = useState(null); // null | 'checking' | 'available' | 'taken' | 'invalid' | 'error'
  const [usernameMessage, setUsernameMessage] = useState("");

  const { user } = useAuth();
  const navigate = useNavigate();

  // already logged-in hole redirect
  useEffect(() => {
    if (user?.username) {
      navigate(`/profile/${encodeURIComponent(user.username)}`);
    }
  }, [user, navigate]);

  // password strength
  useEffect(() => {
    let strength = 0;
    if (form.password.length >= 6) strength += 25;
    if (form.password.length >= 8) strength += 25;
    if (/[a-z]/.test(form.password) && /[A-Z]/.test(form.password))
      strength += 25;
    if (/[0-9]/.test(form.password)) strength += 25;
    setPasswordStrength(strength);
  }, [form.password]);

  const getStrengthColor = () => {
    if (passwordStrength <= 25) return "bg-red-500";
    if (passwordStrength <= 50) return "bg-orange-500";
    if (passwordStrength <= 75) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getStrengthText = () => {
    if (passwordStrength <= 25) return "Weak";
    if (passwordStrength <= 50) return "Fair";
    if (passwordStrength <= 75) return "Good";
    return "Strong";
  };

  // username validation (frontend)
  const isUsernameLocallyValid = (username) => {
    // 3–20 chars, letters, numbers, underscore, dot
    return /^[a-zA-Z0-9_.]{3,20}$/.test(username);
  };

  // real-time username availability check (debounced)
  useEffect(() => {
    const username = form.username.trim();

    if (!username) {
      setUsernameStatus(null);
      setUsernameMessage("");
      return;
    }

    if (!isUsernameLocallyValid(username)) {
      setUsernameStatus("invalid");
      setUsernameMessage(
        "Username must be 3–20 characters and can only contain letters, numbers, dots and underscores."
      );
      return;
    }

    setUsernameStatus("checking");
    setUsernameMessage("Checking availability...");

    const timeoutId = setTimeout(async () => {
      try {
        const res = await API.get("/users/check-username", {
          params: { username },
        });

        if (res.data?.available) {
          setUsernameStatus("available");
          setUsernameMessage("✅ Username is available");
        } else {
          setUsernameStatus("taken");
          setUsernameMessage("❌ Username is already taken");
        }
      } catch (err) {
        console.error("Username check error:", err);
        setUsernameStatus("error");
        setUsernameMessage("Couldn't verify username. Try again.");
      }
    }, 500); // 0.5s debounce

    return () => clearTimeout(timeoutId);
  }, [form.username]);

  const designationOptions = {
    teacher: [
      "Professor",
      "Associate Professor",
      "Assistant Professor",
      "Senior Lecturer",
      "Lecturer",
      "Instructor",
      "Lab Instructor",
      "Teaching Assistant",
    ],
    student: [
      "Undergraduate Student",
      "Graduate Student",
      "Final Year Student",
      "Research Assistant",
      "Teaching Assistant",
    ],
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.fullName.trim()) {
      toast.error("Please enter your full name");
      return;
    }

    if (!isUsernameLocallyValid(form.username.trim())) {
      toast.error(
        "Username must be 3–20 characters and can only contain letters, numbers, dots and underscores."
      );
      return;
    }

    if (usernameStatus === "taken") {
      toast.error("This username is already taken. Please choose another.");
      return;
    }

    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      await API.post("/users/register", {
        fullName: form.fullName.trim(),
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role,
        designation: form.designation,
        department: form.department.trim(),
      });

      toast.success("Registration successful! Please login 🎉");

      setForm({
        fullName: "",
        username: "",
        email: "",
        password: "",
        role: "student",
        designation: "",
        department: "Multimedia and Creative Technology",
      });
      setUsernameStatus(null);
      setUsernameMessage("");

      setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch (err) {
      console.error("Registration error:", err);
      toast.error(
        err.response?.data?.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden pb-40 pt-20">
      {/* Animated Background Blobs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>

      {/* Main Container */}
      <div className="max-w-2xl w-full relative z-10">
        {/* Decorative Badge */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg border border-gray-200">
            <svg
              className="w-5 h-5 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-sm font-semibold text-gray-700">
              Create Your Account
            </span>
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-black text-gray-900 mb-3 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
            Join MCT Portfolio
          </h1>
          <p className="text-lg text-gray-600">
            Showcase your creative work and connect with the community
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name & Username */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div>
                <label
                  htmlFor="fullName"
                  className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-2"
                >
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
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  Full Name
                  <span className="text-red-500">*</span>
                </label>
                <input
                  id="fullName"
                  type="text"
                  placeholder="John Doe"
                  className="w-full px-4 py-3.5 text-gray-900 bg-white border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all placeholder-gray-400 hover:border-gray-300"
                  value={form.fullName}
                  onChange={(e) =>
                    setForm({ ...form, fullName: e.target.value })
                  }
                  required
                  disabled={loading}
                />
              </div>

              {/* Username */}
              <div>
                <label
                  htmlFor="username"
                  className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-2"
                >
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
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  Username
                  <span className="text-red-500">*</span>
                </label>
                <input
                  id="username"
                  type="text"
                  placeholder="johndoe"
                  className="w-full px-4 py-3.5 text-gray-900 bg-white border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all placeholder-gray-400 hover:border-gray-300"
                  value={form.username}
                  onChange={(e) =>
                    setForm({ ...form, username: e.target.value })
                  }
                  required
                  disabled={loading}
                />

                {/* Username status message */}
                {form.username && (
                  <p
                    className={`mt-1 text-xs ${
                      usernameStatus === "available"
                        ? "text-green-600"
                        : usernameStatus === "taken" ||
                          usernameStatus === "invalid"
                        ? "text-red-600"
                        : usernameStatus === "checking"
                        ? "text-gray-500"
                        : "text-gray-500"
                    }`}
                  >
                    {usernameMessage}
                  </p>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-2"
              >
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
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                Email Address
                <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                type="email"
                placeholder="john@example.com"
                className="w-full px-4 py-3.5 text-gray-900 bg-white border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all placeholder-gray-400 hover:border-gray-300"
                value={form.email}
                onChange={(e) =>
                  setForm({ ...form, email: e.target.value })
                }
                required
                disabled={loading}
              />
            </div>

            {/* Role & Designation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Role Selection */}
              <div>
                <label
                  htmlFor="role"
                  className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-2"
                >
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
                      d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  I am a
                  <span className="text-red-500">*</span>
                </label>
                <select
                  id="role"
                  value={form.role}
                  onChange={(e) =>
                    setForm({ ...form, role: e.target.value, designation: "" })
                  }
                  className="w-full px-4 py-3.5 text-gray-900 bg-white border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all hover:border-gray-300 cursor-pointer"
                  required
                  disabled={loading}
                >
                  <option value="student">Student</option>
                  <option value="teacher">Teacher/Instructor</option>
                </select>
              </div>

              {/* Designation Selection */}
              <div>
                <label
                  htmlFor="designation"
                  className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-2"
                >
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
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Designation
                  <span className="text-red-500">*</span>
                </label>
                <select
                  id="designation"
                  value={form.designation}
                  onChange={(e) =>
                    setForm({ ...form, designation: e.target.value })
                  }
                  className="w-full px-4 py-3.5 text-gray-900 bg-white border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all hover:border-gray-300 cursor-pointer"
                  required
                  disabled={loading}
                >
                  <option value="">Select your designation</option>
                  {designationOptions[form.role].map((designation) => (
                    <option key={designation} value={designation}>
                      {designation}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Department */}
            <div>
              <label
                htmlFor="department"
                className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-2"
              >
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
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
                Department
                <span className="text-red-500">*</span>
              </label>
              <input
                id="department"
                type="text"
                value={form.department}
                onChange={(e) =>
                  setForm({ ...form, department: e.target.value })
                }
                className="w-full px-4 py-3.5 text-gray-900 bg-white border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all placeholder-gray-400 hover:border-gray-300"
                required
                disabled={loading}
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-2"
              >
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
                Password
                <span className="text-red-500">*</span>
              </label>
              <div className="relative group">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  className="w-full px-4 py-3.5 text-gray-900 bg-white border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all placeholder-gray-400 group-hover:border-gray-300 pr-12"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  required
                  disabled={loading}
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-blue-600 transition-colors"
                >
                  {showPassword ? (
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
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                      />
                    </svg>
                  ) : (
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
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {form.password && (
                <div className="mt-3 bg-gradient-to-br from-blue-50 to-indigo-50 p-3 rounded-xl border border-blue-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-gray-700">
                      Password Strength
                    </span>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        passwordStrength <= 25
                          ? "bg-red-100 text-red-700"
                          : passwordStrength <= 50
                          ? "bg-orange-100 text-orange-700"
                          : passwordStrength <= 75
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {getStrengthText()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full transition-all duration-300 ${getStrengthColor()}`}
                      style={{ width: `${passwordStrength}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    Use 8+ characters with mix of letters, numbers & symbols
                  </p>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || usernameStatus === "checking"}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-lg flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Creating your account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
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
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </>
              )}
            </button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500 font-medium">
                  Already have an account?
                </span>
              </div>
            </div>

            {/* Login Link */}
            <Link
              to="/login"
              className="w-full flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 font-bold py-4 px-6 rounded-xl border-2 border-gray-200 hover:border-blue-500 transition-all shadow-md hover:shadow-lg"
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
                  d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                />
              </svg>
              <span>Sign In Instead</span>
            </Link>
          </form>
        </div>

        {/* Footer Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 bg-white/60 backdrop-blur-sm rounded-full px-4 py-2 inline-block border border-gray-200">
            Showcase your MCT projects to the world
          </p>
        </div>
      </div>

      {/* Custom Animation Styles */}
      <style>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(0.9);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }

        .animate-blob {
          animation: blob 5s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
