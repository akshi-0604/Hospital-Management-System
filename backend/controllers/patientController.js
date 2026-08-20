const User = require("../models/User");


async function getPatients(req, res) {
  try {
    const patients = await User.find({
      role: "patient",
    })
      .select("-password -resetPasswordToken -resetPasswordExpires")
      .sort({
        createdAt: -1,
      });

    res.status(200).json({
      message: "Patients fetched successfully",
      patients,
    });
  } catch (error) {
    console.error(
      "Get patients error:",
      error
    );

    res.status(500).json({
      message:
        "Something went wrong while fetching patients",
    });
  }
}


// ---------------------------------------------
// Get one patient
// ---------------------------------------------

async function getPatientById(req, res) {
  try {
    const { id } = req.params;

    const patient = await User.findOne({
      _id: id,
      role: "patient",
    }).select(
      "-password -resetPasswordToken -resetPasswordExpires"
    );

    if (!patient) {
      return res.status(404).json({
        message: "Patient not found",
      });
    }

    res.status(200).json({
      message: "Patient fetched successfully",
      patient,
    });
  } catch (error) {
    console.error(
      "Get patient error:",
      error
    );

    res.status(500).json({
      message:
        "Something went wrong while fetching the patient",
    });
  }
}


module.exports = {
  getPatients,
  getPatientById,
};