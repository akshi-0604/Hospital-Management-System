import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

import "./ResetPassword.css";
import { useTheme } from "../../context/ThemeContext";

function EyeIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M2 12C2 12 5.5 5 12 5C18.5 5 22 12 22 12C22 12 18.5 19 12 19C5.5 19 2 12 2 12Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <circle
        cx="12"
        cy="12"
        r="3"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3 3L21 21"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />

      <path
        d="M10.5 5.3C11 5.1 11.5 5 12 5C18.5 5 22 12 22 12C22 12 20.5 15 18 17"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M6.6 6.6C3.5 8.7 2 12 2 12C2 12 5.5 19 12 19C13.5 19 14.8 18.7 16 18.1"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M9.9 9.9C9.3 10.5 9 11.2 9 12C9 13.7 10.3 15 12 15C12.8 15 13.5 14.7 14.1 14.1"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ResetPassword() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedEmail = sessionStorage.getItem(
      "passwordResetEmail"
    );

    if (savedEmail) {
      setEmail(savedEmail);
    }
  }, []);

  function handleOtpChange(event) {
    const value =
      event.target.value.replace(/\D/g, "");

    if (value.length <= 6) {
      setOtp(value);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setMessage("");
    setError("");

    const trimmedEmail =
      email.trim().toLowerCase();

    const trimmedOtp =
      otp.trim();

    if (!trimmedEmail) {
      setError(
        "Please enter your email address."
      );
      return;
    }

    if (!trimmedOtp) {
      setError(
        "Please enter the OTP sent to your email."
      );
      return;
    }

    if (!/^\d{6}$/.test(trimmedOtp)) {
      setError(
        "OTP must contain exactly 6 digits."
      );
      return;
    }

    if (!password || !confirmPassword) {
      setError(
        "Please fill in both password fields."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError(
        "Password must contain at least 6 characters."
      );
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        "https://hospital-management-system-nvjt.onrender.com/api/auth/reset-password",
        {
          email: trimmedEmail,
          otp: trimmedOtp,
          password: password,
        }
      );

      setMessage(
        response.data?.message ||
          "Password has been reset successfully."
      );

      // Remove reset email after successful reset
      sessionStorage.removeItem(
        "passwordResetEmail"
      );

      // Go to login
      setTimeout(() => {
        navigate("/login");
      }, 1500);

    } catch (error) {
      console.error(
        "Reset password error:",
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
    <div className="reset-password-page">

      {/* THEME BUTTON */}
      <button
        type="button"
        className="reset-theme-button"
        onClick={toggleTheme}
        title={
          theme === "light"
            ? "Switch to Dark Mode"
            : "Switch to Light Mode"
        }
      >
        <span className="reset-theme-icon">
          {theme === "light"
            ? "🌙"
            : "☀️"}
        </span>

        <span>
          {theme === "light"
            ? "Dark Mode"
            : "Light Mode"}
        </span>
      </button>

      {/* CARD */}
      <div className="reset-password-card">

        <h1>
          Reset Password
        </h1>

        <p className="reset-password-description">
          Enter the 6-digit OTP sent to your email
          and create your new password.
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

          {/* OTP */}
          <div className="form-group">
            <label htmlFor="otp">
              Verification OTP
            </label>

            <input
              id="otp"
              type="text"
              value={otp}
              placeholder="Enter 6-digit OTP"
              inputMode="numeric"
              maxLength={6}
              autoComplete="one-time-code"
              onChange={handleOtpChange}
              disabled={loading}
              required
            />

            <small>
              Enter the 6-digit OTP sent to your
              registered email address.
            </small>
          </div>

          {/* NEW PASSWORD */}
          <div className="form-group">
            <label htmlFor="password">
              New Password
            </label>

            <div className="password-input-wrapper">

              <input
                id="password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                value={password}
                placeholder="Enter your new password"
                autoComplete="new-password"
                onChange={(event) =>
                  setPassword(
                    event.target.value
                  )
                }
                disabled={loading}
                required
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowPassword(
                    !showPassword
                  )
                }
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                {showPassword ? (
                  <EyeOffIcon />
                ) : (
                  <EyeIcon />
                )}
              </button>

            </div>
          </div>

          {/* CONFIRM PASSWORD */}
          <div className="form-group">
            <label htmlFor="confirmPassword">
              Confirm New Password
            </label>

            <div className="password-input-wrapper">

              <input
                id="confirmPassword"
                type={
                  showConfirmPassword
                    ? "text"
                    : "password"
                }
                value={confirmPassword}
                placeholder="Confirm your new password"
                autoComplete="new-password"
                onChange={(event) =>
                  setConfirmPassword(
                    event.target.value
                  )
                }
                disabled={loading}
                required
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowConfirmPassword(
                    !showConfirmPassword
                  )
                }
                aria-label={
                  showConfirmPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                {showConfirmPassword ? (
                  <EyeOffIcon />
                ) : (
                  <EyeIcon />
                )}
              </button>

            </div>
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
            className="reset-password-button"
            disabled={loading}
          >
            {loading
              ? "Resetting Password..."
              : "Reset Password"}
          </button>

        </form>

        <Link
          to="/forgot-password"
          className="back-to-login"
        >
          ← Change Email
        </Link>

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

export default ResetPassword;