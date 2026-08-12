const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { sendWelcomeWhatsAppMessage } = require("../services/whatsappService");

// Register User
const registerUser = async (req, res) => {
  try {
    const { name, email, password, whatsappNumber, whatsappOptIn } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please fill all required fields" });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists with this email" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const normalizedWhatsAppNumber = `${whatsappNumber || ""}`.replace(/\D/g, "");
    const optIn = Boolean(whatsappOptIn);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      whatsappNumber: normalizedWhatsAppNumber ? `+${normalizedWhatsAppNumber}` : "",
      whatsappOptIn: optIn,
      whatsappOptInAt: optIn ? new Date() : null,
      whatsappStatus: optIn ? "pending" : "not_connected",
    });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    if (optIn && normalizedWhatsAppNumber) {
      try {
        await sendWelcomeWhatsAppMessage(user.whatsappNumber);
      } catch (error) {
        console.warn("Welcome message failed to send:", error.message);
      }
    }

    res.status(201).json({
      message: "User Registered Successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        bio: user.bio,
        avatar: user.avatar,
        whatsappNumber: user.whatsappNumber,
        whatsappOptIn: user.whatsappOptIn,
        whatsappStatus: user.whatsappStatus,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Login User
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Please provide email and password" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Login Successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        bio: user.bio,
        avatar: user.avatar,
        whatsappNumber: user.whatsappNumber || "",
        whatsappOptIn: Boolean(user.whatsappOptIn),
        whatsappStatus: user.whatsappStatus || "not_connected",
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get User Profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update User Profile
const updateProfile = async (req, res) => {
  try {
    const { name, bio, avatar, password, whatsappNumber, whatsappOptIn } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (name) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (avatar !== undefined) user.avatar = avatar;
    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }
    if (whatsappNumber !== undefined) {
      const normalized = `${whatsappNumber || ""}`.replace(/\D/g, "");
      user.whatsappNumber = normalized ? `+${normalized}` : "";
    }
    if (whatsappOptIn !== undefined) {
      user.whatsappOptIn = Boolean(whatsappOptIn);
      user.whatsappOptInAt = user.whatsappOptIn ? new Date() : null;
      user.whatsappStatus = user.whatsappOptIn ? "pending" : "not_connected";
    }

    await user.save();

    res.json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        bio: user.bio,
        avatar: user.avatar,
        whatsappNumber: user.whatsappNumber,
        whatsappOptIn: user.whatsappOptIn,
        whatsappStatus: user.whatsappStatus,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
};