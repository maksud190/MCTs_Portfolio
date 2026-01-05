// models/projectModel.js - UPDATE comments schema

import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String },
    category: { type: String },
    thumbnail: { type: String, required: true },
    images: [{ type: String }],

    // Tags System
    tags: [{ type: String }],

    // Collaborative Projects
    collaborators: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        role: { type: String, default: "Contributor" },
      },
    ],

    // Engagement
    likes: { type: Number, default: 0 },
    likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    views: { type: Number, default: 0 },

    // Analytics
    viewHistory: [
      {
        date: { type: Date, default: Date.now },
        count: { type: Number, default: 1 },
      },
    ],

    // 🔥 Comments System (UPDATED with flag fields)
    comments: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        text: { type: String, required: true },
        // 🔥 NEW: Flag system
        isFlagged: { type: Boolean, default: false },
        flagReason: { type: String, default: "" },
        replies: [
          {
            user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
            text: { type: String, required: true },
            createdAt: { type: Date, default: Date.now },
          },
        ],
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
      },
    ],

    // SEO
    metaTitle: { type: String },
    metaDescription: { type: String },
    metaKeywords: [{ type: String }],
    slug: { type: String, unique: true, sparse: true },

    // Status
    isPublished: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    isApproved: { type: Boolean, default: true },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    approvedAt: { type: Date },
  },
  { timestamps: true }
);

// Auto-generate slug from title
projectSchema.pre("save", function (next) {
  if (this.isModified("title") && !this.slug) {
    this.slug =
      this.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "") +
      "-" +
      Date.now();
  }
  next();
});

export default mongoose.model("Project", projectSchema);