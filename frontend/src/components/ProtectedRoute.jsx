import { Navigate, Outlet } from "react-router-dom";

function ProtectedRoute({ allowedRoles }) {
  const token = localStorage.getItem("token");
  const savedUser = localStorage.getItem("user");

  let user = null;

  if (savedUser) {
    user = JSON.parse(savedUser);
  }

  // User is not logged in
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // User is logged in, but does not have permission
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  // User is allowed to access the page
  return <Outlet />;
}

export default ProtectedRoute;