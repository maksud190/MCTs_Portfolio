// models/ForumQuestion.js - ADD THESE FIELDS

import mongoose from "mongoose";

const forumQuestionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300
    },
    content: {
      type: String,
      required: true
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    categories: [{
      type: String,
      enum: [
        "Programming",
        "Design", 
        "Animation",
        "Video Editing",
        "3D Modeling",
        "Game Development",
        "Web Development",
        "Mobile App",
        "UI/UX",
        "Other"
      ]
    }],
    tags: [{
      type: String,
      trim: true
    }],
    images: [{
      url: String,
      publicId: String
    }],
    // Poll System
    isPoll: {
      type: Boolean,
      default: false
    },
    pollOptions: [{
      option: String,
      votes: [{
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User"
        },
        votedAt: {
          type: Date,
          default: Date.now
        }
      }]
    }],
    // Status
    isSolved: {
      type: Boolean,
      default: false
    },
    solvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ForumAnswer"
    },
    // 🔥 MODERATION FIELDS - ADD THESE
    isFlagged: {
      type: Boolean,
      default: false
    },
    flagReason: {
      type: String,
      default: ""
    },
    // Stats
    views: {
      type: Number,
      default: 0
    },
    upvotes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }],
    downvotes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }],
    // Answers count (for quick access)
    answersCount: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

// Indexes for better performance
forumQuestionSchema.index({ author: 1, createdAt: -1 });
forumQuestionSchema.index({ categories: 1 });
forumQuestionSchema.index({ isSolved: 1 });
forumQuestionSchema.index({ isFlagged: 1 }); // 🔥 ADD THIS INDEX
forumQuestionSchema.index({ createdAt: -1 });

export default mongoose.model("ForumQuestion", forumQuestionSchema);