import mongoose from "mongoose";

const announcementSchema = new mongoose.Schema(
  {
    title: { 
      type: String, 
      required: true 
    },
    content: { 
      type: String, 
      required: true 
    },
    type: { 
      type: String, 
      enum: ["info", "warning", "success", "error"],
      default: "info" 
    },
    isActive: { 
      type: Boolean, 
      default: true 
    },
    expiresAt: { 
      type: Date 
    },
    createdBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    // 🔥 NEW: Replies System
    replies: [{
      user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User",
        required: true
      },
      text: { 
        type: String, 
        required: true 
      },
      createdAt: { 
        type: Date, 
        default: Date.now 
      }
    }]
  },
  { timestamps: true }
);

export default mongoose.model("Announcement", announcementSchema);