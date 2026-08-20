import { Link } from "react-router-dom";
import "./LandingPage.css";

function LandingPage() {
  return (
    <div className="landing-page">
      <header className="landing-navbar">
        <div className="landing-logo">
          <div className="logo-icon">+</div>

          <div>
            <h2>HMS</h2>
            <span>Hospital Management System</span>
          </div>
        </div>

        <nav className="landing-navigation">
          <a href="#home">Home</a>
          <a href="#about">About</a>
          <a href="#services">Services</a>
          <a href="#contact">Contact</a>
        </nav>

        <div className="navbar-actions">
          <Link to="/login" className="login-link">
            Login
          </Link>

          <Link to="/register" className="register-button">
            Register
          </Link>
        </div>
      </header>

      <main>
        <section className="hero-section" id="home">
          <div className="hero-content">
            <p className="hero-label">SMART HEALTHCARE MANAGEMENT</p>

            <h1>
              Better Healthcare,
              <span>Better Management.</span>
            </h1>

            <p className="hero-description">
              A simple and secure platform to manage patients, doctors,
              appointments, medical records, billing, and everyday hospital
              operations in one place.
            </p>

            <div className="hero-buttons">
              <Link to="/login" className="primary-button">
                Get Started
              </Link>

              <a href="#services" className="secondary-button">
                Explore Services
              </a>
            </div>
          </div>

          <div className="hero-card">
            <div className="hero-card-icon">+</div>

            <h3>Complete Hospital Care</h3>

            <p>
              Manage healthcare operations with a centralized and organized
              system.
            </p>

            <div className="hero-stat-row">
              <div>
                <strong>24/7</strong>
                <span>Support</span>
              </div>

              <div>
                <strong>100%</strong>
                <span>Organized</span>
              </div>

              <div>
                <strong>Secure</strong>
                <span>Records</span>
              </div>
            </div>
          </div>
        </section>

        <section className="about-section" id="about">
          <div className="section-heading">
            <p>ABOUT OUR SYSTEM</p>

            <h2>Everything your hospital needs, in one platform.</h2>

            <span>
              Our Hospital Management System helps hospitals simplify their
              daily operations and provide better patient care.
            </span>
          </div>

          <div className="about-cards">
            <div className="about-card">
              <div className="feature-icon">P</div>
              <h3>Patient Management</h3>
              <p>
                Maintain patient information, medical history, appointments,
                and records.
              </p>
            </div>

            <div className="about-card">
              <div className="feature-icon">D</div>
              <h3>Doctor Management</h3>
              <p>
                Manage doctors, departments, schedules, and assigned
                appointments.
              </p>
            </div>

            <div className="about-card">
              <div className="feature-icon">R</div>
              <h3>Digital Records</h3>
              <p>
                Keep medical records and prescriptions organized and easily
                accessible.
              </p>
            </div>
          </div>
        </section>

        <section className="services-section" id="services">
          <div className="section-heading">
            <p>OUR FEATURES</p>

            <h2>Powerful hospital management features</h2>

            <span>
              Designed to connect patients, doctors, receptionists, and
              administrators.
            </span>
          </div>

          <div className="services-grid">
            <div className="service-card">
              <div className="service-icon">01</div>
              <h3>Appointments</h3>
              <p>
                Schedule and manage patient appointments with doctors.
              </p>
            </div>

            <div className="service-card">
              <div className="service-icon">02</div>
              <h3>Medical Records</h3>
              <p>
                Store and manage patient medical history and treatment
                information.
              </p>
            </div>

            <div className="service-card">
              <div className="service-icon">03</div>
              <h3>Prescriptions</h3>
              <p>
                Doctors can create and manage patient prescriptions.
              </p>
            </div>

            <div className="service-card">
              <div className="service-icon">04</div>
              <h3>Laboratory</h3>
              <p>
                Manage laboratory tests and patient laboratory reports.
              </p>
            </div>

            <div className="service-card">
              <div className="service-icon">05</div>
              <h3>Billing</h3>
              <p>
                Track patient bills, payments, and hospital financial
                information.
              </p>
            </div>

            <div className="service-card">
              <div className="service-icon">06</div>
              <h3>Admissions</h3>
              <p>
                Manage patient admissions, room allocation, and discharge
                information.
              </p>
            </div>
          </div>
        </section>

        <section className="cta-section" id="contact">
          <div>
            <p>GET STARTED TODAY</p>

            <h2>Manage your hospital smarter and faster.</h2>

            <span>
              Bring your hospital operations together with one centralized
              management platform.
            </span>
          </div>

          <Link to="/login" className="cta-button">
            Login to HMS
          </Link>
        </section>
      </main>

      <footer className="landing-footer">
        <div>
          <strong>HMS</strong>
          <p>Hospital Management System</p>
        </div>

        <p>© 2026 Hospital Management System. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default LandingPage;