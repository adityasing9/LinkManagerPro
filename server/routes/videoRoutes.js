import express from "express";
import {
  addVideo,
  getVideos,
  searchByTitle,
  deleteVideo,
  updateVideo,
} from "../controllers/videoController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, addVideo);
router.get("/", protect, getVideos);
router.get("/search/:title", protect, searchByTitle);
router.put("/:id", protect, updateVideo);
router.delete("/:id", protect, deleteVideo);

export default router;