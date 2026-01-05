// models/Category.js (UPDATE)
import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    icon: {
      type: String,
      default: "📁"
    },
    subcategories: [{
      type: String,
      trim: true
    }],
    isActive: {
      type: Boolean,
      default: true
    },
    projectCount: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

// Index for better performance
categorySchema.index({ name: 1, isActive: 1 });

export default mongoose.model("Category", categorySchema);