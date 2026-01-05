import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Protected Route component - শুধুমাত্র logged in user access করতে পারবে
export default function ProtectedRoute({ children }) {
  const { user } = useAuth(); // AuthContext থেকে user check করা

  // যদি user না থাকে (logout করা থাকে), তাহলে login page এ redirect
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // User থাকলে requested page/component render করা
  return children;
}