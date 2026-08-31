import { BrowserRouter, Routes, Route } from "react-router-dom";

import LandingPage from "../pages/LandingPage";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPassword from "../pages/auth/ResetPassword";

import AdminLayout from "../layouts/AdminLayout";
import Dashboard from "../pages/admin/Dashboard";
import Patients from "../pages/admin/Patients";
import Doctors from "../pages/admin/Doctors";
import Appointments from "../pages/admin/Appointments";
import MedicalRecords from "../pages/admin/MedicalRecords";
import Prescriptions from "../pages/admin/Prescriptions";
import Laboratory from "../pages/admin/Laboratory";
import Billing from "../pages/admin/Billing";

import PatientDashboard from "../pages/patient/PatientDashboard";
import AddDoctor from "../components/admin/AddDoctor";
import DoctorDashboard from "../pages/doctor/DoctorDashboard";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public Pages */}

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
          path="/reset-password/:token"
          element={<ResetPassword />}
        />


        {/* Admin Pages */}

        <Route path="/admin" element={<AdminLayout />} >

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
        </Route>


        <Route
          path="/patient"
          element={<PatientDashboard />}
        />
        
        <Route
          path="/doctor"
          element={<DoctorDashboard />}
        />

      </Routes>
    </BrowserRouter>
  );
}


export default AppRoutes;

