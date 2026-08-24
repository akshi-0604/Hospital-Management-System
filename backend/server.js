const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDatabase = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const patientRoutes = require("./routes/patientRoutes");
const doctorRoutes = require("./routes/doctorRoutes");

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "https://hospital-management-system-five-theta.vercel.app",
  "https://hospital-management-system-dyyezsa45-akshitha-1747s-projects.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests such as Postman or server-to-server requests
      if (!origin) {
        return callback(null, true);
      }

      // Allow known frontend URLs
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Allow Vercel preview deployments for this project
      if (
        origin.startsWith(
          "https://hospital-management-system-"
        ) &&
        origin.endsWith(".vercel.app")
      ) {
        return callback(null, true);
      }

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
  res.json({
    message: "Hospital Management System API is running",
  });
});

app.use("/api/auth", authRoutes);

app.use("/api/patients", patientRoutes);

app.use("/api/doctors", doctorRoutes);


const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});