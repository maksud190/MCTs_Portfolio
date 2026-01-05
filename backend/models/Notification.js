// models/Notification.js
import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    type: {
      type: String,
      enum: [
        "question_answered",
        "answer_upvoted",
        "answer_marked_best",
        "question_upvoted",
        "answer_replied",
        "mention",
        

        "comment_flagged",
        "comment_deleted",
        "project_liked",
        "project_commented",
        "reply_received"
      ],
      required: true
    },
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ForumQuestion"
    },
    answer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ForumAnswer"
    },
    message: {
      type: String,
      required: true
    },
    link: {
      type: String
    },

    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project"
    },


    isRead: {
      type: Boolean,
      default: false
    },
  },
  { timestamps: true }
);

// Indexes
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

export default mongoose.model("Notification", notificationSchema);