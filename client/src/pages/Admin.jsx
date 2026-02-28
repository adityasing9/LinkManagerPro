import { useEffect, useState } from "react";
import API from "../api";
import axios from "axios";

function Admin() {
    
  const [users, setUsers] = useState([]);

useEffect(() => {
  fetchUsers();
}, []);;

const fetchUsers = async () => {
  try {
    const res = await axios.get(
      `${API}/api/auth/admin/users`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      }
    );

    console.log("API DATA:", res.data); // ADD THIS

    setUsers(res.data);
  } catch (err) {
    console.error("Fetch users error:", err.response?.data || err.message);
  }
};

  const deleteUser = async (id) => {
    if (!window.confirm("Delete this user?")) return;

    await axios.delete(
      `${API}/api/auth/admin/user/${id}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      }
    );

    fetchUsers();
  };

  const changeRole = async (id) => {
    await axios.put(
      `${API}/api/auth/admin/user/role/${id}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      }
    );

    fetchUsers();
  };

  const toggleBan = async (id) => {
    await axios.put(
      `${API}/api/auth/admin/user/ban/${id}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      }
    );

    fetchUsers();
  };

  const handleLogout = async () => {
  try {
    await axios.post(
      `${API}/api/auth/logout`,
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

  // ✅ Stats (AFTER users is defined)
  const totalUsers = users.length;
  const adminCount = users.filter(u => u.role === "admin").length;
  const activeUsers = users.filter(u => !u.isBanned).length;
  const bannedUsers = users.filter(u => u.isBanned).length;

  const today = new Date().toISOString().split("T")[0];

  const onlineUsers = users.filter(u => u.isOnline).length;

  const todayUsers = users.filter(u =>
    u.createdAt?.startsWith(today)
  ).length;

  return (

  <div style={styles.container}>
    <h1 style={styles.title}>Admin Dashboard</h1>

    <button
      onClick={fetchUsers}
      style={{
        marginBottom: "20px",
        padding: "8px 14px",
        borderRadius: "6px",
        border: "none",
        background: "#6c63ff",
        color: "white",
        cursor: "pointer"
      }}
    >
      Refresh Users
    </button>


      

      {/* Stats */}
      <div style={styles.statsRow}>
        <div style={styles.statCard}>
          <h3>Total Users</h3>
          <p>{totalUsers}</p>
        </div>

        <div style={styles.statCard}>
          <h3>Admins</h3>
          <p>{adminCount}</p>
        </div>

    <div style={styles.statCard}>
    <h3>Online Users</h3>
      <p>{onlineUsers}</p>
    </div>

        <div style={styles.statCard}>
          <h3>Banned</h3>
          <p>{bannedUsers}</p>
        </div>

        <div style={styles.statCard}>
          <h3>Joined Today</h3>
          <p>{todayUsers}</p>
        </div>
      </div>
        
      {/* Users Table */}
      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th>Avatar</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td>
                  <img
                    src={
                      user.avatar ||
                      `https://ui-avatars.com/api/?name=${user.name}`
                    }
                    alt="avatar"
                    style={styles.avatar}
                  />
                </td>

                <td>{user.name}</td>
                <td>{user.email}</td>

                <td>
                  <span
                    style={{
                      ...styles.badge,
                      background:
                        user.role === "admin" ? "#6c63ff" : "#4caf50"
                    }}
                  >
                    {user.role}
                  </span>
                </td>

                <td>
  {user.isBanned ? (
    <span
      style={{
        ...styles.badge,
        background: "#e53935"
      }}
    >
      Banned
    </span>
  ) : (
    <span
      style={{
        ...styles.badge,
        background: user.isOnline ? "#2ecc71" : "#999"
      }}
    >
      {user.isOnline ? "Online" : "Offline"}
    </span>
  )}
</td>

                <td style={{ display: "flex", gap: "8px" }}>
                  <button
                    style={styles.button}
                    onClick={() => changeRole(user._id)}
                  >
                    Role
                  </button>

                  <button
                    style={styles.button}
                    onClick={() => toggleBan(user._id)}
                  >
                    {user.isBanned ? "Unban" : "Ban"}
                  </button>

                  <button
                    style={{ ...styles.button, background: "#ff4d4d" }}
                    onClick={() => deleteUser(user._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    padding: "40px",
    background: "linear-gradient(135deg, #1e1e2f, #2a2a40)",
    color: "white",
    fontFamily: "Arial"
  },
  title: {
    marginBottom: "30px"
  },
  statsRow: {
    display: "flex",
    gap: "20px",
    marginBottom: "30px",
    flexWrap: "wrap"
  },
  statCard: {
    flex: 1,
    minWidth: "150px",
    padding: "20px",
    background: "rgba(255,255,255,0.1)",
    borderRadius: "12px",
    backdropFilter: "blur(10px)",
    textAlign: "center"
  },
  tableWrapper: {
    background: "rgba(255,255,255,0.08)",
    padding: "20px",
    borderRadius: "12px",
    backdropFilter: "blur(10px)",
    overflowX: "auto"
  },
  table: {
    width: "100%",
    borderCollapse: "collapse"
  },
  avatar: {
    width: "45px",
    height: "45px",
    borderRadius: "50%"
  },
  button: {
    padding: "6px 10px",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
    background: "#6c63ff",
    color: "white"
  },
  badge: {
    padding: "4px 8px",
    borderRadius: "8px",
    fontSize: "12px",
    color: "white"
  }
};

export default Admin;