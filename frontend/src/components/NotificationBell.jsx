import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API } from "../api/api";
import { useAuth } from "../context/AuthContext";

export default function NotificationBell() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [messages, setMessages] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeTab, setActiveTab] = useState("notifications");
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      fetchMessages();
      const interval = setInterval(() => {
        fetchNotifications();
        fetchMessages();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // 🔥 FIX: Define updateUnreadCount function BEFORE using it
  const updateUnreadCount = (notifs = notifications, msgs = messages) => {
    const unreadNotifs = notifs.filter((n) => !n.read).length;
    const unreadMsgs = msgs.filter((m) => !m.isRead).length;
    setUnreadCount(unreadNotifs + unreadMsgs);
  };

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await API.get("/users/notifications/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(res.data);
      updateUnreadCount(res.data, messages);
    } catch (err) {
      console.error("Fetch notifications error:", err);
      setNotifications([]);
    }
  };

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await API.get("/users/contact/inbox", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages(res.data);
      updateUnreadCount(notifications, res.data);
    } catch (err) {
      console.error("Fetch messages error:", err);
      setMessages([]);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem("token");
      await API.put(
        `/users/notifications/${notificationId}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchNotifications();
    } catch (err) {
      console.error("Mark as read error:", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem("token");
      
      if (activeTab === "notifications") {
        await API.put(
          "/users/notifications/read-all",
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        fetchNotifications();
      } else {
        const unreadMessages = messages.filter(m => !m.isRead);
        await Promise.all(
          unreadMessages.map(msg =>
            API.patch(`/users/contact/${msg._id}/read`, {}, {
              headers: { Authorization: `Bearer ${token}` }
            })
          )
        );
        fetchMessages();
      }
    } catch (err) {
      console.error("Mark all as read error:", err);
    }
  };

  const markMessageAsRead = async (messageId) => {
    try {
      const token = localStorage.getItem("token");
      await API.patch(`/users/contact/${messageId}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchMessages();
    } catch (err) {
      console.error("Mark message as read error:", err);
    }
  };

  const handleNotificationClick = (notification) => {
    markAsRead(notification._id);
    setShowDropdown(false);

    if (notification.type === "follow") {
      navigate(`/user/${notification.from._id}`);
    } else if (notification.project) {
      navigate(`/project/${notification.project._id}`);
    }
  };

  const handleMessageClick = (message) => {
    markMessageAsRead(message._id);
    setShowDropdown(false);
    navigate("/messages");
  };

  const formatDate = (date) => {
    const now = new Date();
    const notifDate = new Date(date);
    const diffTime = Math.abs(now - notifDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffTime / (1000 * 60));
        return diffMinutes <= 1 ? "Just now" : `${diffMinutes}m ago`;
      }
      return `${diffHours}h ago`;
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return notifDate.toLocaleDateString();
    }
  };

  const getNotificationIcon = (type) => {
    const icons = {
      like: (
        <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
        </svg>
      ),
      comment: (
        <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      follow: (
        <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      upload: (
        <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      ),
    };
    return icons[type] || (
      <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    );
  };

  const getTabUnreadCount = (tab) => {
    if (tab === "notifications") {
      return notifications.filter(n => !n.read).length;
    } else {
      return messages.filter(m => !m.isRead).length;
    }
  };

  if (!user) return null;

  return (
    <div className="relative">
      {/* Bell Icon Button */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-gray-700 shadow-sm  hover:bg-gray-100 rounded-xl transition-all focus:outline-none"
      >
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
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-600 to-pink-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {showDropdown && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowDropdown(false)}
          ></div>

          {/* Dropdown Panel */}
          <div className="absolute right-0 mt-2 w-[90vw] sm:w-96 bg-white rounded-2xl shadow-2xl z-50 max-h-[70vh] sm:max-h-[500px] overflow-hidden flex flex-col border border-gray-200">
            {/* Header with Tabs */}
            <div className="p-3 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-black text-gray-900">
                  Activity
                </h3>
                {((activeTab === "notifications" && getTabUnreadCount("notifications") > 0) ||
                  (activeTab === "messages" && getTabUnreadCount("messages") > 0)) && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              {/* Tabs */}
              <div className="flex gap-2 bg-white rounded-xl p-1">
                <button
                  onClick={() => setActiveTab("notifications")}
                  className={`flex-1 px-4 py-2 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                    activeTab === "notifications"
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  Notifications
                  {getTabUnreadCount("notifications") > 0 && (
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                      activeTab === "notifications" 
                        ? "bg-white text-blue-600" 
                        : "bg-blue-600 text-white"
                    }`}>
                      {getTabUnreadCount("notifications")}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab("messages")}
                  className={`flex-1 px-4 py-2 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                    activeTab === "messages"
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Messages
                  {getTabUnreadCount("messages") > 0 && (
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                      activeTab === "messages" 
                        ? "bg-white text-blue-600" 
                        : "bg-blue-600 text-white"
                    }`}>
                      {getTabUnreadCount("messages")}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Content - Notifications Tab */}
            {activeTab === "notifications" && (
              <div className="overflow-y-auto flex-1">
                {notifications.length > 0 ? (
                  notifications.map((notif) => (
                    <div
                      key={notif._id}
                      onClick={() => handleNotificationClick(notif)}
                      className={`p-4 border-b border-gray-100 hover:bg-blue-50 cursor-pointer transition-all group ${
                        !notif.read ? "bg-blue-50/50" : ""
                      }`}
                    >
                      <div className="flex gap-3">
                        <div className="flex-shrink-0">
                          {notif.from?.avatar ? (
                            <img
                              src={notif.from.avatar}
                              alt={notif.from.username}
                              className="w-10 h-10 rounded-xl object-cover border-2 border-white shadow-md"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold border-2 border-white shadow-md">
                              {notif.from?.username?.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <p className="text-sm text-gray-700 break-words">
                              <span className="font-bold text-gray-900">
                                {notif.from?.username}
                              </span>{" "}
                              {notif.message}
                            </p>
                            <div className="flex-shrink-0">
                              {getNotificationIcon(notif.type)}
                            </div>
                          </div>

                          {notif.project?.thumbnail && (
                            <img
                              src={notif.project.thumbnail}
                              alt={notif.project.title}
                              className="mt-2 w-full h-20 object-cover rounded-xl border border-gray-200"
                            />
                          )}

                          <div className="flex items-center justify-between mt-2">
                            <p className="text-xs text-gray-500 font-medium">
                              {formatDate(notif.createdAt)}
                            </p>
                            {!notif.read && (
                              <div className="flex items-center gap-1">
                                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                <span className="text-xs font-semibold text-blue-600">New</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-12 text-center">
                    <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center">
                      <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">No notifications yet</h3>
                    <p className="text-sm text-gray-500">
                      When you get notifications, they'll show up here
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Content - Messages Tab */}
            {activeTab === "messages" && (
              <div className="overflow-y-auto flex-1">
                {messages.length > 0 ? (
                  messages.map((msg) => (
                    <div
                      key={msg._id}
                      onClick={() => handleMessageClick(msg)}
                      className={`p-4 border-b border-gray-100 hover:bg-blue-50 cursor-pointer transition-all group ${
                        !msg.isRead ? "bg-blue-50/50" : ""
                      }`}
                    >
                      <div className="flex gap-3">
                        <div className="flex-shrink-0">
                          {msg.senderId?.avatar ? (
                            <img
                              src={msg.senderId.avatar}
                              alt={msg.senderId.username}
                              className="w-10 h-10 rounded-xl object-cover border-2 border-white shadow-md"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center text-white font-bold border-2 border-white shadow-md">
                              {msg.senderId?.username?.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-gray-900 truncate">
                                {msg.senderId?.username}
                              </p>
                              <p className="text-sm font-semibold text-gray-700 truncate">
                                {msg.subject}
                              </p>
                            </div>
                            <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                          </div>

                          <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                            {msg.message}
                          </p>

                          <div className="flex items-center justify-between">
                            <p className="text-xs text-gray-500 font-medium">
                              {formatDate(msg.createdAt)}
                            </p>
                            {!msg.isRead && (
                              <div className="flex items-center gap-1">
                                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                                <span className="text-xs font-semibold text-green-600">New</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-12 text-center">
                    <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center">
                      <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">No messages yet</h3>
                    <p className="text-sm text-gray-500">
                      When you receive messages, they'll appear here
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}