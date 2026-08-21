import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./ForgotPassword.css";

function ForgotPassword() {
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
      setError("Please enter your email address");
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

      setMessage(
        response.data?.message ||
          "Password reset link has been sent to your email."
      );

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
      <div className="forgot-password-card">

        <div className="forgot-password-icon">
          🔐
        </div>

        <h1>Forgot Password?</h1>

        <p className="forgot-password-description">
          Enter your registered email address and
          we'll send you a link to reset your password.
        </p>

        <form onSubmit={handleSubmit}>

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
            />
          </div>

          {message && (
            <p className="success-message">
              {message}
            </p>
          )}

          {error && (
            <p className="error-message">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Sending..."
              : "Send Reset Link"}
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