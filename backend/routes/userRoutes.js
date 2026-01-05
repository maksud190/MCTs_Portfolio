// import express from "express";
// import multer from "multer";
// import {
//   register,
//   login,
//   getUserById,
//   updateUserProfile,
//   sendVerificationEmail,
//   verifyEmail,
//   followUser,
//   checkFollowStatus,
//   getNotifications,
//   markNotificationRead,
//   markAllNotificationsRead,
//   sendContactMessage,
//   updateAccount,
//   updateSocialLinks,
//   deleteAccount,
//   getAllUsers,
//   getUserByUsername, // ⬅️ NEW
// } from "../controllers/userController.js";
// import { authMiddleware } from "../middleware/authMiddleware.js";

// // 🔥 Import Contact model and User model
// import Contact from "../models/contactModel.js";
// import User from "../models/userModel.js";

// const router = express.Router();

// // Multer config
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "uploads/");
//   },
//   filename: function (req, file, cb) {
//     const uniqueSuffix =
//       Date.now() + "-" + Math.round(Math.random() * 1e9);
//     cb(null, uniqueSuffix + "-" + file.originalname);
//   },
// });

// const upload = multer({
//   storage: storage,
//   limits: { fileSize: 5 * 1024 * 1024 },
// });

// // ✅ PUBLIC ROUTES
// router.post("/register", register);
// router.post("/login", login);

// // ✅ PUBLIC LIST OF ALL USERS
// router.get("/all", getAllUsers);

// // ✅ Username-based profile route (for pretty URLs like /profile/maksud190)
// router.get("/username/:username", getUserByUsername);

// // ✅ Email verification (public GET – token from email link)
// router.get("/verify-email/:token", verifyEmail);

// // ✅ PROTECTED ROUTES (need auth)

// // Update profile with avatar upload
// router.put(
//   "/profile",
//   authMiddleware,
//   upload.single("avatar"),
//   updateUserProfile
// );

// // Settings routes
// router.put("/account", authMiddleware, updateAccount);
// router.put("/social-links", authMiddleware, updateSocialLinks);
// router.delete("/account", authMiddleware, deleteAccount);

// // Email Verification (send email)
// router.post(
//   "/send-verification-email",
//   authMiddleware,
//   sendVerificationEmail
// );

// // Follow System
// router.post(
//   "/follow/:targetUserId",
//   authMiddleware,
//   followUser
// );
// router.get(
//   "/follow-status/:targetUserId",
//   authMiddleware,
//   checkFollowStatus
// );

// // Notifications
// router.get(
//   "/notifications/all",
//   authMiddleware,
//   getNotifications
// );
// router.put(
//   "/notifications/:notificationId/read",
//   authMiddleware,
//   markNotificationRead
// );
// router.put(
//   "/notifications/read-all",
//   authMiddleware,
//   markAllNotificationsRead
// );

// // 🔥 CONTACT MESSAGES ROUTES
// // ⚠️ IMPORTANT: These come BEFORE the generic "/:userId" route

// // Get received messages (inbox)
// router.get(
//   "/contact/inbox",
//   authMiddleware,
//   async (req, res) => {
//     try {
//       console.log("📥 Fetching inbox for user:", req.userId);

//       const messages = await Contact.find({
//         recipientId: req.userId,
//       })
//         .populate(
//           "senderId",
//           "username email avatar designation"
//         )
//         .populate("projectId", "title thumbnail")
//         .sort({ createdAt: -1 });

//       console.log("✅ Found messages:", messages.length);
//       res.json(messages);
//     } catch (error) {
//       console.error("❌ Get inbox error:", error);
//       res
//         .status(500)
//         .json({ message: "Server error", error: error.message });
//     }
//   }
// );

// // Get sent messages (outbox)
// router.get(
//   "/contact/sent",
//   authMiddleware,
//   async (req, res) => {
//     try {
//       console.log("📤 Fetching sent messages for user:", req.userId);

//       const messages = await Contact.find({
//         senderId: req.userId,
//       })
//         .populate(
//           "recipientId",
//           "username email avatar designation"
//         )
//         .populate("projectId", "title thumbnail")
//         .sort({ createdAt: -1 });

//       console.log("✅ Found sent messages:", messages.length);
//       res.json(messages);
//     } catch (error) {
//       console.error("❌ Get sent messages error:", error);
//       res
//         .status(500)
//         .json({ message: "Server error", error: error.message });
//     }
//   }
// );

// // Get unread count
// router.get(
//   "/contact/unread-count",
//   authMiddleware,
//   async (req, res) => {
//     try {
//       const count = await Contact.countDocuments({
//         recipientId: req.userId,
//         isRead: false,
//       });

//       console.log(
//         "📊 Unread count for user",
//         req.userId,
//         ":",
//         count
//       );
//       res.json({ count });
//     } catch (error) {
//       console.error("❌ Get unread count error:", error);
//       res
//         .status(500)
//         .json({ message: "Server error", error: error.message });
//     }
//   }
// );

// // Mark message as read
// router.patch(
//   "/contact/:messageId/read",
//   authMiddleware,
//   async (req, res) => {
//     try {
//       const message = await Contact.findById(
//         req.params.messageId
//       );

