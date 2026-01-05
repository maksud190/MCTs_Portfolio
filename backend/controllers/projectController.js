import Project from "../models/projectModel.js";
import User from "../models/userModel.js";
import cloudinary from "../config/cloudinary.js";


// ✅ Upload new project - FIXED VERSION
export const uploadProject = async (req, res) => {
  try {
    const { title, description, category, userId } = req.body;

    console.log("📥 Upload request:", { title, category, userId, files: req.files });

    if (!userId || userId === "undefined" || userId === "null") {
      return res.status(400).json({ message: "User ID is required and must be valid" });
    }

    if (!title || !description || !category) {
      return res.status(400).json({ message: "Please fill all required fields" });
    }

    const thumbnailFile = req.files?.thumbnail?.[0];
    const additionalFiles = req.files?.files || [];

    if (!thumbnailFile) {
      return res.status(400).json({ message: "Thumbnail is required" });
    }

    const allFiles = [thumbnailFile, ...additionalFiles];
    console.log("📁 Uploading files:", allFiles.length);

    const uploadPromises = allFiles.map((file) =>
      cloudinary.uploader.upload(file.path)
    );
    
    const uploadResults = await Promise.all(uploadPromises);
    const imageUrls = uploadResults.map((result) => result.secure_url);

    console.log("✅ Uploaded URLs:", imageUrls.length);

    // 🔥 FIX: Explicitly set approval status to pending
    const project = await Project.create({
      userId: userId.trim(),
      title: title.trim(),
      description: description.trim(),
      category: category.trim(),
      thumbnail: imageUrls[0],
      images: imageUrls,
      // 🔥 IMPORTANT: Set these explicitly
      isApproved: false,
      approvalStatus: "pending",
    });

    console.log("✅ Project created successfully:", project._id);
    console.log("📊 Project status:", {
      isApproved: project.isApproved,
      approvalStatus: project.approvalStatus
    });

    res.json({ 
      message: "Project uploaded successfully! Waiting for admin approval.", 
      project 
    });
  } catch (err) {
    console.error("❌ Upload error:", err);
    res.status(500).json({ 
      message: err.message,
      error: process.env.NODE_ENV === 'development' ? err.toString() : undefined
    });
  }
};

