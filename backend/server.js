const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDatabase = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const patientRoutes = require("./routes/patientRoutes");
const doctorRoutes = require("./routes/doctorRoutes");

const app = express();


// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://hospital-management-system-five-theta.vercel.app",
    ],
    methods: [
      "GET",
      "POST",
      "PUT",
      "DELETE",
      "PATCH",
      "OPTIONS",
    ],
    credentials: true,
  })
);

app.use(express.json());


// Database
connectDatabase();


// Health check
app.get("/", (req, res) => {
  res.status(200).json({
    message:
      "Hospital Management System API is running",
  });
});


// Routes
app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/patients",
  patientRoutes
);

app.use(
  "/api/doctors",
  doctorRoutes
);


// Port
const PORT =
  process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `Server running on port ${PORT}`
  );
});