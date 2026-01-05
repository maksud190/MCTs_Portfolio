import express from "express";
import Testimonial from "../models/Testimonial.js";
import { authMiddleware as verifyToken, adminMiddleware as isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get all active testimonials (Public)
router.get("/", async (req, res) => {
  try {
    const testimonials = await Testimonial.find({ isActive: true })
      .sort({ order: 1, createdAt: -1 })
      .select("-__v");

    res.json(testimonials);
  } catch (err) {
    console.error("Error fetching testimonials:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all testimonials (Admin only)
router.get("/all", verifyToken, isAdmin, async (req, res) => {
  try {
    const testimonials = await Testimonial.find()
      .sort({ order: 1, createdAt: -1 })
      .select("-__v");

    res.json(testimonials);
  } catch (err) {
    console.error("Error fetching all testimonials:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get single testimonial by ID
router.get("/:id", async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);

    if (!testimonial) {
      return res.status(404).json({ message: "Testimonial not found" });
    }

    res.json(testimonial);
  } catch (err) {
    console.error("Error fetching testimonial:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Create new testimonial (Admin only)
router.post("/", verifyToken, isAdmin, async (req, res) => {
  try {
    const {
      name,
      role,
      designation,
      avatar,
      message,
      company,
      graduationYear,
      linkedIn,
      isActive,
      order,
    } = req.body;

    // Validation
    if (!name || !role || !designation || !message) {
      return res.status(400).json({
        message: "Name, role, designation, and message are required",
      });
    }

    if (message.length > 500) {
      return res.status(400).json({
        message: "Message must be 500 characters or less",
      });
    }

    const testimonial = new Testimonial({
      name,
      role,
      designation,
      avatar: avatar || "",
      message,
      company: company || "",
      graduationYear: graduationYear || "",
      linkedIn: linkedIn || "",
      isActive: isActive !== undefined ? isActive : true,
      order: order || 0,
    });

    await testimonial.save();

    res.status(201).json({
      message: "Testimonial created successfully",
      testimonial,
    });
  } catch (err) {
    console.error("Error creating testimonial:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Update testimonial (Admin only)
router.put("/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    const {
      name,
      role,
      designation,
      avatar,
      message,
      company,
      graduationYear,
      linkedIn,
      isActive,
      order,
    } = req.body;

    // Validation
    if (message && message.length > 500) {
      return res.status(400).json({
        message: "Message must be 500 characters or less",
      });
    }

    const testimonial = await Testimonial.findById(req.params.id);

    if (!testimonial) {
      return res.status(404).json({ message: "Testimonial not found" });
    }

    // Update fields
    if (name !== undefined) testimonial.name = name;
    if (role !== undefined) testimonial.role = role;
    if (designation !== undefined) testimonial.designation = designation;
    if (avatar !== undefined) testimonial.avatar = avatar;
    if (message !== undefined) testimonial.message = message;
    if (company !== undefined) testimonial.company = company;
    if (graduationYear !== undefined)
      testimonial.graduationYear = graduationYear;
    if (linkedIn !== undefined) testimonial.linkedIn = linkedIn;
    if (isActive !== undefined) testimonial.isActive = isActive;
    if (order !== undefined) testimonial.order = order;

    await testimonial.save();

    res.json({
      message: "Testimonial updated successfully",
      testimonial,
    });
  } catch (err) {
    console.error("Error updating testimonial:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Toggle testimonial active status (Admin only)
router.patch("/:id/toggle", verifyToken, isAdmin, async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);

    if (!testimonial) {
      return res.status(404).json({ message: "Testimonial not found" });
    }

    testimonial.isActive = !testimonial.isActive;
    await testimonial.save();

    res.json({
      message: `Testimonial ${
        testimonial.isActive ? "activated" : "deactivated"
      } successfully`,
      testimonial,
    });
  } catch (err) {
    console.error("Error toggling testimonial:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete testimonial (Admin only)
router.delete("/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);

    if (!testimonial) {
      return res.status(404).json({ message: "Testimonial not found" });
    }

    await testimonial.deleteOne();

    res.json({ message: "Testimonial deleted successfully" });
  } catch (err) {
    console.error("Error deleting testimonial:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;