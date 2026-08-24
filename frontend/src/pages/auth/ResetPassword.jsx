import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";

import "./ResetPassword.css";


function EyeIcon() {
  return (
    <svg
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
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);


  async function handleSubmit(event) {
    event.preventDefault();

    setMessage("");
    setError("");

    if (!password || !confirmPassword) {
      setError("Please fill in both password fields");
      return;
    }


    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }


    if (password.length < 6) {
      setError("Password must contain at least 6 characters");
      return;
    }


    try {
      setLoading(true);

      const response = await axios.post(
        `https://hospital-management-system-nvjt.onrender.com/api/auth/reset-password/${token}`,
        {
          password,
        }
      );

      setMessage(response.data.message);

      setTimeout(() => {
        navigate("/login");
      }, 2000);

    } catch (error) {
      setError(
        error.response?.data?.message ||
        "Unable to reset your password"
      );

    } finally {
      setLoading(false);
    }
  }


  return (
    <div className="reset-password-page">

      <div className="reset-password-card">

        <div className="reset-password-icon">
          🔐
        </div>


        <h1>Reset Password</h1>


        <p className="reset-password-description">
          Create a new password for your
          Hospital Management System account.
        </p>


        <form onSubmit={handleSubmit}>

          {/* New Password */}

          <div className="form-group">

            <label htmlFor="password">
              New Password
            </label>


            <div className="password-input-wrapper">

              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                placeholder="Enter your new password"
                onChange={(event) =>
                  setPassword(event.target.value)
                }
              />


              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowPassword(!showPassword)
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


          {/* Confirm Password */}

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
                onChange={(event) =>
                  setConfirmPassword(event.target.value)
                }
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


          {/* Messages */}

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


          {/* Reset Button */}

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
