import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "./Auth.css";
import { motion } from "framer-motion";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        { email, password }
      );

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
  <motion.div
    className="authContainer"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.5 }}
  >
    <motion.div
      className="authCard"
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -30, scale: 0.95 }}
      transition={{
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1]  // smoother easing
      }}
    >
      <h1 className="logo">Link Manager Pro</h1>
      <p className="subtitle">Welcome back 👋</p>

      {error && <div className="errorBox">{error}</div>}

      <motion.form
        onSubmit={handleLogin}
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: {
            transition: {
              staggerChildren: 0.1
            }
          }
        }}
      >
        <motion.div
          className="inputGroup"
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 }
          }}
        >
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </motion.div>

        <motion.div
          className="inputGroup passwordGroup"
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 }
          }}
        >
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <span
            className="togglePassword"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? "🙈" : "👁"}
          </span>
        </motion.div>

        <motion.button
          type="submit"
          className="authButton"
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 }
          }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          Login
        </motion.button>

        <motion.div
          style={{ marginTop: "20px" }}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 }
          }}
        >
          <GoogleLogin
            onSuccess={async (credentialResponse) => {
              const decoded = jwtDecode(credentialResponse.credential);

              try {
                const res = await axios.post(
                  "http://localhost:5000/api/auth/google",
                  {
                    name: decoded.name,
                    email: decoded.email,
                    avatar: decoded.picture
                  }
                );

                localStorage.setItem("token", res.data.token);
                localStorage.setItem("user", JSON.stringify(res.data.user));

                navigate("/");
              } catch (err) {
                console.log(err);
              }
            }}
            onError={() => {
              console.log("Login Failed");
            }}
          />
        </motion.div>
      </motion.form>

      <div className="authFooter">
        Don’t have an account?{" "}
        <Link to="/register">Create one</Link>
      </div>
    </motion.div>
  </motion.div>
);
}

export default Login;