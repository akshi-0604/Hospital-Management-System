import { Link } from "react-router-dom";
import "./Register.css";

function Register() {
  return (
    <div className="register-page">

      <div className="register-card">

        <div className="register-header">

          <div className="register-logo">
            +
          </div>

          <h1>Create your account</h1>

          <p>
            Register to access the Hospital Management System.
          </p>

        </div>


        <form className="register-form">

          {/* Full Name */}

          <div className="form-group">

            <label htmlFor="name">
              Full Name
            </label>

            <input
              type="text"
              id="name"
              placeholder="Enter your full name"
            />

          </div>


          {/* Email */}

          <div className="form-group">

            <label htmlFor="email">
              Email Address
            </label>

            <input
              type="email"
              id="email"
              placeholder="Enter your email address"
            />

          </div>


          {/* Phone */}

          <div className="form-group">

            <label htmlFor="phone">
              Phone Number
            </label>

            <input
              type="tel"
              id="phone"
              placeholder="Enter your phone number"
            />

          </div>


          {/* Role */}

          <div className="form-group">

            <label htmlFor="role">
              Register As
            </label>

            <select
              id="role"
              defaultValue=""
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


          {/* Password fields */}

          <div className="form-row">

            <div className="form-group">

              <label htmlFor="password">
                Password
              </label>

              <input
                type="password"
                id="password"
                placeholder="Create a password"
              />

            </div>


            <div className="form-group">

              <label htmlFor="confirmPassword">
                Confirm Password
              </label>

              <input
                type="password"
                id="confirmPassword"
                placeholder="Confirm password"
              />

            </div>

          </div>


          {/* Register button */}

          <button
            type="submit"
            className="register-submit"
          >
            Create Account
          </button>

        </form>


        {/* Login link */}

        <div className="register-footer">

          <span>
            Already have an account?
          </span>

          <Link to="/login">
            Login
          </Link>

        </div>


        {/* Home link */}

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