import express from "express";
import {
  signup,
  login,
  forgotPassword,
  verifyOtp,
  resetPassword,
} from "../controllers/authController.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
const router = express.Router();

// 🔹 User signup

router.post("/signup", async (req, res) => {
  try {
    const { fullName, email, password, college, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
      college,
      role,
    });

    await newUser.save();

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: newUser._id,
        fullName: newUser.fullName,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// 🔹 User login
router.post("/login", login);

// 🔹 Forgot password (send OTP)
router.post("/forgot-password", forgotPassword);

// 🔹 Verify OTP
router.post("/verify-otp", verifyOtp);

// 🔹 Reset password
router.post("/reset-password", resetPassword);

export default router;
