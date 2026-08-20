import "./Navbar.css";

function Navbar() {
  return (
    <header className="navbar">
      <div>
        <h1>Dashboard</h1>
        <p>Welcome back, Admin</p>
      </div>

      <div className="navbar-user">
        <div className="user-avatar">
          A
        </div>

        <div className="user-info">
          <strong>Admin</strong>
          <span>Administrator</span>
        </div>
      </div>
    </header>
  );
}

export default Navbar;