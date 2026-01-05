import { useState, useEffect } from "react";
import { API } from "../api/api";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function FollowButton({ targetUserId, onFollowChange }) {
  const { user } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);

  useEffect(() => {
    if (user && targetUserId && user._id !== targetUserId) {
      checkFollowStatus();
    }
  }, [user, targetUserId]);

  const checkFollowStatus = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await API.get(`/users/follow-status/${targetUserId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsFollowing(res.data.isFollowing);
    } catch (err) {
      console.error("Check follow status error:", err);
    }
  };

  const handleFollow = async () => {
    if (!user) {
      toast.error("Please login to follow users");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await API.post(
        `/users/follow/${targetUserId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setIsFollowing(res.data.isFollowing);
      setFollowerCount(res.data.followersCount);
      
      toast.success(res.data.message);
      
      if (onFollowChange) {
        onFollowChange(res.data);
      }
    } catch (err) {
      console.error("Follow error:", err);
      toast.error(err.response?.data?.message || "Failed to follow");
    } finally {
      setLoading(false);
    }
  };

  // Don't show button if viewing own profile
  if (!user || !targetUserId || user._id === targetUserId) {
    return null;
  }

  return (
    <button
      onClick={handleFollow}
      disabled={loading}
      className={`px-4 py-2 rounded-lg font-medium transition-all ${
        isFollowing
          ? "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
          : "bg-amber-400 hover:bg-amber-500 text-white"
      } disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {loading ? "..." : isFollowing ? "Following" : "Follow"}
    </button>
  );
}