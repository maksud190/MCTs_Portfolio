import express from "express";
import multer from "multer";
import {
  uploadProject,
  getAllProjects,
  getUserProjects,
  getProjectById,
  updateProject,
  deleteProject,
  likeProject,
  checkLikeStatus,
  incrementView,
  searchProjects,
  getPopularTags,
  addComment,
  getComments,
  deleteComment,
  addReply,
  addCollaborator,
  removeCollaborator,
  getProjectAnalytics,
  getProjectsPaginated
} from "../controllers/projectController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// ✅ Public routes
router.get("/", getAllProjects);
router.get("/user/:userId", getUserProjects);
router.get("/:projectId", getProjectById);
router.post("/:projectId/view", incrementView);

// 🔥 Feature 1: Search
router.get("/search/projects", searchProjects);

// 🔥 Feature 15: Tags
router.get("/tags/popular", getPopularTags);

// 🔥 Feature 7: Pagination (Infinite Scroll)
router.get("/paginated/projects", getProjectsPaginated);

// 🔥 Feature 2: Comments (Public - can view without login)
router.get("/:projectId/comments", getComments);

// ✅ Protected routes - Upload
router.post("/upload", authMiddleware, upload.fields([
  { name: 'thumbnail', maxCount: 1 },
  { name: 'files', maxCount: 4 }
]), uploadProject);

// ✅ Protected routes - Update
router.put("/:projectId", authMiddleware, upload.fields([
  { name: 'newThumbnail', maxCount: 1 },
  { name: 'files', maxCount: 4 }
]), updateProject);

// ✅ Protected routes - Delete
router.delete("/:projectId", authMiddleware, deleteProject);

// ✅ Protected routes - Like
router.post("/:projectId/like", authMiddleware, likeProject);
router.get("/:projectId/like-status", (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (token) {
    return authMiddleware(req, res, next);
  }
  req.userId = null;
  next();
}, checkLikeStatus);

// 🔥 Feature 2: Comments (Protected)
router.post("/:projectId/comments", authMiddleware, addComment);
router.delete("/:projectId/comments/:commentId", authMiddleware, deleteComment);
router.post("/:projectId/comments/:commentId/replies", authMiddleware, addReply);

// 🔥 Feature 11: Collaborators
router.post("/:projectId/collaborators", authMiddleware, addCollaborator);
router.delete("/:projectId/collaborators/:collaboratorId", authMiddleware, removeCollaborator);

// 🔥 Feature 12: Analytics
router.get("/:projectId/analytics", authMiddleware, getProjectAnalytics);

export default router;