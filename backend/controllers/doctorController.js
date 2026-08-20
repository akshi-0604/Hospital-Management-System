const bcrypt = require("bcryptjs");

const Doctor = require("../models/Doctor");
const sendEmail = require("../utils/sendEmail");

// ADD DOCTOR

// GET ALL DOCTORS

async function addDoctor(req, res) {
  try {
    const {
      fullName,
      doctorId,
      email,
      phone,
      password,
      specialization,
      department,
      experience,
      qualification,
      consultationFee,
      gender,
      dob,
      joiningDate,
      status,
    } = req.body;

    // Check required fields
    if (
      !fullName ||
      !doctorId ||
      !email ||
      !phone ||
      !password ||
      !specialization ||
      !department ||
      !experience ||
      !qualification ||
      consultationFee === undefined ||
      !gender ||
      !dob ||
      !joiningDate
    ) {
      return res.status(400).json({
        message: "Please fill in all doctor details",
      });
    }

    // Check whether doctor ID or email already exists
    const existingDoctor = await Doctor.findOne({
      $or: [
        {
          email: email.toLowerCase(),
        },
        {
          doctorId,
        },
      ],
    });

    if (existingDoctor) {
      return res.status(400).json({
        message: "Doctor ID or email already exists",
      });
    }

    // Save the original password only temporarily
    // We use it for the welcome email.
    // It will NOT be saved in MongoDB.
    const temporaryPassword = password;

    // Hash password before saving it
    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    // Create doctor
    const doctor = await Doctor.create({
      fullName,
      doctorId,
      email: email.toLowerCase(),
      phone,
      password: hashedPassword,
      specialization,
      department,
      experience,
      qualification,
      consultationFee,
      gender,
      dob,
      joiningDate,
      status: status || "Available",
    });

    // Send login credentials to doctor's email
    try {
      await sendEmail({
        to: doctor.email,

        subject:
          "Welcome to Hospital Management System - Doctor Account",

        message: `
Hello Dr. ${doctor.fullName},

Welcome to the Hospital Management System.

Your doctor account has been successfully created by the hospital administrator.

Here are your login credentials:

Doctor ID: ${doctor.doctorId}
Email: ${doctor.email}
Password: ${temporaryPassword}

Specialization: ${doctor.specialization}
Department: ${doctor.department}

Please use these credentials to log in to the Hospital Management System.

For security reasons, please change your password after your first login.

Regards,
Hospital Management System
Administration
        `,
      });

      console.log(
        "Doctor welcome email sent successfully to:",
        doctor.email
      );
    } catch (emailError) {
      console.error(
        "Doctor created, but welcome email failed:",
        emailError
      );
    }

    // Send successful response to frontend
    return res.status(201).json({
      message:
        "Doctor added successfully and login credentials sent to the doctor's email",

      doctor: {
        id: doctor._id,
        fullName: doctor.fullName,
        doctorId: doctor.doctorId,
        email: doctor.email,
        phone: doctor.phone,
        specialization: doctor.specialization,
        department: doctor.department,
        experience: doctor.experience,
        qualification: doctor.qualification,
        consultationFee: doctor.consultationFee,
        gender: doctor.gender,
        dob: doctor.dob,
        joiningDate: doctor.joiningDate,
        status: doctor.status,
      },
    });
  } catch (error) {
    console.error("Add doctor error:", error);

    return res.status(500).json({
      message:
        "Something went wrong while adding the doctor",
    });
  }
}

async function getDoctors(req, res) {
  try {
    const doctors = await Doctor.find()
      .select("-password")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Doctors fetched successfully",
      doctors,
    });
  } catch (error) {
    console.error("Get doctors error:", error);

    return res.status(500).json({
      message: "Something went wrong while fetching doctors",
    });
  }
}
// GET SINGLE DOCTOR

async function getDoctorById(req, res) {
  try {
    const doctor = await Doctor.findById(
      req.params.id
    ).select("-password");


    if (!doctor) {
      return res.status(404).json({
        message: "Doctor not found",
      });
    }


    res.status(200).json({
      doctor,
    });

  } catch (error) {
    console.error("Get doctor error:", error);

    res.status(500).json({
      message: "Something went wrong while fetching the doctor",
    });
  }
}
// UPDATE DOCTOR

async function updateDoctor(req, res) {
  try {
    const doctor = await Doctor.findById(
      req.params.id
    );


    if (!doctor) {
      return res.status(404).json({
        message: "Doctor not found",
      });
    }


    const {
      fullName,
      email,
      phone,
      password,
      specialization,
      department,
      experience,
      qualification,
      consultationFee,
      gender,
      dob,
      joiningDate,
      status,
    } = req.body;


    // Update only the fields provided by admin
    doctor.fullName =
      fullName ?? doctor.fullName;


    doctor.email = email
      ? email.toLowerCase()
      : doctor.email;


    doctor.phone =
      phone ?? doctor.phone;


    doctor.specialization =
      specialization ?? doctor.specialization;


    doctor.department =
      department ?? doctor.department;


    doctor.experience =
      experience ?? doctor.experience;


    doctor.qualification =
      qualification ?? doctor.qualification;


    doctor.consultationFee =
      consultationFee ?? doctor.consultationFee;


    doctor.gender =
      gender ?? doctor.gender;


    doctor.dob =
      dob ?? doctor.dob;


    doctor.joiningDate =
      joiningDate ?? doctor.joiningDate;


    doctor.status =
      status ?? doctor.status;


    // Password is changed only when admin enters
    // a new password
    if (password) {
      doctor.password = await bcrypt.hash(
        password,
        10
      );
    }


    await doctor.save();


    res.status(200).json({
      message: "Doctor updated successfully",

      doctor: {
        id: doctor._id,
        fullName: doctor.fullName,
        doctorId: doctor.doctorId,
        email: doctor.email,
        phone: doctor.phone,
        specialization: doctor.specialization,
        department: doctor.department,
        experience: doctor.experience,
        qualification: doctor.qualification,
        consultationFee: doctor.consultationFee,
        gender: doctor.gender,
        dob: doctor.dob,
        joiningDate: doctor.joiningDate,
        status: doctor.status,
      },
    });

  } catch (error) {
    console.error("Update doctor error:", error);

    res.status(500).json({
      message: "Something went wrong while updating the doctor",
    });
  }
}
// DELETE DOCTOR

async function deleteDoctor(req, res) {
  try {
    const doctor = await Doctor.findById(
      req.params.id
    );


    if (!doctor) {
      return res.status(404).json({
        message: "Doctor not found",
      });
    }


    await Doctor.findByIdAndDelete(
      req.params.id
    );


    res.status(200).json({
      message: "Doctor deleted successfully",
    });

  } catch (error) {
    console.error("Delete doctor error:", error);

    res.status(500).json({
      message: "Something went wrong while deleting the doctor",
    });
  }
}


module.exports = {
  addDoctor,
  getDoctors,
  getDoctorById,
  updateDoctor,
  deleteDoctor,
};