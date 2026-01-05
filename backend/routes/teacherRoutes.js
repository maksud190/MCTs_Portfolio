import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import Announcement from "../models/Announcement.js";
import User from "../models/userModel.js";

const router = express.Router();

// Middleware to check if user is teacher
const teacherMiddleware = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role !== "teacher") {
      return res.status(403).json({ message: "Access denied. Teachers only." });
    }

    next();
  } catch (err) {
    console.error("❌ Teacher middleware error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// 🔥 Get all active announcements (Public - for everyone)
router.get("/announcements/public", async (req, res) => {
  try {
    const now = new Date();
    
    const announcements = await Announcement.find({
      isActive: true,
      $or: [
        { expiresAt: null },
        { expiresAt: { $gt: now } }
      ]
    })
      .populate("createdBy", "username email avatar designation")
      .populate("replies.user", "username avatar designation")
      .sort({ createdAt: -1 });

    console.log("✅ Found public announcements:", announcements.length);
    res.json(announcements);
  } catch (err) {
    console.error("❌ Get public announcements error:", err);
    res.status(500).json({ message: err.message });
  }
});

// Create announcement (Teacher only)
router.post("/announcements", authMiddleware, teacherMiddleware, async (req, res) => {
  try {
    const { title, content, type, isActive, expiresAt } = req.body;

    console.log("📧 Creating announcement:", { title, type, createdBy: req.userId });

    const announcement = new Announcement({
      title,
      content,
      type,
      isActive,
      expiresAt: expiresAt || null,
      createdBy: req.userId
    });

    await announcement.save();
    await announcement.populate("createdBy", "username email avatar designation");

    console.log("✅ Announcement created:", announcement._id);
    res.status(201).json({ message: "Announcement created", announcement });
  } catch (err) {
    console.error("❌ Create announcement error:", err);
    res.status(500).json({ message: err.message });
  }
});

// Update announcement (Teacher only - own announcements)
router.put("/announcements/:announcementId", authMiddleware, teacherMiddleware, async (req, res) => {
  try {
    const announcement = await Announcement.findOne({
      _id: req.params.announcementId,
      createdBy: req.userId
    });

    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found or unauthorized" });
    }

    const updates = req.body;
    Object.assign(announcement, updates);
    await announcement.save();

    console.log("✅ Announcement updated:", announcement._id);
    res.json({ message: "Announcement updated", announcement });
  } catch (err) {
    console.error("❌ Update announcement error:", err);
    res.status(500).json({ message: err.message });
  }
});

// Delete announcement (Teacher only - own announcements)
router.delete("/announcements/:announcementId", authMiddleware, teacherMiddleware, async (req, res) => {
  try {
    const announcement = await Announcement.findOneAndDelete({
      _id: req.params.announcementId,
      createdBy: req.userId
    });

    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found or unauthorized" });
    }

    console.log("✅ Announcement deleted:", announcement._id);
    res.json({ message: "Announcement deleted" });
  } catch (err) {
    console.error("❌ Delete announcement error:", err);
    res.status(500).json({ message: err.message });
  }
});

// 🔥 Add reply to announcement (Anyone can reply)
router.post("/announcements/:announcementId/reply", authMiddleware, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Reply text is required" });
    }

    const announcement = await Announcement.findById(req.params.announcementId);

    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    announcement.replies.push({
      user: req.userId,
      text: text.trim()
    });

    await announcement.save();
    await announcement.populate("replies.user", "username avatar designation");

    console.log("✅ Reply added to announcement:", announcement._id);
    res.json({ message: "Reply added", announcement });
  } catch (err) {
    console.error("❌ Add reply error:", err);
    res.status(500).json({ message: err.message });
  }
});

// 🔥 Delete reply (User can delete own reply)
router.delete("/announcements/:announcementId/reply/:replyId", authMiddleware, async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.announcementId);

    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    const reply = announcement.replies.id(req.params.replyId);

    if (!reply) {
      return res.status(404).json({ message: "Reply not found" });
    }

    // Check if user is the reply owner or announcement creator
    if (reply.user.toString() !== req.userId && announcement.createdBy.toString() !== req.userId) {
      return res.status(403).json({ message: "Unauthorized to delete this reply" });
    }

    announcement.replies.pull(req.params.replyId);
    await announcement.save();

    console.log("✅ Reply deleted from announcement:", announcement._id);
    res.json({ message: "Reply deleted" });
  } catch (err) {
    console.error("❌ Delete reply error:", err);
    res.status(500).json({ message: err.message });
  }
});

export default router;