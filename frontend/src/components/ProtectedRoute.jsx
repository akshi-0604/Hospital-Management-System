import { Navigate, Outlet, useLocation } from "react-router-dom";

function getDashboardPath(role) {
  if (role === "admin") {
    return "/admin";
  }

  if (role === "patient") {
    return "/patient";
  }

  if (role === "doctor") {
    return "/doctor";
  }

  if (role === "receptionist") {
    return "/receptionist";
  }

  return "/";
}

function ProtectedRoute({ allowedRoles }) {
  const location = useLocation();

  const token = localStorage.getItem("token");
  const storedUser = localStorage.getItem("user");

  let user = null;

  try {
    if (storedUser) {
      user = JSON.parse(storedUser);
    }
  } catch (error) {
    console.error(
      "Unable to read logged-in user:",
      error
    );

    localStorage.removeItem("user");
  }
  if (!token || !user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location.pathname,
        }}
      />
    );
  }
  if (
    Array.isArray(allowedRoles) &&
    allowedRoles.length > 0 &&
    !allowedRoles.includes(user.role)
  ) {
    return (
      <Navigate
        to={getDashboardPath(user.role)}
        replace
      />
    );
  }
  return <Outlet />;
}

export default ProtectedRoute;