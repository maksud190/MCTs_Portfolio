// import express from "express";
// import { authMiddleware, adminMiddleware } from "../middleware/authMiddleware.js";
// import {
//   // Dashboard
//   getDashboardStats,
  
//   // Users
//   getAllUsersAdmin,
//   updateUserRole,
//   blockUser,
//   deleteUser,
  
//   // Projects
//   getAllProjectsAdmin,
//   approveProject,
//   toggleFeaturedProject,
//   deleteProjectAdmin,
  
//   // Comments
//   getAllComments,
//   deleteComment,
//   flagComment,
  
//   // Announcements
//   createAnnouncement,
//   getAllAnnouncements,
//   updateAnnouncement,
//   deleteAnnouncement,
  
//   // Categories
//   createCategory,
//   getAllCategories,
//   updateCategory,
//   deleteCategory,
  
//   // Settings
//   getSiteSettings,
//   updateSiteSettings
// } from "../controllers/adminController.js";

// const router = express.Router();

// // All routes require authentication + admin role
// router.use(authMiddleware, adminMiddleware);

// // ========================================
// // 📊 DASHBOARD
// // ========================================
// router.get("/dashboard/stats", getDashboardStats);

// // ========================================
// // 👥 USERS
// // ========================================
// router.get("/users", getAllUsersAdmin);
// router.put("/users/:userId/role", updateUserRole);
// router.put("/users/:userId/block", blockUser);
// router.delete("/users/:userId", deleteUser);

// // ========================================
// // 📁 PROJECTS
// // ========================================
// router.get("/projects", getAllProjectsAdmin);
// router.put("/projects/:projectId/approve", approveProject);
// router.put("/projects/:projectId/featured", toggleFeaturedProject);
// router.delete("/projects/:projectId", deleteProjectAdmin);

// // ========================================
// // 💬 COMMENTS
// // ========================================
// router.get("/comments", getAllComments);
// router.delete("/comments/:commentId", deleteComment);
// router.put("/comments/:commentId/flag", flagComment);

// // ========================================
// // 📢 ANNOUNCEMENTS
// // ========================================
// router.post("/announcements", createAnnouncement);
// router.get("/announcements", getAllAnnouncements);
// router.put("/announcements/:announcementId", updateAnnouncement);
// router.delete("/announcements/:announcementId", deleteAnnouncement);

// // ========================================
// // 📂 CATEGORIES
// // ========================================
// router.post("/categories", createCategory);
// router.get("/categories", getAllCategories);
// router.put("/categories/:categoryId", updateCategory);
// router.delete("/categories/:categoryId", deleteCategory);

// // ========================================
// // ⚙️ SETTINGS
// // ========================================
// router.get("/settings", getSiteSettings);
// router.put("/settings", updateSiteSettings);

// export default router;

























import express from "express";
import Project from "../models/projectModel.js";
import User from "../models/userModel.js";
import Notification from "../models/Notification.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// 🔥 Admin Middleware - Verify user is admin
const adminMiddleware = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user || user.role !== "admin") {
      return res.status(403).json({ 
        message: "Access denied. Admin privileges required." 
      });
    }
    
    next();
  } catch (err) {
    console.error("Admin middleware error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ========================================
// DASHBOARD ROUTES
// ========================================

// 🔥 GET - Dashboard Statistics
router.get("/dashboard/stats", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    console.log("📊 Dashboard stats route hit!");
    
    // Calculate date for "this week"
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // Get total counts
    const totalUsers = await User.countDocuments();
    const totalProjects = await Project.countDocuments();
    
    // Get new users this week
    const newUsersWeek = await User.countDocuments({
      createdAt: { $gte: oneWeekAgo }
    });

    // Get new projects this week
    const newProjectsWeek = await Project.countDocuments({
      createdAt: { $gte: oneWeekAgo }
    });

    // Calculate total comments
    const commentsResult = await Project.aggregate([
      { 
        $project: { 
          commentCount: { 
            $size: { $ifNull: ["$comments", []] } 
          } 
        } 
      },
      { 
        $group: { 
          _id: null, 
          total: { $sum: "$commentCount" } 
        } 
      }
    ]);
    const totalComments = commentsResult[0]?.total || 0;

    const pendingReports = 0; // Placeholder

    // Get most viewed projects
    const mostViewedProjects = await Project.find({ isApproved: true })
      .sort({ views: -1 })
      .limit(5)
      .populate("userId", "username avatar")
      .select("title thumbnail views userId")
      .lean();

    // Get most liked projects
    const mostLikedProjects = await Project.find({ isApproved: true })
      .sort({ likes: -1 })
      .limit(5)
      .populate("userId", "username avatar")
      .select("title thumbnail likes userId")
      .lean();

    console.log("✅ Dashboard data fetched successfully!");

    res.json({
      totalUsers,
      totalProjects,
      totalComments,
      pendingReports,
      newUsersWeek,
      newProjectsWeek,
      mostViewedProjects,
      mostLikedProjects
    });

  } catch (err) {
    console.error("❌ Dashboard stats error:", err);
    res.status(500).json({ 
      message: "Server error",
      error: err.message
    });
  }
});

