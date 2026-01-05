import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        console.log("✅ User loaded from localStorage:", parsedUser);
        setUser(parsedUser);
      } catch (err) {
        console.error("❌ Error parsing user:", err);
        localStorage.removeItem("user");
      }
    }
  }, []);

  const login = (data) => {
    const userData = data.user || data;
    const token = data.token;
    
    console.log("✅ Login with user data:", userData);
    
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    
    if (token) {
      localStorage.setItem("token", token);
    }
  };

  const logout = () => {
    console.log("✅ Logging out");
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  // ✅ FIXED: Update user - properly merges all fields including role, designation, department
  const updateUser = (updatedData) => {
    console.log("🔄 Before update - Current user:", user);
    console.log("🔄 Update data received:", updatedData);
    
    // ✅ Merge old user data with new data, ensuring all fields are preserved
    const newUser = {
      ...user,                    // Keep all existing fields
      ...updatedData,             // Override with new data
      // ✅ Explicitly ensure these fields are included
      role: updatedData.role || user?.role || "student",
      designation: updatedData.designation !== undefined 
        ? updatedData.designation 
        : (user?.designation || ""),
      department: updatedData.department || user?.department || "Multimedia and Creative Technology",
      socialLinks: updatedData.socialLinks || user?.socialLinks || {
        linkedin: "",
        github: "",
        behance: "",
        portfolio: "",
        twitter: "",
        instagram: "",
        facebook: "",
      },
    };
    
    console.log("✅ After update - New user:", newUser);
    console.log("🔍 Role:", newUser.role);
    console.log("🔍 Designation:", newUser.designation);
    console.log("🔍 Department:", newUser.department);
    
    setUser(newUser);
    localStorage.setItem("user", JSON.stringify(newUser));
    
    console.log("💾 Saved to localStorage");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};