//       if (!message) {
//         return res
//           .status(404)
//           .json({ message: "Message not found" });
//       }

//       // Only recipient can mark as read
//       if (message.recipientId.toString() !== req.userId) {
//         return res
//           .status(403)
//           .json({ message: "Unauthorized" });
//       }

//       message.isRead = true;
//       await message.save();

//       console.log(
//         "✅ Message marked as read:",
//         req.params.messageId
//       );
//       res.json({ message: "Message marked as read" });
//     } catch (error) {
//       console.error("❌ Mark as read error:", error);
//       res
//         .status(500)
//         .json({ message: "Server error", error: error.message });
//     }
//   }
// );

// // Delete message
// router.delete(
//   "/contact/:messageId",
//   authMiddleware,
//   async (req, res) => {
//     try {
//       const message = await Contact.findById(
//         req.params.messageId
//       );

//       if (!message) {
//         return res
//           .status(404)
//           .json({ message: "Message not found" });
//       }

//       // Only sender or recipient can delete
//       if (
//         message.senderId.toString() !== req.userId &&
//         message.recipientId.toString() !== req.userId
//       ) {
//         return res
//           .status(403)
//           .json({ message: "Unauthorized" });
//       }

//       await message.deleteOne();

//       console.log(
//         "✅ Message deleted:",
//         req.params.messageId
//       );
//       res.json({ message: "Message deleted successfully" });
//     } catch (error) {
//       console.error("❌ Delete message error:", error);
//       res
//         .status(500)
//         .json({ message: "Server error", error: error.message });
//     }
//   }
// );

// // Send contact message (THIS MUST BE LAST among /contact routes)
// router.post(
//   "/contact",
//   authMiddleware,
//   async (req, res) => {
//     try {
//       const { recipientId, projectId, subject, message } =
//         req.body;

//       console.log("📧 Contact request received:", {
//         senderId: req.userId,
//         recipientId,
//         projectId,
//         subject,
//       });

//       // Validation
//       if (!recipientId || !subject || !message) {
//         return res
//           .status(400)
//           .json({ message: "All fields are required" });
//       }

//       // Check if recipient exists
//       const recipient = await User.findById(recipientId);
//       if (!recipient) {
//         return res
//           .status(404)
//           .json({ message: "Recipient not found" });
//       }

//       // Prevent sending message to self
//       if (req.userId === recipientId) {
//         return res.status(400).json({
//           message: "You cannot send a message to yourself",
//         });
//       }

//       // Create contact message
//       const contact = new Contact({
//         senderId: req.userId,
//         recipientId,
//         projectId: projectId || null,
//         subject: subject.trim(),
//         message: message.trim(),
//       });

//       await contact.save();
//       await contact.populate("senderId", "username email avatar");

//       console.log("✅ Contact message saved:", contact._id);

//       res.status(201).json({
//         message: "Message sent successfully",
//         contact,
//       });
//     } catch (error) {
//       console.error("❌ Contact message error:", error);
//       res
//         .status(500)
//         .json({ message: "Server error", error: error.message });
//     }
//   }
// );

// // ✅ Finally: generic get user by ID route
// // KEEP THIS LAST among GET routes so it doesn't swallow others
// router.get("/:userId", getUserById);

// export default router;




























// routes/userRoutes.js
import express from "express";
import multer from "multer";
import {
  register,
  login,
  getUserById,
  updateUserProfile,
  sendVerificationEmail,
  verifyEmail,
  followUser,
  checkFollowStatus,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  sendContactMessage,
  updateAccount,
  updateSocialLinks,
  deleteAccount,
  getAllUsers,
  getUserByUsername,
  checkUsername, // ✅ username availability controller
} from "../controllers/userController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

import Contact from "../models/contactModel.js";
import User from "../models/userModel.js";

const router = express.Router();

// Multer config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix =
      Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

// ✅ PUBLIC ROUTES
router.post("/register", register);
router.post("/login", login);

// ✅ username availability check (for Register.jsx realtime)
router.get("/check-username", checkUsername);

// ✅ PUBLIC LIST OF ALL USERS
router.get("/all", getAllUsers);

// ✅ Username-based profile route (for pretty URLs like /profile/maksud190)
router.get("/username/:username", getUserByUsername);

// ✅ Email verification (public GET – token from email link)
router.get("/verify-email/:token", verifyEmail);

// ✅ PROTECTED ROUTES (need auth)

// Update profile with avatar upload
router.put(
  "/profile",
  authMiddleware,
  upload.single("avatar"),
  updateUserProfile
);

// Settings routes
router.put("/account", authMiddleware, updateAccount);
router.put("/social-links", authMiddleware, updateSocialLinks);
router.delete("/account", authMiddleware, deleteAccount);

// Email Verification (send email)
router.post(
  "/send-verification-email",
  authMiddleware,
  sendVerificationEmail
);

// Follow System
router.post(
  "/follow/:targetUserId",
  authMiddleware,
  followUser
);
router.get(
  "/follow-status/:targetUserId",
  authMiddleware,
  checkFollowStatus
);

