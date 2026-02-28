import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// REGISTER
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// LOGIN
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password required",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

     // ✅ ADD THIS HERE
    if (user.isBanned) {
      return res.status(403).json({ message: "Account is banned" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    // ✅ ADD THIS PART
    user.isOnline = true;
    user.lastLogin = new Date();
    await user.save();
    
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,   // 🔥 THIS IS REQUIRED
        avatar: user.avatar   // 🔥 add this
      },
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

export const updateAvatar = async (req, res) => {
  try {
    const user = await User.findById(req.user);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.avatar = req.body.avatar;
    await user.save();

    res.json({
      message: "Avatar updated",
      avatar: user.avatar
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/*Google Authentication*/

export const googleAuth = async (req, res) => {
  try {
    const { name, email, avatar } = req.body;

    let user = await User.findOne({ email });

    // If user doesn't exist → create
    if (!user) {
      user = await User.create({
        name,
        email,
        password: "google-auth",
        avatar: avatar || "",
        role: "user",
        isOnline: true,
        isBanned: false,
        lastLogin: new Date()
      });
    } else {
      // If exists → update login info
      if (user.isBanned) {
        return res.status(403).json({ message: "Account is banned" });
      }

      user.isOnline = true;
      user.lastLogin = new Date();
      await user.save();
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE USER
export const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// CHANGE ROLE
export const changeRole = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    user.role = user.role === "admin" ? "user" : "admin";
    await user.save();
    res.json({ message: "Role updated", role: user.role });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// BAN / UNBAN
export const toggleBan = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    user.isBanned = !user.isBanned;
    await user.save();
    res.json({ message: "Ban status updated", isBanned: user.isBanned });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const logout = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.isOnline = false;
      await user.save();
    }

    res.json({ message: "Logged out successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};