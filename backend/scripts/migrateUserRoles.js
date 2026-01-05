// // backend/scripts/migrateUserRoles.js
// // Run this ONCE to migrate existing users from role:'user' to role:'student'

// import mongoose from "mongoose";
// import dotenv from "dotenv";
// import User from "../models/userModel.js";

// dotenv.config();

// const migrateUserRoles = async () => {
//   try {
//     await mongoose.connect(process.env.MONGO_URI);
//     console.log("✅ Connected to MongoDB");

//     // Find all users with role 'user' and update to 'student'
//     const result = await User.updateMany(
//       { role: "user" },
//       { $set: { role: "student" } }
//     );

//     console.log(`✅ Migrated ${result.modifiedCount} users from 'user' to 'student'`);

//     // Also set default values for designation and department if empty
//     const result2 = await User.updateMany(
//       { 
//         $or: [
//           { designation: { $exists: false } },
//           { department: { $exists: false } },
//           { designation: "" },
//           { department: "" }
//         ]
//       },
//       { 
//         $set: { 
//           designation: "Undergraduate Student",
//           department: "Multimedia and Creative Technology"
//         }
//       }
//     );

//     console.log(`✅ Updated ${result2.modifiedCount} users with default designation/department`);

//     await mongoose.disconnect();
//     console.log("✅ Migration complete!");
//     process.exit(0);
//   } catch (err) {
//     console.error("❌ Migration error:", err);
//     process.exit(1);
//   }
// };

// migrateUserRoles();