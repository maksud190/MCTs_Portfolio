// routes/categoryRoutes.js
import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import Category from "../models/Category.js";
import Project from "../models/projectModel.js";
import User from "../models/userModel.js";

const router = express.Router();

// Middleware to check if user is admin
const adminMiddleware = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    next();
  } catch (err) {
    console.error("❌ Admin middleware error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// 🔥 Get all active categories (Public - for Upload page)
router.get("/", async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true })
      .sort({ name: 1 });

    // Update project counts
    for (const category of categories) {
      const count = await Project.countDocuments({
        category: new RegExp(`^${category.name}`, "i")
      });
      category.projectCount = count;
    }

    res.json(categories);
  } catch (err) {
    console.error("❌ Get categories error:", err);
    res.status(500).json({ message: err.message });
  }
});

// 🔥 Get all categories (Admin only)
router.get("/admin/all", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });

    // Update project counts
    for (const category of categories) {
      const count = await Project.countDocuments({
        category: new RegExp(`^${category.name}`, "i")
      });
      category.projectCount = count;
      await category.save();
    }

    res.json(categories);
  } catch (err) {
    console.error("❌ Get admin categories error:", err);
    res.status(500).json({ message: err.message });
  }
});

// 🔥 Create category (Admin only)
router.post("/admin", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { name, icon, subcategories, isActive } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Category name is required" });
    }

    // Check if category already exists
    const existingCategory = await Category.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, "i") }
    });

    if (existingCategory) {
      return res.status(400).json({ message: "Category already exists" });
    }

    const category = new Category({
      name: name.trim(),
      icon: icon || "📁",
      subcategories: subcategories || [],
      isActive: isActive !== undefined ? isActive : true,
      projectCount: 0
    });

    await category.save();

    console.log("✅ Category created:", category._id);
    res.status(201).json({ message: "Category created", category });
  } catch (err) {
    console.error("❌ Create category error:", err);
    res.status(500).json({ message: err.message });
  }
});

// 🔥 Update category (Admin only)
router.put("/admin/:categoryId", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { name, icon, subcategories, isActive } = req.body;

    const category = await Category.findById(req.params.categoryId);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Check if new name conflicts with existing category
    if (name && name !== category.name) {
      const existingCategory = await Category.findOne({ 
        name: { $regex: new RegExp(`^${name}$`, "i") },
        _id: { $ne: req.params.categoryId }
      });

      if (existingCategory) {
        return res.status(400).json({ message: "Category name already exists" });
      }

      // Update all projects with old category name
      const oldCategoryPattern = new RegExp(`^${category.name}`, "i");
      const projectsToUpdate = await Project.find({ 
        category: oldCategoryPattern 
      });

      for (const project of projectsToUpdate) {
        project.category = project.category.replace(
          oldCategoryPattern,
          name.trim()
        );
        await project.save();
      }
    }

    category.name = name?.trim() || category.name;
    category.icon = icon || category.icon;
    category.subcategories = subcategories || category.subcategories;
    category.isActive = isActive !== undefined ? isActive : category.isActive;

    await category.save();

    console.log("✅ Category updated:", category._id);
    res.json({ message: "Category updated", category });
  } catch (err) {
    console.error("❌ Update category error:", err);
    res.status(500).json({ message: err.message });
  }
});

// 🔥 Delete category (Admin only)
router.delete("/admin/:categoryId", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const category = await Category.findById(req.params.categoryId);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Check if category has projects
    const projectCount = await Project.countDocuments({
      category: new RegExp(`^${category.name}`, "i")
    });

    if (projectCount > 0) {
      return res.status(400).json({ 
        message: `Cannot delete category. ${projectCount} project(s) are using this category. Please reassign or delete those projects first.` 
      });
    }

    await category.deleteOne();

    console.log("✅ Category deleted:", req.params.categoryId);
    res.json({ message: "Category deleted" });
  } catch (err) {
    console.error("❌ Delete category error:", err);
    res.status(500).json({ message: err.message });
  }
});

export default router;