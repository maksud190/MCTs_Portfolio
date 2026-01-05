import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    // 👤 Basic Identity
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    username: {
      type: String,
      required: true,
      unique: true,     
      trim: true,
      minlength: 3,
      maxlength: 20,
    },

    email: {
      type: String,
      required: true,
      unique: true,     
      lowercase: true,
      trim: true,
    },

    password: { type: String, required: true },

    avatar: { type: String, default: "" },
    bio: { type: String, default: "" },

    // ✅ Role & Designation
    role: {
      type: String,
      enum: ["student", "teacher", "admin"],
      default: "student",
    },
    designation: {
      type: String,
      default: "Undergraduate Student",
    },
    department: {
      type: String,
      default: "Multimedia and Creative Technology",
    },

    // 🔥 Student details
    studentId: { type: String, default: "" },
    batch: { type: String, default: "" },
    idCardImage: { type: String, default: "" },
    batchAdvisor: { type: String, default: "" },
    batchMentor: { type: String, default: "" },

    // 🔥 Profile Customization
    coverPhoto: { type: String, default: "" },
    socialLinks: {
      linkedin: { type: String, default: "" },
      github: { type: String, default: "" },
      behance: { type: String, default: "" },
      portfolio: { type: String, default: "" },
      twitter: { type: String, default: "" },
      instagram: { type: String, default: "" },
      facebook: { type: String, default: "" },
    },
    skills: [{ type: String }],
    customUrl: { type: String, unique: true, sparse: true },

    // 🔥 Follow System
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    // 🔥 Contact/Hire Me
    isAvailableForHire: { type: Boolean, default: false },
    hourlyRate: { type: String, default: "" },

    // 🔥 Email Verification
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String },
    emailVerificationExpires: { type: Date },

    // 🔥 Admin & Status
    isActive: { type: Boolean, default: true },
    isBlocked: { type: Boolean, default: false },

    // 🔥 Notifications
    notifications: [
      {
        type: { type: String, enum: ["like", "comment", "follow", "upload"] },
        message: { type: String },
        from: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        project: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
        read: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now },
      },
    ],

    // 🔥 Forum / Reputation
    reputation: {
      type: Number,
      default: 0,
    },
    forumStats: {
      questionsAsked: { type: Number, default: 0 },
      answersGiven: { type: Number, default: 0 },
      bestAnswers: { type: Number, default: 0 },
      helpfulVotes: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);



export default mongoose.model("User", userSchema);