import express from "express";
import { authMiddleware, adminMiddleware } from "../middleware/authMiddleware.js";
import ForumQuestion from "../models/ForumQuestion.js";
import ForumAnswer from "../models/ForumAnswer.js";
import User from "../models/userModel.js";
import Notification from "../models/Notification.js";
import cloudinary from "../config/cloudinary.js";

const router = express.Router();

// ========================================
// FORUM MODERATION ROUTES
// ========================================

// Get forum stats
router.get("/forum/stats", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const totalQuestions = await ForumQuestion.countDocuments();
    const solvedQuestions = await ForumQuestion.countDocuments({ isSolved: true });
    const unsolvedQuestions = await ForumQuestion.countDocuments({ isSolved: false });
    const totalAnswers = await ForumAnswer.countDocuments();
    const flaggedQuestions = await ForumQuestion.countDocuments({ isFlagged: true });
    const flaggedAnswers = await ForumAnswer.countDocuments({ isFlagged: true });

    res.json({
      totalQuestions,
      solvedQuestions,
      unsolvedQuestions,
      totalAnswers,
      flaggedContent: flaggedQuestions,
      flaggedAnswers
    });
  } catch (err) {
    console.error("❌ Get forum stats error:", err);
    res.status(500).json({ message: err.message });
  }
});

// Get all questions with filters
router.get("/forum/questions", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { filter = "all", page = 1, limit = 10 } = req.query;
    let query = {};

    // Apply filters
    switch (filter) {
      case "solved":
        query.isSolved = true;
        break;
      case "unsolved":
        query.isSolved = false;
        break;
      case "flagged":
        query.isFlagged = true;
        break;
      default:
        // all - no filter
        break;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const questions = await ForumQuestion.find(query)
      .populate("author", "username avatar designation role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await ForumQuestion.countDocuments(query);

    res.json({
      questions,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      total
    });
  } catch (err) {
    console.error("❌ Get admin questions error:", err);
    res.status(500).json({ message: err.message });
  }
});

// Get all answers with filters
router.get("/forum/answers", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { filter = "all", page = 1, limit = 10 } = req.query;
    let query = {};
    let sort = { createdAt: -1 };

    // Apply filters
    switch (filter) {
      case "best":
        query.isBestAnswer = true;
        break;
      case "flagged":
        query.isFlagged = true;
        break;
      case "recent":
        // Default sort
        break;
      default:
        // all
        break;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const answers = await ForumAnswer.find(query)
      .populate("author", "username avatar designation role")
      .populate("question", "title _id")
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await ForumAnswer.countDocuments(query);

    res.json({
      answers,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      total
    });
  } catch (err) {
    console.error("❌ Get admin answers error:", err);
    res.status(500).json({ message: err.message });
  }
});

// Delete question (admin)
router.delete("/forum/questions/:questionId", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const question = await ForumQuestion.findById(req.params.questionId);

    if (!question) {
      return res.status(404).json({ message: "Question not found" });
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
      // Delete answer images
      for (const image of answer.images) {
        if (image.publicId) {
          await cloudinary.uploader.destroy(image.publicId);
        }
      }
    }
    await ForumAnswer.deleteMany({ question: req.params.questionId });

    // Notify question author
    await Notification.create({
      recipient: question.author,
      type: "question_deleted_admin",
      message: "Your question has been removed by moderators for violating community guidelines.",
      link: "/forum"
    });

    // Delete question
    await question.deleteOne();

    // Update user stats
    await User.findByIdAndUpdate(question.author, {
      $inc: { "forumStats.questionsAsked": -1 }
    });

    console.log("✅ Question deleted by admin:", req.params.questionId);
    res.json({ message: "Question deleted successfully" });
  } catch (err) {
    console.error("❌ Delete question error:", err);
    res.status(500).json({ message: err.message });
  }
});

// Delete answer (admin)
router.delete("/forum/answers/:answerId", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const answer = await ForumAnswer.findById(req.params.answerId);

    if (!answer) {
      return res.status(404).json({ message: "Answer not found" });
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

    // Notify answer author
    await Notification.create({
      recipient: answer.author,
      type: "answer_deleted_admin",
      message: "Your answer has been removed by moderators for violating community guidelines.",
      link: "/forum"
    });

    await answer.deleteOne();

    // Update user stats
    await User.findByIdAndUpdate(answer.author, {
      $inc: { 
        "forumStats.answersGiven": -1,
        "forumStats.bestAnswers": answer.isBestAnswer ? -1 : 0
      }
    });

    console.log("✅ Answer deleted by admin:", req.params.answerId);
    res.json({ message: "Answer deleted successfully" });
  } catch (err) {
    console.error("❌ Delete answer error:", err);
    res.status(500).json({ message: err.message });
  }
});

// Flag question
router.put("/forum/questions/:questionId/flag", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { reason } = req.body;
    
    const question = await ForumQuestion.findByIdAndUpdate(
      req.params.questionId,
      { 
        isFlagged: true,
        flagReason: reason || "Flagged by moderator"
      },
      { new: true }
    ).populate("author", "username avatar");

    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    // Notify question author
    await Notification.create({
      recipient: question.author._id,
      type: "question_flagged",
      message: `Your question has been flagged by moderators. Reason: ${reason || "Community guidelines violation"}`,
      link: `/forum/questions/${question._id}`
    });

    console.log("✅ Question flagged:", question._id);
    res.json({ message: "Question flagged successfully", question });
  } catch (err) {
    console.error("❌ Flag question error:", err);
    res.status(500).json({ message: err.message });
  }
});

// Unflag question
router.put("/forum/questions/:questionId/unflag", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const question = await ForumQuestion.findByIdAndUpdate(
      req.params.questionId,
      { 
        isFlagged: false,
        flagReason: ""
      },
      { new: true }
    );

    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    console.log("✅ Question unflagged:", question._id);
    res.json({ message: "Question unflagged successfully", question });
  } catch (err) {
    console.error("❌ Unflag question error:", err);
    res.status(500).json({ message: err.message });
  }
});

// Flag answer
router.put("/forum/answers/:answerId/flag", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { reason } = req.body;
    
    const answer = await ForumAnswer.findByIdAndUpdate(
      req.params.answerId,
      { 
        isFlagged: true,
        flagReason: reason || "Flagged by moderator"
      },
      { new: true }
    ).populate("author", "username avatar");

    if (!answer) {
      return res.status(404).json({ message: "Answer not found" });
    }

    // Notify answer author
    await Notification.create({
      recipient: answer.author._id,
      type: "answer_flagged",
      message: `Your answer has been flagged by moderators. Reason: ${reason || "Community guidelines violation"}`,
      link: `/forum/questions/${answer.question}`
    });

    console.log("✅ Answer flagged:", answer._id);
    res.json({ message: "Answer flagged successfully", answer });
  } catch (err) {
    console.error("❌ Flag answer error:", err);
    res.status(500).json({ message: err.message });
  }
});

// Unflag answer
router.put("/forum/answers/:answerId/unflag", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const answer = await ForumAnswer.findByIdAndUpdate(
      req.params.answerId,
      { 
        isFlagged: false,
        flagReason: ""
      },
      { new: true }
    );

    if (!answer) {
      return res.status(404).json({ message: "Answer not found" });
    }

    console.log("✅ Answer unflagged:", answer._id);
    res.json({ message: "Answer unflagged successfully", answer });
  } catch (err) {
    console.error("❌ Unflag answer error:", err);
    res.status(500).json({ message: err.message });
  }
});

export default router;