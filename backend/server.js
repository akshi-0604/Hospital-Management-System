const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDatabase = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const patientRoutes = require("./routes/patientRoutes");
const doctorRoutes = require("./routes/doctorRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const departmentRoutes = require("./routes/departmentRoutes");
const medicalRecordRoutes = require("./routes/medicalRecordRoutes");
const prescriptionRoutes = require("./routes/prescriptionRoutes");
const laboratoryRoutes = require("./routes/laboratoryRoutes");
const billingRoutes = require("./routes/billingRoutes");

const notificationRoutes = require("./routes/notificationRoutes");

const app = express();

const allowedOrigins = [
  "http://localhost:5173",

  // Main Vercel frontend
  "https://hospital-management-system-five-theta.vercel.app",

  // Vercel deployment
  "https://hospital-management-system-dyyezsa45-akshitha-1747s-projects.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests from Postman, server-to-server requests, etc.
      if (!origin) {
        return callback(null, true);
      }

      // Allow the exact frontend URLs
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Allow Vercel preview deployments
      if (
        origin.startsWith(
          "https://hospital-management-system-"
        ) &&
        origin.endsWith(".vercel.app")
      ) {
        return callback(null, true);
      }

      console.log("Blocked by CORS:", origin);

      return callback(
        new Error("Not allowed by CORS")
      );
    },

    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],
  })
);

app.use(express.json());
connectDatabase();

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Hospital Management System API is running",
  });
});
// Authentication
app.use("/api/auth", authRoutes);

// Patients
app.use("/api/patients", patientRoutes);

// Doctors
app.use("/api/doctors", doctorRoutes);

// Appointments
app.use("/api/appointments", appointmentRoutes);

app.use( "/api/departments",departmentRoutes);

app.use(
  "/api/medical-records",
  medicalRecordRoutes
);

app.use(
  "/api/prescriptions",
  prescriptionRoutes
);

app.use(
  "/api/laboratory",
  laboratoryRoutes
);

app.use(
  "/api/billing",
  billingRoutes
);

app.use("/api/notifications", notificationRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

app.use((error, req, res, next) => {
  console.error("Server error:", error);

  res.status(500).json({
    success: false,
    message: error.message || "Internal server error",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
