import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    avatar: { type: String, default: "" },  // ✅ comma added
    role: { type: String, enum: ["user", "admin"], default: "user" },
    isOnline: { type: Boolean, default: false },
    isBanned: { type: Boolean, default: false },
    lastLogin: { type: Date },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user"
    }
  },
  { timestamps: true }
);



export default mongoose.model("User", userSchema);



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