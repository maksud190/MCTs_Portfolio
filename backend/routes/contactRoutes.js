import express from "express";
import Contact from "../models/contactModel.js";
import User from "../models/userModel.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Send contact message
router.post("/send", authMiddleware, async (req, res) => {
  try {
    const { recipientId, projectId, subject, message } = req.body;

    // Validation
    if (!recipientId || !subject || !message) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: "Recipient not found" });
    }

    // Prevent sending message to self
    if (req.userId === recipientId) {
      return res.status(400).json({ message: "You cannot send a message to yourself" });
    }

    // Create contact message
    const contact = new Contact({
      senderId: req.userId,
      recipientId,
      projectId: projectId || null,
      subject: subject.trim(),
      message: message.trim(),
    });

    await contact.save();

    // Populate sender info for response
    await contact.populate("senderId", "username email avatar");

    res.status(201).json({
      message: "Message sent successfully",
      contact,
    });
  } catch (error) {
    console.error("❌ Send contact error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get received messages (inbox)
router.get("/inbox", authMiddleware, async (req, res) => {
  try {
    const messages = await Contact.find({ recipientId: req.userId })
      .populate("senderId", "username email avatar designation")
      .populate("projectId", "title thumbnail")
      .sort({ createdAt: -1 });

    res.json(messages);
  } catch (error) {
    console.error("❌ Get inbox error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get sent messages (outbox)
router.get("/sent", authMiddleware, async (req, res) => {
  try {
    const messages = await Contact.find({ senderId: req.userId })
      .populate("recipientId", "username email avatar designation")
      .populate("projectId", "title thumbnail")
      .sort({ createdAt: -1 });

    res.json(messages);
  } catch (error) {
    console.error("❌ Get sent messages error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Mark message as read
router.patch("/:messageId/read", authMiddleware, async (req, res) => {
  try {
    const message = await Contact.findById(req.params.messageId);

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Only recipient can mark as read
    if (message.recipientId.toString() !== req.userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    message.isRead = true;
    await message.save();

    res.json({ message: "Message marked as read" });
  } catch (error) {
    console.error("❌ Mark as read error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete message
router.delete("/:messageId", authMiddleware, async (req, res) => {
  try {
    const message = await Contact.findById(req.params.messageId);

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Only sender or recipient can delete
    if (
      message.senderId.toString() !== req.userId &&
      message.recipientId.toString() !== req.userId
    ) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await message.deleteOne();

    res.json({ message: "Message deleted successfully" });
  } catch (error) {
    console.error("❌ Delete message error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get unread count
router.get("/unread-count", authMiddleware, async (req, res) => {
  try {
    const count = await Contact.countDocuments({
      recipientId: req.userId,
      isRead: false,
    });

    res.json({ count });
  } catch (error) {
    console.error("❌ Get unread count error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;