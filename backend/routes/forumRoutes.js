// routes/forumRoutes.js
import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import ForumQuestion from "../models/ForumQuestion.js";
import ForumAnswer from "../models/ForumAnswer.js";
import User from "../models/userModel.js";
import Notification from "../models/Notification.js";
import cloudinary from "../config/cloudinary.js";
import multer from "multer";

const router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"), false);
    }
  }
});

// Helper function to upload images to Cloudinary
const uploadImagesToCloudinary = async (files) => {
  const uploadPromises = files.map((file) => {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "forum_images",
          resource_type: "image",
        },
        (error, result) => {
          if (error) reject(error);
          else resolve({ url: result.secure_url, publicId: result.public_id });
        }
      );
      uploadStream.end(file.buffer);
    });
  });

  return Promise.all(uploadPromises);
};

// Helper function to create notification
const createNotification = async (recipientId, senderId, type, message, questionId, answerId, link) => {
  try {
    const notification = new Notification({
      recipient: recipientId,
      sender: senderId,
      type,
      message,
      question: questionId,
      answer: answerId,
      link
    });
    await notification.save();
  } catch (err) {
    console.error("❌ Notification creation error:", err);
  }
};

// ========================================
// QUESTION ROUTES
// ========================================

// Get all questions (with filters and search)
router.get("/questions", async (req, res) => {
  try {
    const {
      search,
      category,
      filter = "recent",
      page = 1,
      limit = 10
    } = req.query;

    let query = {};

    // Search by title or content
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } }
      ];
    }

    // Filter by category
    if (category && category !== "all") {
      query.categories = category;
    }

    // Sorting logic
    let sort = {};
    switch (filter) {
      case "recent":
        sort = { createdAt: -1 };
        break;
      case "popular":
        sort = { views: -1, upvotes: -1 };
        break;
      case "most_answered":
        sort = { answersCount: -1 };
        break;
      case "unsolved":
        query.isSolved = false;
        sort = { createdAt: -1 };
        break;
      case "solved":
        query.isSolved = true;
        sort = { createdAt: -1 };
        break;
      default:
        sort = { createdAt: -1 };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const questions = await ForumQuestion.find(query)
      .populate("author", "username avatar designation role")
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await ForumQuestion.countDocuments(query);

    res.json({
      questions,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (err) {
    console.error("❌ Get questions error:", err);
    res.status(500).json({ message: err.message });
  }
});

// Get single question with answers
router.get("/questions/:questionId", async (req, res) => {
  try {
    const question = await ForumQuestion.findById(req.params.questionId)
      .populate("author", "username avatar designation role reputation")
      .populate({
        path: "solvedBy",
        populate: {
          path: "author",
          select: "username avatar"
        }
      });

    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    // Increment view count
    question.views += 1;
    await question.save();

    // Get answers
    const answers = await ForumAnswer.find({ question: req.params.questionId })
      .populate("author", "username avatar designation role reputation")
      .populate("markedBestBy", "username")
      .populate("replies.author", "username avatar designation")
      .sort({ isBestAnswer: -1, upvotes: -1, createdAt: -1 });

    res.json({ question, answers });
  } catch (err) {
    console.error("❌ Get question error:", err);
    res.status(500).json({ message: err.message });
  }
});

// Create new question
router.post("/questions", authMiddleware, upload.array("images", 5), async (req, res) => {
  try {
    const { title, content, categories, tags, isPoll, pollOptions } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: "Title and content are required" });
    }

    // Upload images if any
    let images = [];
    if (req.files && req.files.length > 0) {
      images = await uploadImagesToCloudinary(req.files);
    }

    // Parse data
    const parsedCategories = typeof categories === "string" ? JSON.parse(categories) : categories;
    const parsedTags = typeof tags === "string" ? JSON.parse(tags) : tags;
    const parsedIsPoll = isPoll === "true" || isPoll === true;
    const parsedPollOptions = typeof pollOptions === "string" ? JSON.parse(pollOptions) : pollOptions;

    const question = new ForumQuestion({
      title,
      content,
      author: req.userId,
      categories: parsedCategories || [],
      tags: parsedTags || [],
      images,
      isPoll: parsedIsPoll,
      pollOptions: parsedIsPoll ? (parsedPollOptions || []).map(opt => ({
        option: opt,
        votes: []
      })) : []
    });

    await question.save();
    await question.populate("author", "username avatar designation role");

    // Update user stats
    await User.findByIdAndUpdate(req.userId, {
      $inc: { "forumStats.questionsAsked": 1, reputation: 5 }
    });

    console.log("✅ Question created:", question._id);
    res.status(201).json({ message: "Question created", question });
  } catch (err) {
    console.error("❌ Create question error:", err);
    res.status(500).json({ message: err.message });
  }
});

