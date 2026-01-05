// models/reportModel.js
import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reportedItem: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    itemType: {
      type: String,
      enum: ["project", "comment", "user"],
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    description: String,
    status: {
      type: String,
      enum: ["pending", "reviewed", "resolved", "rejected"],
      default: "pending",
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    reviewedAt: Date,
  },
  { timestamps: true }
);

export default mongoose.model("Report", reportSchema);