// Notifications
router.get(
  "/notifications/all",
  authMiddleware,
  getNotifications
);
router.put(
  "/notifications/:notificationId/read",
  authMiddleware,
  markNotificationRead
);
router.put(
  "/notifications/read-all",
  authMiddleware,
  markAllNotificationsRead
);

// 🔥 CONTACT MESSAGES ROUTES – BEFORE "/:userId"

// Get received messages (inbox)
router.get(
  "/contact/inbox",
  authMiddleware,
  async (req, res) => {
    try {
      console.log("📥 Fetching inbox for user:", req.userId);

      const messages = await Contact.find({
        recipientId: req.userId,
      })
        .populate(
          "senderId",
          "username email avatar designation"
        )
        .populate("projectId", "title thumbnail")
        .sort({ createdAt: -1 });

      console.log("✅ Found messages:", messages.length);
      res.json(messages);
    } catch (error) {
      console.error("❌ Get inbox error:", error);
      res
        .status(500)
        .json({ message: "Server error", error: error.message });
    }
  }
);

// Get sent messages (outbox)
router.get(
  "/contact/sent",
  authMiddleware,
  async (req, res) => {
    try {
      console.log("📤 Fetching sent messages for user:", req.userId);

      const messages = await Contact.find({
        senderId: req.userId,
      })
        .populate(
          "recipientId",
          "username email avatar designation"
        )
        .populate("projectId", "title thumbnail")
        .sort({ createdAt: -1 });

      console.log("✅ Found sent messages:", messages.length);
      res.json(messages);
    } catch (error) {
      console.error("❌ Get sent messages error:", error);
      res
        .status(500)
        .json({ message: "Server error", error: error.message });
    }
  }
);

// Get unread count
router.get(
  "/contact/unread-count",
  authMiddleware,
  async (req, res) => {
    try {
      const count = await Contact.countDocuments({
        recipientId: req.userId,
        isRead: false,
      });

      console.log(
        "📊 Unread count for user",
        req.userId,
        ":",
        count
      );
      res.json({ count });
    } catch (error) {
      console.error("❌ Get unread count error:", error);
      res
        .status(500)
        .json({ message: "Server error", error: error.message });
    }
  }
);

// Mark message as read
router.patch(
  "/contact/:messageId/read",
  authMiddleware,
  async (req, res) => {
    try {
      const message = await Contact.findById(
        req.params.messageId
      );

      if (!message) {
        return res
          .status(404)
          .json({ message: "Message not found" });
      }

      if (message.recipientId.toString() !== req.userId) {
        return res
          .status(403)
          .json({ message: "Unauthorized" });
      }

      message.isRead = true;
      await message.save();

      console.log(
        "✅ Message marked as read:",
        req.params.messageId
      );
      res.json({ message: "Message marked as read" });
    } catch (error) {
      console.error("❌ Mark as read error:", error);
      res
        .status(500)
        .json({ message: "Server error", error: error.message });
    }
  }
);

// Delete message
router.delete(
  "/contact/:messageId",
  authMiddleware,
  async (req, res) => {
    try {
      const message = await Contact.findById(
        req.params.messageId
      );

      if (!message) {
        return res
          .status(404)
          .json({ message: "Message not found" });
      }

      if (
        message.senderId.toString() !== req.userId &&
        message.recipientId.toString() !== req.userId
      ) {
        return res
          .status(403)
          .json({ message: "Unauthorized" });
      }

      await message.deleteOne();

      console.log(
        "✅ Message deleted:",
        req.params.messageId
      );
      res.json({ message: "Message deleted successfully" });
    } catch (error) {
      console.error("❌ Delete message error:", error);
      res
        .status(500)
        .json({ message: "Server error", error: error.message });
    }
  }
);

// Send contact message
router.post(
  "/contact",
  authMiddleware,
  async (req, res) => {
    try {
      const { recipientId, projectId, subject, message } =
        req.body;

      console.log("📧 Contact request received:", {
        senderId: req.userId,
        recipientId,
        projectId,
        subject,
      });

      if (!recipientId || !subject || !message) {
        return res
          .status(400)
          .json({ message: "All fields are required" });
      }

      const recipient = await User.findById(recipientId);
      if (!recipient) {
        return res
          .status(404)
          .json({ message: "Recipient not found" });
      }

      if (req.userId === recipientId) {
        return res.status(400).json({
          message: "You cannot send a message to yourself",
        });
      }

      const contact = new Contact({
        senderId: req.userId,
        recipientId,
        projectId: projectId || null,
        subject: subject.trim(),
        message: message.trim(),
      });

      await contact.save();
      await contact.populate("senderId", "username email avatar");

      console.log("✅ Contact message saved:", contact._id);

      res.status(201).json({
        message: "Message sent successfully",
        contact,
      });
    } catch (error) {
      console.error("❌ Contact message error:", error);
      res
        .status(500)
        .json({ message: "Server error", error: error.message });
    }
  }
);

// ✅ LAST: generic get user by ID
router.get("/:userId", getUserById);

export default router;