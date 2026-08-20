import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

import "./Login.css";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(event) {
    event.preventDefault();

    setError("");

    if (!email || !password) {
      setError("Please enter your email and password");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        "http://https://hospital-management-system-nvjt.onrender.com/api/auth/login",
        {
          email,
          password,
        }
      );

      const { token, user } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      if (user.role === "admin") {
        navigate("/admin");
      } else if (user.role === "patient") {
        navigate("/patient");
      } else if (user.role === "doctor") {
        navigate("/doctor");
      } else if (user.role === "receptionist") {
        navigate("/receptionist");
      } else {
        navigate("/");
      }
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to login. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-container">

        <div className="login-brand">
          <div className="hospital-icon">
            +
          </div>

          <h1>Hospital Management</h1>

          <p>
            Manage your hospital operations
            in one place.
          </p>
        </div>

        <div className="login-card">
          <h2>Welcome Back</h2>

          <p className="login-subtitle">
            Please login to your account
          </p>

          <form onSubmit={handleLogin}>

            <div className="form-group">
              <label htmlFor="email">
                Email Address
              </label>

              <input
                id="email"
                type="email"
                value={email}
                placeholder="Enter your email"
                onChange={(event) =>
                  setEmail(event.target.value)
                }
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">
                Password
              </label>

              <input
                id="password"
                type="password"
                value={password}
                placeholder="Enter your password"
                onChange={(event) =>
                  setPassword(event.target.value)
                }
              />
            </div>

            <div className="login-options">
              <label className="remember-me">
                <input type="checkbox" />

                <span>
                  Remember me
                </span>
              </label>

              <Link
                to="/forgot-password"
                className="forgot-password"
              >
                Forgot Password?
              </Link>
            </div>

            {error && (
              <p className="error-message">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <div className="register-section">
            <span>
              Don't have an account?
            </span>

            <Link to="/register">
              Register
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Login;