// Update question
router.put("/questions/:questionId", authMiddleware, upload.array("images", 5), async (req, res) => {
  try {
    const question = await ForumQuestion.findById(req.params.questionId);

    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    if (question.author.toString() !== req.userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const { title, content, categories, tags } = req.body;

    // Upload new images if any
    let newImages = [];
    if (req.files && req.files.length > 0) {
      newImages = await uploadImagesToCloudinary(req.files);
    }

    question.title = title || question.title;
    question.content = content || question.content;
    question.categories = categories ? (typeof categories === "string" ? JSON.parse(categories) : categories) : question.categories;
    question.tags = tags ? (typeof tags === "string" ? JSON.parse(tags) : tags) : question.tags;
    
    if (newImages.length > 0) {
      question.images = [...question.images, ...newImages];
    }

    await question.save();

    console.log("✅ Question updated:", question._id);
    res.json({ message: "Question updated", question });
  } catch (err) {
    console.error("❌ Update question error:", err);
    res.status(500).json({ message: err.message });
  }
});

// Delete question
router.delete("/questions/:questionId", authMiddleware, async (req, res) => {
  try {
    const question = await ForumQuestion.findById(req.params.questionId);

    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    if (question.author.toString() !== req.userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Delete images from Cloudinary
    for (const image of question.images) {
      if (image.publicId) {
        await cloudinary.uploader.destroy(image.publicId);
      }
    }

    // Delete all answers
    const answers = await ForumAnswer.find({ question: req.params.questionId });
    for (const answer of answers) {
      for (const image of answer.images) {
        if (image.publicId) {
          await cloudinary.uploader.destroy(image.publicId);
        }
      }
    }
    await ForumAnswer.deleteMany({ question: req.params.questionId });

    // Delete question
    await question.deleteOne();

    // Update user stats
    await User.findByIdAndUpdate(req.userId, {
      $inc: { "forumStats.questionsAsked": -1, reputation: -5 }
    });

    console.log("✅ Question deleted:", req.params.questionId);
    res.json({ message: "Question deleted" });
  } catch (err) {
    console.error("❌ Delete question error:", err);
    res.status(500).json({ message: err.message });
  }
});

// Upvote/Downvote question
router.post("/questions/:questionId/vote", authMiddleware, async (req, res) => {
  try {
    const { voteType } = req.body; // "upvote" or "downvote"
    const question = await ForumQuestion.findById(req.params.questionId);

    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    const userId = req.userId;
    const hasUpvoted = question.upvotes.includes(userId);
    const hasDownvoted = question.downvotes.includes(userId);

    if (voteType === "upvote") {
      if (hasUpvoted) {
        // Remove upvote
        question.upvotes.pull(userId);
        await User.findByIdAndUpdate(question.author, { $inc: { reputation: -10 } });
      } else {
        // Add upvote
        question.upvotes.push(userId);
        if (hasDownvoted) {
          question.downvotes.pull(userId);
          await User.findByIdAndUpdate(question.author, { $inc: { reputation: 15 } }); // +10 for upvote, +5 to cancel downvote
        } else {
          await User.findByIdAndUpdate(question.author, { $inc: { reputation: 10 } });
        }

        // Notify question author
        if (question.author.toString() !== userId) {
          await createNotification(
            question.author,
            userId,
            "question_upvoted",
            "Someone upvoted your question",
            question._id,
            null,
            `/forum/questions/${question._id}`
          );
        }
      }
    } else if (voteType === "downvote") {
      if (hasDownvoted) {
        // Remove downvote
        question.downvotes.pull(userId);
        await User.findByIdAndUpdate(question.author, { $inc: { reputation: 5 } });
      } else {
        // Add downvote
        question.downvotes.push(userId);
        if (hasUpvoted) {
          question.upvotes.pull(userId);
          await User.findByIdAndUpdate(question.author, { $inc: { reputation: -15 } }); // -5 for downvote, -10 to cancel upvote
        } else {
          await User.findByIdAndUpdate(question.author, { $inc: { reputation: -5 } });
        }
      }
    }

    await question.save();

    res.json({
      message: "Vote recorded",
      upvotes: question.upvotes.length,
      downvotes: question.downvotes.length,
      userVote: hasUpvoted ? "upvote" : hasDownvoted ? "downvote" : null
    });
  } catch (err) {
    console.error("❌ Vote question error:", err);
    res.status(500).json({ message: err.message });
  }
});

// Vote on poll
router.post("/questions/:questionId/poll/vote", authMiddleware, async (req, res) => {
  try {
    const { optionIndex } = req.body;
    const question = await ForumQuestion.findById(req.params.questionId);

    if (!question || !question.isPoll) {
      return res.status(404).json({ message: "Poll not found" });
    }

    if (optionIndex < 0 || optionIndex >= question.pollOptions.length) {
      return res.status(400).json({ message: "Invalid option" });
    }

    const userId = req.userId;

    // Check if user already voted
    let hasVoted = false;
    for (const option of question.pollOptions) {
      if (option.votes.some(vote => vote.user.toString() === userId)) {
        hasVoted = true;
        break;
      }
    }

    if (hasVoted) {
      return res.status(400).json({ message: "You have already voted" });
    }

    // Add vote
    question.pollOptions[optionIndex].votes.push({ user: userId });
    await question.save();

    res.json({ message: "Vote recorded", pollOptions: question.pollOptions });
  } catch (err) {
    console.error("❌ Poll vote error:", err);
    res.status(500).json({ message: err.message });
  }
});

// Get user's questions
router.get("/my-questions", authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const questions = await ForumQuestion.find({ author: req.userId })
      .populate("author", "username avatar designation role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await ForumQuestion.countDocuments({ author: req.userId });

    res.json({
      questions,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (err) {
    console.error("❌ Get my questions error:", err);
    res.status(500).json({ message: err.message });
  }
});

// ========================================
// ANSWER ROUTES
// ========================================

// Create answer
router.post("/questions/:questionId/answers", authMiddleware, upload.array("images", 5), async (req, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ message: "Content is required" });
    }

    const question = await ForumQuestion.findById(req.params.questionId);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    // Upload images if any
    let images = [];
    if (req.files && req.files.length > 0) {
      images = await uploadImagesToCloudinary(req.files);
    }

    const answer = new ForumAnswer({
      question: req.params.questionId,
      author: req.userId,
      content,
      images
    });

    await answer.save();
    await answer.populate("author", "username avatar designation role reputation");

    // Update question's answer count
    question.answersCount += 1;
    await question.save();

    // Update user stats
    await User.findByIdAndUpdate(req.userId, {
      $inc: { "forumStats.answersGiven": 1, reputation: 10 }
    });

    // Notify question author
    if (question.author.toString() !== req.userId) {
      await createNotification(
        question.author,
        req.userId,
        "question_answered",
        "Someone answered your question",
        question._id,
        answer._id,
        `/forum/questions/${question._id}`
      );
    }

    console.log("✅ Answer created:", answer._id);
    res.status(201).json({ message: "Answer created", answer });
  } catch (err) {
    console.error("❌ Create answer error:", err);
    res.status(500).json({ message: err.message });
  }
});

