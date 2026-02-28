import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");

  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }

  return req;
});

export const getVideos = () => API.get("/videos");
export const addVideo = (data) => API.post("/videos", data);
export const updateVideo = (id, data) =>
  API.put(`/videos/${id}`, data);
export const deleteVideo = (id) =>
  API.delete(`/videos/${id}`);
export const searchByTitle = (title) =>
  API.get(`/videos/search/${title}`);

export const getPreview = (url) =>
  API.get(`/videos/preview?url=${encodeURIComponent(url)}`);