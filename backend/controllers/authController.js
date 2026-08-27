const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");


// ======================================================
// REGISTER USER
// ======================================================

async function registerUser(req, res) {
  try {
    const {
      fullName,
      email,
      phone,
      password,
      role,
    } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({
        message: "Please fill in all required fields",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        message: "An account with this email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    const newUser = new User({
      fullName,
      email: normalizedEmail,
      phone,
      password: hashedPassword,
      role: role || "patient",
    });

    await newUser.save();

    return res.status(201).json({
      message: "Registration successful",
    });

  } catch (error) {
    console.error("Registration error:", error);

    return res.status(500).json({
      message:
        "Something went wrong during registration",
    });
  }
}


// ======================================================
// LOGIN USER
// ======================================================

async function loginUser(req, res) {
  try {
    const {
      email,
      password,
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message:
          "Please enter your email and password",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(401).json({
        message:
          "No account found with this email address",
      });
    }

    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Incorrect password",
      });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    return res.status(200).json({
      message: "Login successful",

      token,

      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });

  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      message:
        "Something went wrong while logging in",
    });
  }
}


// ======================================================
// FORGOT PASSWORD
// ======================================================

async function forgotPassword(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message:
          "Please enter your email address",
      });
    }

    const normalizedEmail =
      email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(404).json({
        message:
          "No account found with this email address",
      });
    }

    // Generate secure reset token
    const resetToken = crypto
      .randomBytes(32)
      .toString("hex");

    // Save token
    user.resetPasswordToken = resetToken;

    // Token expires after 15 minutes
    user.resetPasswordExpires =
      Date.now() + 15 * 60 * 1000;

    await user.save();

    // IMPORTANT:
    // This must be your deployed Vercel URL.
    const frontendUrl =
      process.env.FRONTEND_URL ||
      "https://hospital-management-system-five-theta.vercel.app";

    const resetLink =
      `${frontendUrl}/reset-password/${resetToken}`;

    console.log(
      "Generated reset link:",
      resetLink
    );

    // Send through Brevo
    await sendEmail({
      to: user.email,

      subject:
        "Hospital Management System - Password Reset",

      message: `Hello ${user.fullName},

We received a request to reset your Hospital Management System password.

Click the link below to create a new password:

${resetLink}

This password reset link will expire in 15 minutes.

If you did not request a password reset, you can safely ignore this email.

Regards,
Hospital Management System`,
    });

    return res.status(200).json({
      message:
        "Password reset link has been sent to your email",
    });

  } catch (error) {
    console.error(
      "Forgot password error:",
      error
    );

    return res.status(500).json({
      message:
        "Unable to send password reset email. Please try again later.",
    });
  }
}


// ======================================================
// RESET PASSWORD
// ======================================================

async function resetPassword(req, res) {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!token) {
      return res.status(400).json({
        message: "Reset token is required",
      });
    }

    if (!password) {
      return res.status(400).json({
        message:
          "Please enter a new password",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message:
          "Password must contain at least 6 characters",
      });
    }

    const user = await User.findOne({
      resetPasswordToken: token,

      resetPasswordExpires: {
        $gt: Date.now(),
      },
    });

    if (!user) {
      return res.status(400).json({
        message:
          "Reset link is invalid or has expired",
      });
    }

    const hashedPassword =
      await bcrypt.hash(password, 10);

    user.password = hashedPassword;

    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await user.save();

    return res.status(200).json({
      message:
        "Password has been reset successfully",
    });

  } catch (error) {
    console.error(
      "Reset password error:",
      error
    );

    return res.status(500).json({
      message:
        "Something went wrong while resetting the password",
    });
  }
}


// ======================================================
// EXPORT
// ======================================================

module.exports = {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
};