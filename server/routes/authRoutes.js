import express from "express";
import {
  register,
  login,
  updateAvatar,
  googleAuth,
  logout,
  getAllUsers,
  deleteUser,
  changeRole,
  toggleBan
} from "../controllers/authController.js";

import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";

const router = express.Router();

/* ===============================
   AUTH ROUTES
================================= */

router.post("/register", register);
router.post("/login", login);
router.post("/google", googleAuth);
router.post("/logout", protect, logout);

router.put("/avatar", protect, updateAvatar);

/* ===============================
   ADMIN ROUTES
================================= */

router.get("/admin/users", protect, adminOnly, getAllUsers);

router.delete("/admin/user/:id", protect, adminOnly, deleteUser);

router.put("/admin/user/role/:id", protect, adminOnly, changeRole);

router.put("/admin/user/ban/:id", protect, adminOnly, toggleBan);



export default router;