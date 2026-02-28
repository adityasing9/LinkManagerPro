import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import styles from "./Auth.module.css";

function Register() {
  const navigate = useNavigate();
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async (e) => {
  e.preventDefault();
  setError("");

  try {
    const res = await axios.post(
      "http://localhost:5000/api/auth/register",
      form
    );

    localStorage.setItem("token", res.data.token);
    localStorage.setItem("user", JSON.stringify(res.data.user));

    setSuccess(true);

    setTimeout(() => {
      navigate("/");
    }, 1500);

  } catch (err) {
    setError(err.response?.data?.message || "Registration failed");
  }
};

  return (
    <div className={styles.authWrapper}>
      <motion.div
  className={styles.authCard}
  initial={{ opacity: 0, y: 40, scale: 0.98 }}
  animate={{ opacity: 1, y: 0, scale: 1 }}
  exit={{ opacity: 0, y: -20 }}
  transition={{
    duration: 0.6,
    ease: "easeOut"
  }}
>
 
        <h2 className={styles.logo}>Link Manager Pro</h2>

        <h3 className={styles.heading}>Create Account</h3>

        {error && (
          <div className={styles.errorBox}>{error}</div>
        )}


        {success && (
  <motion.div
    className={styles.successBox}
    initial={{ scale: 0 }}
    animate={{ scale: 1 }}
    transition={{ type: "spring", stiffness: 120 }}
  >
    <motion.svg
      width="60"
      height="60"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#22c55e"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 0.8 }}
    >
      <motion.path d="M20 6L9 17l-5-5" />
    </motion.svg>
    <p>Account Created Successfully</p>
   {/* Your existing card content */}
</motion.div>
)}


        <form onSubmit={handleRegister}>

          
          <input
            type="text"
            placeholder="Full Name"
            value={form.name}
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
            className={styles.input}
            required
          />

          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
            className={styles.input}
            required
          />

          <div className={styles.passwordWrapper}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={form.password}
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
              className={styles.input}
              required
            />
            <span
              className={styles.toggle}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "Hide" : "Show"}
            </span>
          </div>

          <button type="submit" className={styles.primaryBtn}>
            Register
          </button>
        </form>

        <div className={styles.switchText}>
          Already have an account?{" "}
          <Link to="/login">Login</Link>
        </div>
      </motion.div>
    </div>
  );
}

export default Register;