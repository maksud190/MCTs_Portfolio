import mongoose from "mongoose";

const testimonialSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      required: true,
      enum: ["Instructor", "Alumni", "Student", "Guest"],
      default: "Alumni",
    },
    designation: {
      type: String,
      required: true,
      trim: true,
    },
    avatar: {
      type: String,
      default: "",
    },
    message: {
      type: String,
      required: true,
      maxlength: 500,
    },
    company: {
      type: String,
      default: "",
    },
    graduationYear: {
      type: String,
      default: "",
    },
    linkedIn: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for sorting
testimonialSchema.index({ order: 1, createdAt: -1 });
testimonialSchema.index({ isActive: 1 });

const Testimonial = mongoose.model("Testimonial", testimonialSchema);

export default Testimonial;