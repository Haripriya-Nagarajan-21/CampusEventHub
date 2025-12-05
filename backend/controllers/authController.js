import User from "../models/User.js";
import Otp from "../models/Otp.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

export const signup = async (req, res) => {
  console.log("🟢 Received Signup Request Body:", req.body);
  const { fullName, email, password, role, college } = req.body;
  try {
    if (!fullName || !email || !password || !role || !college) {
      console.log("❌ Missing required fields");
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("❌ User already exists");
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      fullName,
      email,
      password: hashedPassword,
      role,
      college,
    });

    console.log("✅ User created:", newUser.email);
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("❌ Signup Error:", err.message);
    res.status(500).json({ message: err.message });
  }
};


// Login
export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "User not found. Please signup first." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid email or password" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        college: user.college
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Forgot Password — Send OTP
export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const otpCode = Math.floor(1000 + Math.random() * 9000).toString();

    await Otp.findOneAndUpdate(
      { email },
      { code: otpCode, expiresAt: new Date(Date.now() + 10 * 60 * 1000) }, // 10 min expiry
      { upsert: true }
    );

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: `"Event Hub" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Password Reset OTP",
      html: `<h2>Password Reset</h2><p>Your OTP is: <b>${otpCode}</b>. Expires in 10 minutes.</p>`
    });

    res.status(200).json({ message: "OTP sent successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Verify OTP
export const verifyOtp = async (req, res) => {
  const { email, code } = req.body;
  try {
    const otpEntry = await Otp.findOne({ email, code });
    if (!otpEntry) return res.status(400).json({ message: "Invalid OTP" });

    if (otpEntry.expiresAt < new Date()) {
      await Otp.deleteOne({ _id: otpEntry._id });
      return res.status(400).json({ message: "OTP expired" });
    }

    res.status(200).json({ message: "OTP verified successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Reset Password
export const resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.passwordChangedAt = new Date(); // ✅ invalidate old sessions
    await user.save();

    await Otp.deleteMany({ email });

    res.status(200).json({ message: "Password reset successful" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