// ========================================
// USER MANAGEMENT ROUTES
// ========================================

// 🔥 GET - Get all users with filters
router.get("/users", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 20, search = "", role = "" } = req.query;

    let query = {};

    // Search filter
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    // Role filter
    if (role) {
      query.role = role;
    }

    const users = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const count = await User.countDocuments(query);

    res.json({
      users,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      total: count,
    });
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// 🔥 PUT - Update user role
router.put("/users/:id/role", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { role } = req.body;

    if (!["student", "teacher", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.role = role;
    await user.save();

    // Create notification
    await Notification.create({
      recipient: user._id,
      sender: req.user.id,
      type: "role_updated",
      message: `Your account role has been updated to ${role}`,
      link: "/profile",
    });

    res.json({ message: "User role updated successfully", user });
  } catch (err) {
    console.error("Error updating role:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// 🔥 PUT - Block/Unblock user
router.put("/users/:id/block", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { isBlocked } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prevent blocking self
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({ message: "Cannot block yourself" });
    }

    user.isBlocked = isBlocked;
    await user.save();

    // Create notification
    if (isBlocked) {
      await Notification.create({
        recipient: user._id,
        sender: req.user.id,
        type: "account_blocked",
        message: "Your account has been blocked by an administrator",
        link: "/profile",
      });
    }

    res.json({
      message: `User ${isBlocked ? "blocked" : "unblocked"} successfully`,
      user,
    });
  } catch (err) {
    console.error("Error blocking user:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// 🔥 DELETE - Delete user
router.delete("/users/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prevent deleting self
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({ message: "Cannot delete yourself" });
    }

    // Delete user's projects
    await Project.deleteMany({ userId: user._id });

    // Delete user's notifications
    await Notification.deleteMany({
      $or: [{ recipient: user._id }, { sender: user._id }],
    });

    // Delete the user
    await User.findByIdAndDelete(req.params.id);

    res.json({ message: "User and associated data deleted successfully" });
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ========================================
// PROJECT MANAGEMENT ROUTES
// ========================================

// 🔥 GET all projects (admin view - includes pending)
router.get("/projects", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      search = "", 
      isApproved,
      approvalStatus 
    } = req.query;

    let query = {};

    // Search filter
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Approval filter (legacy support)
    if (isApproved !== undefined && isApproved !== "") {
      query.isApproved = isApproved === "true";
    }

    // Status filter (preferred)
    if (approvalStatus && approvalStatus !== "all") {
      query.approvalStatus = approvalStatus;
    }

    const projects = await Project.find(query)
      .populate("userId", "username avatar email")
      .populate("approvedBy", "username")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const count = await Project.countDocuments(query);

    // Get approval statistics
    const stats = await Project.aggregate([
      {
        $group: {
          _id: "$approvalStatus",
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({
      projects,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      total: count,
      stats: stats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {}),
    });
  } catch (err) {
    console.error("Error fetching admin projects:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// 🔥 PUT - Approve or Reject Project
router.put(
  "/projects/:id/approve",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const { isApproved, rejectionReason } = req.body;
      
      const project = await Project.findById(req.params.id)
        .populate("userId", "username email");

      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      // Update project approval status
      project.isApproved = isApproved;
      project.approvalStatus = isApproved ? "approved" : "rejected";
      project.approvedBy = req.user.id;
      project.approvedAt = new Date();

      if (!isApproved && rejectionReason) {
        project.rejectionReason = rejectionReason;
      } else if (isApproved) {
        project.rejectionReason = "";
      }

      await project.save();

      // Create notification for project owner
      let notificationMessage;
      let notificationType;
      let notificationLink;

      if (isApproved) {
        notificationMessage = `Your project "${project.title}" has been approved and is now visible to everyone! 🎉`;
        notificationType = "project_approved";
        notificationLink = `/project/${project._id}`;
      } else {
        notificationMessage = `Your project "${project.title}" was not approved.`;
        if (rejectionReason) {
          notificationMessage += ` Reason: ${rejectionReason}`;
        }
        notificationType = "project_rejected";
        notificationLink = "/profile";
      }

      await Notification.create({
        recipient: project.userId._id,
        sender: req.user.id,
        type: notificationType,
        project: project._id,
        message: notificationMessage,
        link: notificationLink,
      });

      res.json({
        message: `Project ${isApproved ? "approved" : "rejected"} successfully`,
        project: {
          _id: project._id,
          title: project.title,
          isApproved: project.isApproved,
          approvalStatus: project.approvalStatus,
          rejectionReason: project.rejectionReason,
        },
      });
    } catch (err) {
      console.error("Error updating project approval:", err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// 🔥 PUT - Toggle Featured Status
router.put(
  "/projects/:id/featured",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const project = await Project.findById(req.params.id);

      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      // Only approved projects can be featured
      if (!project.isApproved && !project.isFeatured) {
        return res.status(400).json({
          message: "Only approved projects can be featured",
        });
      }

      project.isFeatured = !project.isFeatured;
      await project.save();

      // Notify project owner if featured
      if (project.isFeatured) {
        await Notification.create({
          recipient: project.userId,
          sender: req.user.id,
          type: "project_featured",
          project: project._id,
          message: `Your project "${project.title}" has been featured! 🌟`,
          link: `/project/${project._id}`,
        });
      }

      res.json({
        message: `Project ${project.isFeatured ? "featured" : "unfeatured"} successfully`,
        project: {
          _id: project._id,
          isFeatured: project.isFeatured,
        },
      });
    } catch (err) {
      console.error("Error toggling featured:", err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// 🔥 DELETE - Delete Project (Admin)
router.delete(
  "/projects/:id",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const project = await Project.findById(req.params.id);

      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      // Delete project
      await Project.findByIdAndDelete(req.params.id);

      // Delete associated notifications
      await Notification.deleteMany({ project: req.params.id });

      // Notify project owner
      await Notification.create({
        recipient: project.userId,
        sender: req.user.id,
        type: "project_deleted",
        message: `Your project "${project.title}" has been removed by an admin`,
        link: "/profile",
      });

      res.json({ message: "Project deleted successfully" });
    } catch (err) {
      console.error("Error deleting project:", err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// 🔥 GET - Get project statistics (Admin Dashboard)
router.get("/projects/stats/overview", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const stats = await Project.aggregate([
      {
        $facet: {
          totalProjects: [{ $count: "count" }],
          approvalStatus: [
            {
              $group: {
                _id: "$approvalStatus",
                count: { $sum: 1 },
              },
            },
          ],
          featuredProjects: [
            {
              $match: { isFeatured: true },
            },
            { $count: "count" },
          ],
          recentProjects: [
            {
              $match: {
                createdAt: {
                  $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                },
              },
            },
            { $count: "count" },
          ],
          topProjects: [
            { $sort: { likes: -1 } },
            { $limit: 5 },
            {
              $project: {
                title: 1,
                likes: 1,
                views: 1,
                thumbnail: 1,
              },
            },
          ],
        },
      },
    ]);

    const result = stats[0];
    
    res.json({
      totalProjects: result.totalProjects[0]?.count || 0,
      pending: result.approvalStatus.find((s) => s._id === "pending")?.count || 0,
      approved: result.approvalStatus.find((s) => s._id === "approved")?.count || 0,
      rejected: result.approvalStatus.find((s) => s._id === "rejected")?.count || 0,
      featured: result.featuredProjects[0]?.count || 0,
      recentWeek: result.recentProjects[0]?.count || 0,
      topProjects: result.topProjects,
    });
  } catch (err) {
    console.error("Error fetching admin stats:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// 🔥 PUT - Bulk approve projects
router.put(
  "/projects/bulk/approve",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const { projectIds } = req.body;

      if (!projectIds || !Array.isArray(projectIds)) {
        return res.status(400).json({ message: "Invalid project IDs" });
      }

      const result = await Project.updateMany(
        { _id: { $in: projectIds } },
        {
          $set: {
            isApproved: true,
            approvalStatus: "approved",
            approvedBy: req.user.id,
            approvedAt: new Date(),
            rejectionReason: "",
          },
        }
      );

      // Create notifications for all approved projects
      const projects = await Project.find({ _id: { $in: projectIds } });
      
      for (const project of projects) {
        await Notification.create({
          recipient: project.userId,
          sender: req.user.id,
          type: "project_approved",
          project: project._id,
          message: `Your project "${project.title}" has been approved! 🎉`,
          link: `/project/${project._id}`,
        });
      }

      res.json({
        message: `${result.modifiedCount} projects approved successfully`,
        modifiedCount: result.modifiedCount,
      });
    } catch (err) {
      console.error("Error bulk approving:", err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// 🔥 PUT - Flag/Unflag comment (Admin)
router.put(
  "/projects/:projectId/comments/:commentId/flag",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const { projectId, commentId } = req.params;
      const { isFlagged, flagReason } = req.body;

      const project = await Project.findById(projectId);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      const comment = project.comments.id(commentId);
      
      if (!comment) {
        return res.status(404).json({ message: "Comment not found" });
      }

      comment.isFlagged = isFlagged;
      comment.flagReason = flagReason || "";
      
      await project.save();

      res.json({
        message: `Comment ${isFlagged ? "flagged" : "unflagged"} successfully`,
        comment,
      });
    } catch (err) {
      console.error("Error flagging comment:", err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

export default router;