// Update answer
router.put("/answers/:answerId", authMiddleware, upload.array("images", 5), async (req, res) => {
  try {
    const answer = await ForumAnswer.findById(req.params.answerId);

    if (!answer) {
      return res.status(404).json({ message: "Answer not found" });
    }

    if (answer.author.toString() !== req.userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const { content } = req.body;

    // Upload new images if any
    let newImages = [];
    if (req.files && req.files.length > 0) {
      newImages = await uploadImagesToCloudinary(req.files);
    }

    answer.content = content || answer.content;
    
    if (newImages.length > 0) {
      answer.images = [...answer.images, ...newImages];
    }

    await answer.save();

    console.log("✅ Answer updated:", answer._id);
    res.json({ message: "Answer updated", answer });
  } catch (err) {
    console.error("❌ Update answer error:", err);
    res.status(500).json({ message: err.message });
  }
});

// Delete answer
router.delete("/answers/:answerId", authMiddleware, async (req, res) => {
  try {
    const answer = await ForumAnswer.findById(req.params.answerId);

    if (!answer) {
      return res.status(404).json({ message: "Answer not found" });
    }

    if (answer.author.toString() !== req.userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Delete images from Cloudinary
    for (const image of answer.images) {
      if (image.publicId) {
        await cloudinary.uploader.destroy(image.publicId);
      }
    }

    // Update question's answer count
    await ForumQuestion.findByIdAndUpdate(answer.question, {
      $inc: { answersCount: -1 }
    });

    // If this was the best answer, remove that status from question
    if (answer.isBestAnswer) {
      await ForumQuestion.findByIdAndUpdate(answer.question, {
        isSolved: false,
        solvedBy: null
      });
    }

    await answer.deleteOne();

    // Update user stats
    await User.findByIdAndUpdate(req.userId, {
      $inc: { 
        "forumStats.answersGiven": -1,
        "forumStats.bestAnswers": answer.isBestAnswer ? -1 : 0,
        reputation: -10
      }
    });

    console.log("✅ Answer deleted:", req.params.answerId);
    res.json({ message: "Answer deleted" });
  } catch (err) {
    console.error("❌ Delete answer error:", err);
    res.status(500).json({ message: err.message });
  }
});

// Upvote/Downvote answer
router.post("/answers/:answerId/vote", authMiddleware, async (req, res) => {
  try {
    const { voteType } = req.body;
    const answer = await ForumAnswer.findById(req.params.answerId);

    if (!answer) {
      return res.status(404).json({ message: "Answer not found" });
    }

    const userId = req.userId;
    const hasUpvoted = answer.upvotes.includes(userId);
    const hasDownvoted = answer.downvotes.includes(userId);

    if (voteType === "upvote") {
      if (hasUpvoted) {
        answer.upvotes.pull(userId);
        await User.findByIdAndUpdate(answer.author, { 
          $inc: { reputation: -15, "forumStats.helpfulVotes": -1 } 
        });
      } else {
        answer.upvotes.push(userId);
        if (hasDownvoted) {
          answer.downvotes.pull(userId);
          await User.findByIdAndUpdate(answer.author, { 
            $inc: { reputation: 20, "forumStats.helpfulVotes": 1 } 
          });
        } else {
          await User.findByIdAndUpdate(answer.author, { 
            $inc: { reputation: 15, "forumStats.helpfulVotes": 1 } 
          });
        }

        // Notify answer author
        if (answer.author.toString() !== userId) {
          await createNotification(
            answer.author,
            userId,
            "answer_upvoted",
            "Someone upvoted your answer",
            answer.question,
            answer._id,
            `/forum/questions/${answer.question}`
          );
        }
      }
    } else if (voteType === "downvote") {
      if (hasDownvoted) {
        answer.downvotes.pull(userId);
        await User.findByIdAndUpdate(answer.author, { $inc: { reputation: 5 } });
      } else {
        answer.downvotes.push(userId);
        if (hasUpvoted) {
          answer.upvotes.pull(userId);
          await User.findByIdAndUpdate(answer.author, { 
            $inc: { reputation: -20, "forumStats.helpfulVotes": -1 } 
          });
        } else {
          await User.findByIdAndUpdate(answer.author, { $inc: { reputation: -5 } });
        }
      }
    }

    await answer.save();

    res.json({
      message: "Vote recorded",
      upvotes: answer.upvotes.length,
      downvotes: answer.downvotes.length
    });
  } catch (err) {
    console.error("❌ Vote answer error:", err);
    res.status(500).json({ message: err.message });
  }
});

// Mark answer as best
router.post("/answers/:answerId/mark-best", authMiddleware, async (req, res) => {
  try {
    const answer = await ForumAnswer.findById(req.params.answerId).populate("question");

    if (!answer) {
      return res.status(404).json({ message: "Answer not found" });
    }

    const question = answer.question;

    // Remove best answer from other answers
    await ForumAnswer.updateMany(
      { question: question._id, isBestAnswer: true },
      { isBestAnswer: false, markedBestBy: null }
    );

    // Mark this answer as best
    answer.isBestAnswer = true;
    answer.markedBestBy = req.userId;
    await answer.save();

    // Update question
    question.isSolved = true;
    question.solvedBy = answer._id;
    await question.save();

    // Update answer author stats
    await User.findByIdAndUpdate(answer.author, {
      $inc: { "forumStats.bestAnswers": 1, reputation: 50 }
    });

    // Notify answer author
    if (answer.author.toString() !== req.userId) {
      await createNotification(
        answer.author,
        req.userId,
        "answer_marked_best",
        "Your answer was marked as the best answer!",
        question._id,
        answer._id,
        `/forum/questions/${question._id}`
      );
    }

    console.log("✅ Answer marked as best:", answer._id);
    res.json({ message: "Answer marked as best", answer });
  } catch (err) {
    console.error("❌ Mark best answer error:", err);
    res.status(500).json({ message: err.message });
  }
});

// ========================================
// REPLY ROUTES (Nested Comments)
// ========================================

// Add reply to answer
router.post("/answers/:answerId/replies", authMiddleware, upload.array("images", 3), async (req, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ message: "Content is required" });
    }

    const answer = await ForumAnswer.findById(req.params.answerId);
    if (!answer) {
      return res.status(404).json({ message: "Answer not found" });
    }

    // Upload images if any
    let images = [];
    if (req.files && req.files.length > 0) {
      images = await uploadImagesToCloudinary(req.files);
    }

    const reply = {
      author: req.userId,
      content,
      images,
      upvotes: [],
      createdAt: new Date()
    };

    answer.replies.push(reply);
    await answer.save();
    await answer.populate("replies.author", "username avatar designation");

    // Notify answer author
    if (answer.author.toString() !== req.userId) {
      await createNotification(
        answer.author,
        req.userId,
        "answer_replied",
        "Someone replied to your answer",
        answer.question,
        answer._id,
        `/forum/questions/${answer.question}`
      );
    }

    console.log("✅ Reply added to answer:", answer._id);
    res.status(201).json({ message: "Reply added", reply: answer.replies[answer.replies.length - 1] });
  } catch (err) {
    console.error("❌ Add reply error:", err);
    res.status(500).json({ message: err.message });
  }
});

