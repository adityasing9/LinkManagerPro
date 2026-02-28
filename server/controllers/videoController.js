import Video from "../models/Video.js";

export const addVideo = async (req, res) => {
  try {
    const { title, link, category, description } = req.body;

    const video = await Video.create({
      title,
      link,
      category,
      description,
      user: req.user,   // 🔥 VERY IMPORTANT
    });

    res.status(201).json(video);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all videos
export const getVideos = async (req, res) => {
  try {
    const videos = await Video.find({ user: req.user });
    res.json(videos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Search by category
export const searchByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const videos = await Video.find({ category });
    res.json(videos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Search by title
export const searchByTitle = async (req, res) => {
  try {
    const { title } = req.params;

    const videos = await Video.find({
      user: req.user,   // 🔥 VERY IMPORTANT
      title: { $regex: title, $options: "i" },
    });

    res.json(videos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete video
export const deleteVideo = async (req, res) => {
  try {
    const { id } = req.params;
    await Video.findByIdAndDelete(id);
    res.json({ message: "Video deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update video
export const updateVideo = async (req, res) => {
  try {
    const updated = await Video.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

import ogs from "open-graph-scraper";

export const getLinkPreview = async (req, res) => {
  try {
    const { url } = req.query;

    const { result } = await ogs({ url });

    // Fallback image if no og:image
    const image =
      result.ogImage?.[0]?.url ||
      "https://via.placeholder.com/600x400?text=No+Preview";

    res.json({
      title: result.ogTitle || "No title available",
      description: result.ogDescription || "No description available",
      image,
    });

  } catch (error) {
    res.status(500).json({
      title: "Preview unavailable",
      description: "",
      image: "https://via.placeholder.com/600x400?text=Preview+Failed",
    });
  }
};