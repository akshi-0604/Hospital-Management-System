import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Register.css";
import { useTheme } from "../../context/ThemeContext";

function Register() {
  const navigate = useNavigate();

  const { theme, toggleTheme } = useTheme();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    role: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    const { id, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [id]: value,
    }));
  }

  async function handleRegister(event) {
    event.preventDefault();

    setError("");
    setMessage("");

    const {
      fullName,
      email,
      phone,
      role,
      password,
      confirmPassword,
    } = formData;

    if (
      !fullName ||
      !email ||
      !password ||
      !confirmPassword
    ) {
      setError("Please fill in all required fields.");
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
        "https://hospital-management-system-nvjt.onrender.com/api/auth/register",
        {
          fullName,
          email,
          phone,
          password,
          role: role || "patient",
        }
      );

      setMessage(
        response.data?.message ||
          "Registration successful."
      );

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      console.error(
        "Registration error:",
        error
      );

      if (error.response) {
        setError(
          error.response.data?.message ||
            `Registration failed (${error.response.status})`
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
    <div className="register-page">
      {/* THEME TOGGLE */}
      <button
        type="button"
        className="register-theme-button"
        onClick={toggleTheme}
        title={
          theme === "light"
            ? "Switch to Dark Mode"
            : "Switch to Light Mode"
        }
      >
        <span className="register-theme-icon">
          {theme === "light" ? "🌙" : "☀️"}
        </span>

        <span>
          {theme === "light"
            ? "Dark Mode"
            : "Light Mode"}
        </span>
      </button>

      <div className="register-card">
        {/* HEADER */}
        <div className="register-header">
          <div className="register-logo">
            +
          </div>

          <h1>
            Create your account
          </h1>

          <p>
            Register to access the Hospital Management System.
          </p>
        </div>

        {/* FORM */}
        <form
          className="register-form"
          onSubmit={handleRegister}
        >
          {/* FULL NAME */}
          <div className="form-group">
            <label htmlFor="fullName">
              Full Name
            </label>

            <input
              type="text"
              id="fullName"
              placeholder="Enter your full name"
              value={formData.fullName}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          {/* EMAIL */}
          <div className="form-group">
            <label htmlFor="email">
              Email Address
            </label>

            <input
              type="email"
              id="email"
              placeholder="Enter your email address"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          {/* PHONE */}
          <div className="form-group">
            <label htmlFor="phone">
              Phone Number
            </label>

            <input
              type="tel"
              id="phone"
              placeholder="Enter your phone number"
              value={formData.phone}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          {/* ROLE */}
          <div className="form-group">
            <label htmlFor="role">
              Register As
            </label>

            <select
              id="role"
              value={formData.role}
              onChange={handleChange}
              disabled={loading}
            >
              <option
                value=""
                disabled
              >
                Select your role
              </option>

              <option value="patient">
                Patient
              </option>

              <option value="doctor">
                Doctor
              </option>

              <option value="receptionist">
                Receptionist
              </option>
            </select>
          </div>

          {/* PASSWORD ROW */}
          <div className="form-row">
            {/* PASSWORD */}
            <div className="form-group">
              <label htmlFor="password">
                Password
              </label>

              <input
                type="password"
                id="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            {/* CONFIRM PASSWORD */}
            <div className="form-group">
              <label htmlFor="confirmPassword">
                Confirm Password
              </label>

              <input
                type="password"
                id="confirmPassword"
                placeholder="Confirm password"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
          </div>

          {/* ERROR */}
          {error && (
            <p className="error-message">
              {error}
            </p>
          )}

          {/* SUCCESS */}
          {message && (
            <p className="success-message">
              {message}
            </p>
          )}

          {/* SUBMIT */}
          <button
            type="submit"
            className="register-submit"
            disabled={loading}
          >
            {loading
              ? "Creating Account..."
              : "Create Account"}
          </button>
        </form>

        {/* LOGIN */}
        <div className="register-footer">
          <span>
            Already have an account?
          </span>

          <Link to="/login">
            Login
          </Link>
        </div>

        {/* HOME */}
        <Link
          to="/"
          className="back-home"
        >
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}

export default Register;