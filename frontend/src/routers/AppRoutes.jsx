import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import LandingPage from "../pages/LandingPage";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPassword from "../pages/auth/ResetPassword";


import AdminLayout from "../layouts/AdminLayout";

import Dashboard from "../pages/admin/Dashboard";
import Patients from "../pages/admin/Patients";
import Doctors from "../pages/admin/Doctors";
import AddDoctor from "../components/admin/AddDoctor";
import Appointments from "../pages/admin/Appointments";
import Departments from "../pages/admin/Departments";
import MedicalRecords from "../pages/admin/MedicalRecords";
import Prescriptions from "../pages/admin/Prescriptions";
import Laboratory from "../pages/admin/Laboratory";
import Billing from "../pages/admin/Billing";
import Settings from "../pages/admin/Settings";

import PatientDashboard from "../pages/patient/PatientDashboard";
import DoctorDashboard from "../pages/doctor/DoctorDashboard";
import ReceptionistDashboard from "../pages/receptionist/ReceptionistDashboard";

import ProtectedRoute from "../components/ProtectedRoute";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<LandingPage />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />

        <Route
          path="/reset-password"
          element={<ResetPassword />}
        />
        <Route
          element={
            <ProtectedRoute
              allowedRoles={["admin"]}
            />
          }
        >

          <Route
            path="/admin"
            element={<AdminLayout />}
          >

            <Route
              index
              element={<Dashboard />}
            />

            <Route
              path="patients"
              element={<Patients />}
            />

            <Route
              path="doctors"
              element={<Doctors />}
            />

            <Route
              path="doctors/add"
              element={<AddDoctor />}
            />

            <Route
              path="appointments"
              element={<Appointments />}
            />

            <Route
              path="departments"
              element={<Departments />}
            />

            <Route
              path="medical-records"
              element={<MedicalRecords />}
            />

            <Route
              path="prescriptions"
              element={<Prescriptions />}
            />

            <Route
              path="laboratory"
              element={<Laboratory />}
            />

            <Route
              path="billing"
              element={<Billing />}
            />

            <Route
              path="settings"
              element={<Settings />}
            />

          </Route>

        </Route>

        <Route
          element={
            <ProtectedRoute
              allowedRoles={["patient"]}
            />
          }
        >

          <Route
            path="/patient"
            element={<PatientDashboard />}
          />

        </Route>

        <Route
          element={
            <ProtectedRoute
              allowedRoles={["doctor"]}
            />
          }
        >

          <Route
            path="/doctor"
            element={<DoctorDashboard />}
          />

        </Route>

        <Route
          element={
            <ProtectedRoute
              allowedRoles={["receptionist"]}
            />
          }
        >

          <Route
            path="/receptionist"
            element={<ReceptionistDashboard />}
          />

        </Route>
        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;