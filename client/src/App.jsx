import { useEffect, useState } from "react";
import styles from "./App.module.css";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import API from "./api";

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

  // ✅ Parse user safely FIRST
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

  // STATES
  const [avatar, setAvatar] = useState(user?.avatar || "");
  const [videos, setVideos] = useState([]);
  const [search, setSearch] = useState("");
  const [sortOption, setSortOption] = useState("");
  const [editId, setEditId] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const [form, setForm] = useState({
    title: "",
    link: "",
    category: "",
    description: "",
  });

  // 🔐 Protect route
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
    } else {
      fetchVideos();
    }
  }, []);

  // FETCH VIDEOS
  const fetchVideos = async () => {
    try {
      const res = await getVideos();
      setVideos(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // LOGOUT
  const handleLogout = async () => {
    try {
      await axios.post(
        `${API}/api/auth/logout`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
    } catch (err) {
      console.log(err);
    }

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // AVATAR CHANGE
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onloadend = async () => {
      try {
        const res = await axios.put(
          `${API}/api/auth/avatar`,
          { avatar: reader.result },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        setAvatar(res.data.avatar);

        const updatedUser = {
          ...user,
          avatar: res.data.avatar,
        };

        localStorage.setItem("user", JSON.stringify(updatedUser));
      } catch (err) {
        console.log(err);
      }
    };

    reader.readAsDataURL(file);
  };

  // SEARCH
  const handleSearch = async () => {
    if (!search.trim()) {
      fetchVideos();
      return;
    }

    const res = await searchByTitle(search);
    setVideos(res.data);
  };

  // SUBMIT (ADD / UPDATE)
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

  // DELETE
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this video?")) return;
    await deleteVideo(id);
    fetchVideos();
  };

  // COPY LINK
  const handleCopy = async (link, id) => {
    try {
      await navigator.clipboard.writeText(link);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch (err) {
      console.error(err);
    }
  };

  // SORTING
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
      {/* NAVBAR */}
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
              hidden
              onChange={handleAvatarChange}
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
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
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
            whileHover={{ scale: 1.05 }}
          >
            <div className={styles.title}>{video.title}</div>
            <div className={styles.category}>{video.category}</div>
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