// ✅ Get all projects
export const getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find()
      .populate("userId", "username email avatar")
      .sort({ createdAt: -1 });
    
    console.log("📦 Fetched projects:", projects.length);
    res.json(projects);
  } catch (err) {
    console.error("❌ Get all projects error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// ✅ Get user projects
export const getUserProjects = async (req, res) => {
  try {
    const { userId } = req.params;
    
    console.log("📦 Fetching projects for user:", userId);
    
    const projects = await Project.find({ userId })
      .populate("userId", "username email avatar")
      .sort({ createdAt: -1 });
    
    console.log("✅ Found projects:", projects.length);
    res.json(projects);
  } catch (err) {
    console.error("❌ Get user projects error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// ✅ Get single project
export const getProjectById = async (req, res) => {
  try {
    const { projectId } = req.params;
    
    const project = await Project.findById(projectId)
      .populate("userId", "username email avatar");
    
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    
    res.json(project);
  } catch (err) {
    console.error("❌ Get project error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// ✅ Increment view with history tracking
export const incrementView = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    project.views = (project.views || 0) + 1;
    
    // Track daily views for analytics
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayView = project.viewHistory?.find(
      v => v.date.toDateString() === today.toDateString()
    );
    
    if (todayView) {
      todayView.count += 1;
    } else {
      if (!project.viewHistory) project.viewHistory = [];
      project.viewHistory.push({
        date: today,
        count: 1
      });
    }
    
    // Keep only last 90 days
    if (project.viewHistory && project.viewHistory.length > 90) {
      project.viewHistory = project.viewHistory.slice(-90);
    }
    
    await project.save();

    res.json({ 
      message: "View counted", 
      views: project.views 
    });
  } catch (err) {
    console.error("❌ View increment error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// ✅ Update project
export const updateProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { title, description, category, currentThumbnail, existingImages } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    let additionalImages = [];
    try {
      additionalImages = JSON.parse(existingImages || "[]");
    } catch (err) {
      additionalImages = [];
    }

    let finalThumbnail = currentThumbnail || null;

    const newThumbnailFile = req.files?.newThumbnail?.[0];
    if (newThumbnailFile) {
      const uploadResult = await cloudinary.uploader.upload(newThumbnailFile.path);
      finalThumbnail = uploadResult.secure_url;
    }

    if (!finalThumbnail) {
      return res.status(400).json({ message: "Thumbnail is required" });
    }

    let newAdditionalUrls = [];
    const additionalFiles = req.files?.files || [];
    
    if (additionalFiles.length > 0) {
      const uploadPromises = additionalFiles.map((file) =>
        cloudinary.uploader.upload(file.path)
      );
      const uploadResults = await Promise.all(uploadPromises);
      newAdditionalUrls = uploadResults.map((result) => result.secure_url);
    }

    const allImages = [finalThumbnail, ...additionalImages, ...newAdditionalUrls];

    project.title = title;
    project.description = description;
    project.category = category;
    project.thumbnail = finalThumbnail;
    project.images = allImages;

    await project.save();

    res.json({ message: "Project updated successfully", project });
  } catch (err) {
    console.error("❌ Update error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// ✅ Delete project
export const deleteProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    await Project.findByIdAndDelete(projectId);
    res.json({ message: "Project deleted successfully" });
  } catch (err) {
    console.error("❌ Delete error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// ✅ Like/Unlike project (UPDATED)
export const likeProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.userId;

    console.log("❤️ Like request:", { projectId, userId });

    if (!userId) {
      return res.status(401).json({ message: "Please login to like" });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const alreadyLiked = project.likedBy.some(id => id.toString() === userId.toString());

    if (alreadyLiked) {
      // Unlike
      project.likedBy = project.likedBy.filter(
        (id) => id.toString() !== userId.toString()
      );
      project.likes = Math.max(0, (project.likes || 0) - 1);
      await project.save();
      
      // 🔥 Remove like notification when unliking
      if (project.userId.toString() !== userId) {
        const projectOwner = await User.findById(project.userId);
        if (projectOwner && projectOwner.notifications) {
          projectOwner.notifications = projectOwner.notifications.filter(
            notif => !(notif.type === "like" && notif.from?.toString() === userId && notif.project?.toString() === projectId)
          );
          await projectOwner.save();
        }
      }
      
      console.log("💔 Unliked");
      return res.json({ message: "Unliked", likes: project.likes, isLiked: false });
    } else {
      // Like
      project.likedBy.push(userId);
      project.likes = (project.likes || 0) + 1;
      await project.save();
      
      // 🔥 Create notification
      if (project.userId.toString() !== userId) {
        const liker = await User.findById(userId);
        const projectOwner = await User.findById(project.userId);
        
        if (projectOwner) {
          if (!projectOwner.notifications) {
            projectOwner.notifications = [];
          }
          
          projectOwner.notifications.push({
            type: "like",
            message: `${liker.username} liked your project`,
            from: userId,
            project: projectId
          });
          await projectOwner.save();
        }
      }
      
      console.log("❤️ Liked");
      return res.json({ message: "Liked!", likes: project.likes, isLiked: true });
    }
  } catch (err) {
    console.error("❌ Like error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// ✅ Check like status
export const checkLikeStatus = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.userId;

    if (!userId) {
      const project = await Project.findById(projectId);
      return res.json({ isLiked: false, likes: project?.likes || 0 });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const isLiked = project.likedBy.some(id => id.toString() === userId.toString());
    res.json({ isLiked, likes: project.likes });
  } catch (err) {
    console.error("❌ Check like error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// 🔥 Search Projects by Title, Description, Category, Username, or Email
export const searchProjects = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.json([]);
    }

    const searchQuery = q.trim();
    
    console.log("🔍 Searching for:", searchQuery);

    // ✅ First, find matching users by username or email
    const matchingUsers = await User.find({
      $or: [
        { username: { $regex: searchQuery, $options: 'i' } },
        { email: { $regex: searchQuery, $options: 'i' } }
      ]
    }).select('_id');

    const matchingUserIds = matchingUsers.map(user => user._id);

    // ✅ Search projects by:
    // 1. Title, description, category (in project)
    // 2. Username or email (in user)
    const projects = await Project.find({
      $or: [
        { title: { $regex: searchQuery, $options: 'i' } },
        { description: { $regex: searchQuery, $options: 'i' } },
        { category: { $regex: searchQuery, $options: 'i' } },
        { userId: { $in: matchingUserIds } } // ✅ Search by user
      ]
    })
      .populate('userId', 'username email avatar')
      .sort({ createdAt: -1 })
      .limit(20);

    console.log(`✅ Found ${projects.length} projects`);

    res.json(projects);
  } catch (err) {
    console.error("❌ Search error:", err);
    res.status(500).json({ message: err.message });
  }
};

// 🔥 Feature 15: Get Popular Tags
export const getPopularTags = async (req, res) => {
  try {
    const tags = await Project.aggregate([
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]);
    
    res.json(tags);
  } catch (err) {
    console.error("Get popular tags error:", err);
    res.status(500).json({ message: err.message });
  }
};

// 🔥 Feature 2: Add Comment
export const addComment = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { text } = req.body;
    const userId = req.userId;
    
    if (!text || text.trim() === '') {
      return res.status(400).json({ message: "Comment text is required" });
    }
    
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    
    const comment = {
      user: userId,
      text: text.trim(),
      createdAt: new Date()
    };
    
    project.comments.push(comment);
    await project.save();
    
    await project.populate('comments.user', 'username avatar');
    const newComment = project.comments[project.comments.length - 1];
    
    // Create notification
    if (project.userId.toString() !== userId) {
      const commenter = await User.findById(userId);
      const projectOwner = await User.findById(project.userId);
      
      if (projectOwner) {
        projectOwner.notifications.push({
          type: "comment",
          message: `${commenter.username} commented on your project`,
          from: userId,
          project: projectId
        });
        await projectOwner.save();
      }
    }
    
    res.json({ 
      message: "Comment added successfully", 
      comment: newComment 
    });
  } catch (err) {
    console.error("Add comment error:", err);
    res.status(500).json({ message: err.message });
  }
};

// 🔥 Feature 2: Get Comments
export const getComments = async (req, res) => {
  try {
    const { projectId } = req.params;
    
    const project = await Project.findById(projectId)
      .populate('comments.user', 'username avatar')
      .populate('comments.replies.user', 'username avatar');
    
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    
    res.json(project.comments);
  } catch (err) {
    console.error("Get comments error:", err);
    res.status(500).json({ message: err.message });
  }
};

// 🔥 Feature 2: Delete Comment
export const deleteComment = async (req, res) => {
  try {
    const { projectId, commentId } = req.params;
    const userId = req.userId;
    
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    
    const comment = project.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }
    
    if (comment.user.toString() !== userId && project.userId.toString() !== userId) {
      return res.status(403).json({ message: "Not authorized" });
    }
    
    comment.remove();
    await project.save();
    
    res.json({ message: "Comment deleted successfully" });
  } catch (err) {
    console.error("Delete comment error:", err);
    res.status(500).json({ message: err.message });
  }
};

// 🔥 Feature 2: Add Reply to Comment
export const addReply = async (req, res) => {
  try {
    const { projectId, commentId } = req.params;
    const { text } = req.body;
    const userId = req.userId;
    
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    
    const comment = project.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }
    
    const reply = {
      user: userId,
      text: text.trim(),
      createdAt: new Date()
    };
    
    comment.replies.push(reply);
    await project.save();
    
    await project.populate('comments.replies.user', 'username avatar');
    const newReply = comment.replies[comment.replies.length - 1];
    
    res.json({ 
      message: "Reply added successfully", 
      reply: newReply 
    });
  } catch (err) {
    console.error("Add reply error:", err);
    res.status(500).json({ message: err.message });
  }
};

// 🔥 Feature 11: Add Collaborator
export const addCollaborator = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { userId: collaboratorId, role } = req.body;
    const ownerId = req.userId;
    
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    
    if (project.userId.toString() !== ownerId) {
      return res.status(403).json({ message: "Only project owner can add collaborators" });
    }
    
    const isAlreadyCollaborator = project.collaborators?.some(
      c => c.user.toString() === collaboratorId
    );
    
    if (isAlreadyCollaborator) {
      return res.status(400).json({ message: "User is already a collaborator" });
    }
    
    if (!project.collaborators) project.collaborators = [];
    
    project.collaborators.push({
      user: collaboratorId,
      role: role || "Contributor"
    });
    
    await project.save();
    await project.populate('collaborators.user', 'username avatar');
    
    res.json({ 
      message: "Collaborator added successfully",
      collaborators: project.collaborators
    });
  } catch (err) {
    console.error("Add collaborator error:", err);
    res.status(500).json({ message: err.message });
  }
};

// 🔥 Feature 11: Remove Collaborator
export const removeCollaborator = async (req, res) => {
  try {
    const { projectId, collaboratorId } = req.params;
    const ownerId = req.userId;
    
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    
    if (project.userId.toString() !== ownerId) {
      return res.status(403).json({ message: "Only project owner can remove collaborators" });
    }
    
    project.collaborators = project.collaborators.filter(
      c => c.user.toString() !== collaboratorId
    );
    
    await project.save();
    
    res.json({ message: "Collaborator removed successfully" });
  } catch (err) {
    console.error("Remove collaborator error:", err);
    res.status(500).json({ message: err.message });
  }
};

// 🔥 Feature 12: Get Project Analytics
export const getProjectAnalytics = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.userId;
    
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    
    if (project.userId.toString() !== userId) {
      return res.status(403).json({ message: "Not authorized" });
    }
    
    const analytics = {
      totalViews: project.views,
      totalLikes: project.likes,
      totalComments: project.comments?.length || 0,
      viewHistory: project.viewHistory?.slice(-30) || [],
      likeRate: project.views > 0 ? ((project.likes / project.views) * 100).toFixed(2) : 0,
      engagementRate: project.views > 0 ? (((project.likes + (project.comments?.length || 0)) / project.views) * 100).toFixed(2) : 0
    };
    
    res.json(analytics);
  } catch (err) {
    console.error("Get analytics error:", err);
    res.status(500).json({ message: err.message });
  }
};

// 🔥 Feature 7: Get Projects with Pagination
export const getProjectsPaginated = async (req, res) => {
  try {
    const { page = 1, limit = 12, category, sortBy, dateRange, tags } = req.query;
    
    let query = {};
    
    if (category && category !== 'All') {
      query.category = { $regex: `^${category}`, $options: 'i' };
    }
    
    if (tags) {
      const tagArray = tags.split(',');
      query.tags = { $in: tagArray };
    }
    
    if (dateRange && dateRange !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (dateRange) {
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
        case '3months':
          filterDate.setMonth(now.getMonth() - 3);
          break;
        case '4months':
          filterDate.setMonth(now.getMonth() - 4);
          break;
        case '6months':
          filterDate.setMonth(now.getMonth() - 6);
          break;
        case 'year':
          filterDate.setFullYear(now.getFullYear() - 1);
          break;
      }
      
      query.createdAt = { $gte: filterDate };
    }
    
    let sort = {};
    switch (sortBy) {
      case 'latest':
        sort = { createdAt: -1 };
        break;
      case 'oldest':
        sort = { createdAt: 1 };
        break;
      case 'likes-high':
        sort = { likes: -1 };
        break;
      case 'likes-low':
        sort = { likes: 1 };
        break;
      case 'views-high':
        sort = { views: -1 };
        break;
      case 'views-low':
        sort = { views: 1 };
        break;
      default:
        sort = { createdAt: -1 };
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const projects = await Project.find(query)
      .populate('userId', 'username avatar')
      .populate('collaborators.user', 'username avatar')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Project.countDocuments(query);
    
    res.json({
      projects,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      totalProjects: total,
      hasMore: skip + projects.length < total
    });
  } catch (err) {
    console.error("Get projects paginated error:", err);
    res.status(500).json({ message: err.message });
  }
};

