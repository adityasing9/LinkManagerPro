import { useEffect, useState } from "react";
import styles from "./App.module.css";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";

import {
  getVideos,
  addVideo,
  searchByTitle,
  deleteVideo,
  updateVideo,
  getPreview,
} from "./videoApi";

function App() {
  const navigate = useNavigate();

  const [videos, setVideos] = useState([]);
  const [search, setSearch] = useState("");
  const [sortOption, setSortOption] = useState("");
  const [editId, setEditId] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
 

  const handleAvatarChange = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onloadend = async () => {
    const base64Image = reader.result;

    try {
      const res = await axios.put(
        "http://localhost:5000/api/auth/avatar",
        { avatar: base64Image },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );

      setAvatar(res.data.avatar);

      const updatedUser = {
        ...user,
        avatar: res.data.avatar
      };

      localStorage.setItem("user", JSON.stringify(updatedUser));

    } catch (err) {
      console.log(err);
    }
  };

  reader.readAsDataURL(file);
};

  const [form, setForm] = useState({
    title: "",
    link: "",
    category: "",
    description: "",
  });

  // Safe user parsing
  let user = null;

try {
  const storedUser = localStorage.getItem("user");
  if (storedUser && storedUser !== "undefined") {
    user = JSON.parse(storedUser);
  }
} catch (err) {
  console.error("Invalid user in localStorage");
  localStorage.removeItem("user");
}

 const [avatar, setAvatar] = useState(user?.avatar || "");



  // 🔐 Protect route + fetch videos
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
    } else {
      fetchVideos();
    }
  }, []);

  // Fetch videos
  const fetchVideos = async () => {
    try {
      const res = await getVideos();
      setVideos(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Logout
const handleLogout = async () => {
  try {
    await axios.post(
      "http://localhost:5000/api/auth/logout",
      {},
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      }
    );
  } catch (err) {
    console.log(err);
  }

  localStorage.removeItem("token");
  localStorage.removeItem("user");

  navigate("/login");
};

  // Search
  const handleSearch = async () => {
  if (!search.trim()) {
    fetchVideos();
    return;
  }

  const res = await searchByTitle(search);
  setVideos(res.data);
};

  // Add / Update
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (editId) {
      await updateVideo(editId, form);
      setEditId(null);
    } else {
      await addVideo(form);
    }

    setForm({
      title: "",
      link: "",
      category: "",
      description: "",
    });

    setPreview(null);
    fetchVideos();
  };

  // Delete
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this video?"
    );
    if (!confirmDelete) return;

    await deleteVideo(id);
    fetchVideos();
  };

  // Copy link
  const handleCopy = async (link, id) => {
    try {
      await navigator.clipboard.writeText(link);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch (err) {
      console.error("Copy failed", err);
    }
  };

  // Sorting
  const sortedVideos = [...videos].sort((a, b) => {
    if (sortOption === "name-asc")
      return a.title.localeCompare(b.title);

    if (sortOption === "name-desc")
      return b.title.localeCompare(a.title);

    if (sortOption === "category-asc")
      return a.category.localeCompare(b.category);

    if (sortOption === "category-desc")
      return b.category.localeCompare(a.category);

    return 0;
  });

  return (
    <div className={styles.container}>
      
      {/* ✅ NAVBAR */}
      <div className={styles.navbar}>
        <div className={styles.navLeft}>
          <h2 className={styles.logo}>Link Manager Pro</h2>
        </div>

        <div className={styles.navRight}>
          <span className={styles.userName}>
            {user?.name || "User"}
          </span>

          <label className={styles.avatarWrapper}>
  <img
    src={
      avatar ||
      `https://ui-avatars.com/api/?name=${user?.name}`
    }
    alt="avatar"
    className={styles.avatar}
  />

  <input
    type="file"
    accept="image/*"
    onChange={handleAvatarChange}
    hidden
  />
</label>

          <button
            className={styles.logoutBtn}
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>

      {/* SEARCH + SORT */}
      <div className={styles.searchSection}>
        <input
          placeholder="Search by title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSearch();
          }}
          className={styles.searchInput}
        />

        <button
          onClick={handleSearch}
          className={styles.searchBtn}
        >
          Search
        </button>

        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          className={styles.searchInput}
        >
          <option value="">Sort By</option>
          <option value="name-asc">Name (A → Z)</option>
          <option value="name-desc">Name (Z → A)</option>
          <option value="category-asc">Category (A → Z)</option>
          <option value="category-desc">Category (Z → A)</option>
        </select>
      </div>

      {/* FORM */}
      <form onSubmit={handleSubmit} className={styles.topSection}>
        <input
          placeholder="Title"
          value={form.title}
          onChange={(e) =>
            setForm({ ...form, title: e.target.value })
          }
          className={styles.input}
        />

        <input
          placeholder="Link"
          value={form.link}
          onChange={async (e) => {
            const newLink = e.target.value;
            setForm({ ...form, link: newLink });

            if (newLink.startsWith("http")) {
              try {
                setLoadingPreview(true);
                const res = await getPreview(newLink);
                setPreview(res.data);
              } catch {
                setPreview(null);
              } finally {
                setLoadingPreview(false);
              }
            }
          }}
          className={styles.input}
        />

        {loadingPreview && (
          <div className={styles.previewCard}>
            Loading preview...
          </div>
        )}

        {preview && !loadingPreview && (
          <div className={styles.previewCard}>
            {preview.image && (
              <img
                src={preview.image}
                alt="preview"
                className={styles.previewImage}
              />
            )}
            <div className={styles.previewTitle}>
              {preview.title}
            </div>
            <div className={styles.previewDescription}>
              {preview.description}
            </div>
          </div>
        )}

        <input
          placeholder="Category"
          value={form.category}
          onChange={(e) =>
            setForm({ ...form, category: e.target.value })
          }
          className={styles.input}
        />

        <input
          placeholder="Description"
          value={form.description}
          onChange={(e) =>
            setForm({ ...form, description: e.target.value })
          }
          className={styles.input}
        />

        <button
          type="submit"
          className={styles.buttonPrimary}
        >
          {editId ? "Update" : "Save"}
        </button>
      </form>

      {/* VIDEO GRID */}
      <div className={styles.grid}>
        {sortedVideos.map((video) => (
          <motion.div
  key={video._id}
  className={styles.card}
  style={{ perspective: 1000 }}
  whileHover={{ scale: 1.05 }}
  onMouseMove={(e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = (y - centerY) / 20;
    const rotateY = (centerX - x) / 20;

    e.currentTarget.style.transform =
      `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.transform =
      "rotateX(0deg) rotateY(0deg) scale(1)";
  }}
>
            <div className={styles.title}>
              {video.title}
            </div>

            <div className={styles.category}>
              {video.category}
            </div>

            <div className={styles.description}>
              {video.description || "No description"}
            </div>

            <div className={styles.cardButtons}>
              <a
                href={video.link}
                target="_blank"
                rel="noreferrer"
                className={styles.openBtn}
              >
                Open
              </a>

              <button
                onClick={() =>
                  handleCopy(video.link, video._id)
                }
                className={styles.copyBtn}
              >
                {copiedId === video._id
                  ? "Copied!"
                  : "Copy"}
              </button>

              <button
                onClick={() => {
                  setForm({
                    title: video.title,
                    link: video.link,
                    category: video.category,
                    description: video.description,
                  });
                  setEditId(video._id);
                }}
                className={styles.editBtn}
              >
                Edit
              </button>

              <button
                onClick={() =>
                  handleDelete(video._id)
                }
                className={styles.deleteBtn}
              >
                Delete
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default App;