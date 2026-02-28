import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

import videoRoutes from "./routes/videoRoutes.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();

const app = express();

// ✅ Proper CORS setup (ONLY ONCE)
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/videos", videoRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("API Running...");
});

// MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);