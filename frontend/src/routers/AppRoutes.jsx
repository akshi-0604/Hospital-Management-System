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

import PatientLayout from "../pages/patient/PatientLayout";
import PatientDashboard from "../pages/patient/PatientDashboard";
import PatientAppointments from "../pages/patient/PatientAppointments";
import PatientMedicalRecords from "../pages/patient/PatientMedicalRecords";
import PatientPrescriptions from "../pages/patient/PatientPrescriptions";
import PatientLaboratory from "../pages/patient/PatientLaboratory";
import PatientBilling from "../pages/patient/PatientBilling";
import PatientProfile from "../pages/patient/PatientProfile";

import DoctorLayout from "../pages/doctor/DoctorLayout";
import DoctorDashboard from "../pages/doctor/DoctorDashboard";
import DoctorAppointments from "../pages/doctor/DoctorAppointments";
import DoctorPatients from "../pages/doctor/DoctorPatients";
import DoctorMedicalRecords from "../pages/doctor/DoctorMedicalRecords";
import DoctorPrescriptions from "../pages/doctor/DoctorPrescriptions";
import DoctorLaboratory from "../pages/doctor/DoctorLaboratory";
import DoctorProfile from "../pages/doctor/DoctorProfile";
import DoctorQuickActions from "../pages/doctor/DoctorQuickActions";
import DoctorChat from "../pages/doctor/DoctorChat";

import ReceptionistDashboard from "../pages/receptionist/ReceptionistDashboard";

import Notifications from "../pages/notifications/Notifications";

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
            element={<PatientLayout />}
          >
            <Route
              index
              element={
                <Navigate
                  to="/patient/dashboard"
                  replace
                />
              }
            />

            <Route
              path="dashboard"
              element={<PatientDashboard />}
            />

            <Route
              path="appointments"
              element={<PatientAppointments />}
            />

            <Route
              path="medical-records"
              element={
                <PatientMedicalRecords />
              }
            />

            <Route
              path="prescriptions"
              element={<PatientPrescriptions />}
            />

            <Route
              path="laboratory"
              element={<PatientLaboratory />}
            />

            <Route
              path="billing"
              element={<PatientBilling />}
            />

            <Route
              path="profile"
              element={<PatientProfile />}
            />

            <Route
              path="notifications"
              element={<Notifications />}
            />
          </Route>
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
            element={<DoctorLayout />}
          >
            <Route
              index
              element={
                <Navigate
                  to="/doctor/dashboard"
                  replace
                />
              }
            />

            <Route
              path="dashboard"
              element={<DoctorDashboard />}
            />

            <Route
              path="appointments"
              element={<DoctorAppointments />}
            />

            <Route
              path="patients"
              element={<DoctorPatients />}
            />

            <Route
              path="chat"
              element={<DoctorChat />}
            />

            <Route
              path="medical-records"
              element={<DoctorMedicalRecords />}
            />

            <Route
              path="prescriptions"
              element={<DoctorPrescriptions />}
            />

            <Route
              path="laboratory"
              element={<DoctorLaboratory />}
            />

            <Route
              path="profile"
              element={<DoctorProfile />}
            />

            <Route
              path="quick-actions"
              element={<DoctorQuickActions />}
            />

            <Route
              path="notifications"
              element={<Notifications />}
            />
          </Route>
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
          element={<ProtectedRoute />}
        >

          <Route
            path="/notifications"
            element={<Notifications />}
          />

        </Route>
        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;