// Delete reply
router.delete("/answers/:answerId/replies/:replyId", authMiddleware, async (req, res) => {
  try {
    const answer = await ForumAnswer.findById(req.params.answerId);

    if (!answer) {
      return res.status(404).json({ message: "Answer not found" });
    }

    const reply = answer.replies.id(req.params.replyId);

    if (!reply) {
      return res.status(404).json({ message: "Reply not found" });
    }

    if (reply.author.toString() !== req.userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Delete images from Cloudinary
    for (const image of reply.images) {
      if (image.publicId) {
        await cloudinary.uploader.destroy(image.publicId);
      }
    }

    answer.replies.pull(req.params.replyId);
    await answer.save();

    console.log("✅ Reply deleted");
    res.json({ message: "Reply deleted" });
  } catch (err) {
    console.error("❌ Delete reply error:", err);
    res.status(500).json({ message: err.message });
  }
});

// Upvote reply
router.post("/answers/:answerId/replies/:replyId/upvote", authMiddleware, async (req, res) => {
  try {
    const answer = await ForumAnswer.findById(req.params.answerId);

    if (!answer) {
      return res.status(404).json({ message: "Answer not found" });
    }

    const reply = answer.replies.id(req.params.replyId);

    if (!reply) {
      return res.status(404).json({ message: "Reply not found" });
    }

    const userId = req.userId;
    const hasUpvoted = reply.upvotes.includes(userId);

    if (hasUpvoted) {
      reply.upvotes.pull(userId);
    } else {
      reply.upvotes.push(userId);
    }

    await answer.save();

    res.json({ message: "Vote recorded", upvotes: reply.upvotes.length });
  } catch (err) {
    console.error("❌ Upvote reply error:", err);
    res.status(500).json({ message: err.message });
  }
});

// ========================================
// NOTIFICATION ROUTES
// ========================================

// Get user notifications
router.get("/notifications", authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const notifications = await Notification.find({ recipient: req.userId })
      .populate("sender", "username avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const unreadCount = await Notification.countDocuments({
      recipient: req.userId,
      isRead: false
    });

    res.json({ notifications, unreadCount });
  } catch (err) {
    console.error("❌ Get notifications error:", err);
    res.status(500).json({ message: err.message });
  }
});

// Mark notification as read
router.put("/notifications/:notificationId/read", authMiddleware, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.notificationId, recipient: req.userId },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.json({ message: "Notification marked as read", notification });
  } catch (err) {
    console.error("❌ Mark notification as read error:", err);
    res.status(500).json({ message: err.message });
  }
});

// Mark all notifications as read
router.put("/notifications/read-all", authMiddleware, async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.userId, isRead: false },
      { isRead: true }
    );

    res.json({ message: "All notifications marked as read" });
  } catch (err) {
    console.error("❌ Mark all notifications as read error:", err);
    res.status(500).json({ message: err.message });
  }
});

export default router;