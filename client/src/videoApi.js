import axios from "axios";
import BASE_URL from "../api";

const api = axios.create({
  baseURL: `${BASE_URL}/api`,
});

api.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");

  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }

  return req;
});

export const getVideos = () => api.get("/videos");

export const addVideo = (data) =>
  api.post("/videos", data);

export const updateVideo = (id, data) =>
  api.put(`/videos/${id}`, data);

export const deleteVideo = (id) =>
  api.delete(`/videos/${id}`);

export const searchByTitle = (title) =>
  api.get(`/videos/search/${title}`);

export const getPreview = (url) =>
  api.get(`/videos/preview?url=${encodeURIComponent(url)}`);