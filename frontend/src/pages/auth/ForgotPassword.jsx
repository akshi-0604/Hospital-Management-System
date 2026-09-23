import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

import "./ForgotPassword.css";
import { useTheme } from "../../context/ThemeContext";

function ForgotPassword() {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    setMessage("");
    setError("");

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setError("Please enter your email address.");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        "https://hospital-management-system-nvjt.onrender.com/api/auth/forgot-password",
        {
          email: trimmedEmail,
        }
      );

      // Save email so ResetPassword.jsx can automatically use it
      sessionStorage.setItem(
        "passwordResetEmail",
        trimmedEmail.toLowerCase()
      );

      setMessage(
        response.data?.message ||
          "Password reset OTP has been sent to your email."
      );

      // Immediately open Reset Password page
      navigate("/reset-password");
    } catch (error) {
      console.error(
        "Forgot password error:",
        error
      );

      if (error.response) {
        setError(
          error.response.data?.message ||
            `Server error (${error.response.status})`
        );
      } else if (error.request) {
        setError(
          "Unable to connect to the server. Please try again."
        );
      } else {
        setError(
          "Something went wrong. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="forgot-password-page">

      {/* THEME BUTTON */}
      <button
        type="button"
        className="forgot-theme-button"
        onClick={toggleTheme}
        title={
          theme === "light"
            ? "Switch to Dark Mode"
            : "Switch to Light Mode"
        }
      >
        <span className="forgot-theme-icon">
          {theme === "light" ? "🌙" : "☀️"}
        </span>

        <span>
          {theme === "light"
            ? "Dark Mode"
            : "Light Mode"}
        </span>
      </button>

      {/* CARD */}
      <div className="forgot-password-card">

        <h1>
          Forgot Password?
        </h1>

        <p className="forgot-password-description">
          Enter your registered email address and
          we'll send you a 6-digit OTP to reset
          your password.
        </p>

        <form onSubmit={handleSubmit}>

          {/* EMAIL */}
          <div className="form-group">
            <label htmlFor="email">
              Email Address
            </label>

            <input
              id="email"
              type="email"
              value={email}
              placeholder="Enter your email"
              autoComplete="email"
              onChange={(event) =>
                setEmail(event.target.value)
              }
              disabled={loading}
              required
            />
          </div>

          {/* SUCCESS */}
          {message && (
            <p className="success-message">
              {message}
            </p>
          )}

          {/* ERROR */}
          {error && (
            <p className="error-message">
              {error}
            </p>
          )}

          {/* BUTTON */}
          <button
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Sending OTP..."
              : "Send OTP"}
          </button>

        </form>

        <Link
          to="/login"
          className="back-to-login"
        >
          ← Back to Login
        </Link>

      </div>
    </div>
  );
}

export default ForgotPassword;