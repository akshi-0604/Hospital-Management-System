const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDatabase = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const patientRoutes = require("./routes/patientRoutes");
const doctorRoutes = require("./routes/doctorRoutes");

const app = express();

app.use(cors());
app.use(express.json());

connectDatabase();

app.get("/", (req, res) => {
  res.json({
    message: "Hospital Management System API is running",
  });
});

app.use("/api/auth", authRoutes);

app.use(
  "/api/patients",
  patientRoutes
);

app.use("/api/doctors", doctorRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


