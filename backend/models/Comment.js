// import mongoose from "mongoose";

// const commentSchema = new mongoose.Schema(
//   {
//     project: { 
//       type: mongoose.Schema.Types.ObjectId, 
//       ref: "Project", 
//       required: true 
//     },
//     user: { 
//       type: mongoose.Schema.Types.ObjectId, 
//       ref: "User", 
//       required: true 
//     },
//     text: { 
//       type: String, 
//       required: true 
//     },
//     replies: [{
//       user: { 
//         type: mongoose.Schema.Types.ObjectId, 
//         ref: "User" 
//       },
//       text: { 
//         type: String, 
//         required: true 
//       },
//       createdAt: { 
//         type: Date, 
//         default: Date.now 
//       }
//     }],
//     isApproved: { 
//       type: Boolean, 
//       default: true 
//     },
//     isFlagged: { 
//       type: Boolean, 
//       default: false 
//     },
//     flagReason: { 
//       type: String 
//     }
//   },
//   { timestamps: true }
// );

// export default mongoose.model("Comment", commentSchema);
















import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    text: {
      type: String,
      required: true
    },
    // 🔥 NEW: Flag system
    isFlagged: {
      type: Boolean,
      default: false
    },
    flagReason: {
      type: String,
      default: ""
    },
    replies: [
      {
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
      }
    ]
  },
  { timestamps: true }
);

// Indexes
commentSchema.index({ project: 1, createdAt: -1 });
commentSchema.index({ user: 1 });
commentSchema.index({ isFlagged: 1 });

export default mongoose.model("Comment", commentSchema);