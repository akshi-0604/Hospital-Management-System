const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");

const {
    createPatientNotification,
    sendWelcomeEmail,
    sendHospitalInformationEmail,
} = require("../services/patientNotificationService");
async function registerUser(req, res) {
    try {
        console.log(
            "REGISTER REQUEST:",
            req.body
        );
        const {
            fullName,
            email,
            phone,
            password,
            role,
        } = req.body;

        if (
            !fullName ||
            !email ||
            !password
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Full name, email and password are required.",
            });
        }

        const normalizedEmail =
            email.trim().toLowerCase();

        const existingUser =
            await User.findOne({
                email: normalizedEmail,
            });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message:
                    "An account with this email already exists.",
            });
        }

        const hashedPassword =
            await bcrypt.hash(
                password,
                10
            );

        const newUser = new User({
            fullName:
                fullName.trim(),

            email:
                normalizedEmail,

            phone:
                phone
                    ? phone.trim()
                    : "",

            password:
                hashedPassword,

            role:
                role || "patient",
        });

        await newUser.save();

        console.log(
            "USER REGISTERED SUCCESSFULLY:",
            newUser.email
        );
        if (
            newUser.role === "patient"
        ) {
            try {

                await createPatientNotification({
                    patientId:
                        newUser._id,

                    type:
                        "Welcome",

                    title:
                        "Welcome to the Hospital",

                    message:
                        `Welcome ${newUser.fullName}. Your patient account has been successfully created.`,

                    metadata: {
                        patientId:
                            newUser._id,
                    },
                });

                await sendWelcomeEmail(
                    newUser
                );

                await sendHospitalInformationEmail(
                    newUser
                );

                console.log(
                    "PATIENT WELCOME NOTIFICATIONS SENT:",
                    newUser.email
                );

            } catch (
                notificationError
            ) {

                console.error(
                    "PATIENT NOTIFICATION ERROR:",
                    notificationError.message
                );

            }
        }

        return res.status(201).json({
            success: true,

            message:
                "Registration successful.",

            user: {
                id:
                    newUser._id,

                fullName:
                    newUser.fullName,

                email:
                    newUser.email,

                phone:
                    newUser.phone,

                role:
                    newUser.role,
            },
        });

    } catch (error) {

        console.error(
            "REGISTER ERROR:",
            error
        );

        if (
            error.code === 11000
        ) {
            return res.status(409).json({
                success: false,
                message:
                    "An account with this email already exists.",
            });
        }

        if (
            error.name ===
            "ValidationError"
        ) {
            const validationMessages =
                Object.values(
                    error.errors
                ).map(
                    (item) =>
                        item.message
                );

            return res.status(400).json({
                success: false,

                message:
                    validationMessages.join(
                        ", "
                    ),
            });
        }

        return res.status(500).json({
            success: false,

            message:
                error.message ||
                "Something went wrong during registration.",
        });
    }
}
async function loginUser(req, res) {
    try {

        console.log(
            "LOGIN REQUEST:",
            req.body.email
        );

        const {
            email,
            password,
        } = req.body;

        if (
            !email ||
            !password
        ) {
            return res.status(400).json({
                success: false,

                message:
                    "Please enter your email and password.",
            });
        }

        const normalizedEmail =
            email.trim().toLowerCase();

        const user =
            await User.findOne({
                email:
                    normalizedEmail,
            });

        if (!user) {
            return res.status(404).json({
                success: false,

                message:
                    "No account found with this email address.",
            });
        }

        if (!user.password) {
            return res.status(500).json({
                success: false,

                message:
                    "This account does not have a valid password.",
            });
        }

        const passwordMatch =
            await bcrypt.compare(
                password,
                user.password
            );

        if (!passwordMatch) {
            return res.status(401).json({
                success: false,

                message:
                    "Incorrect password.",
            });
        }

        if (
            !process.env.JWT_SECRET
        ) {
            console.error(
                "JWT_SECRET is missing from environment variables."
            );

            return res.status(500).json({
                success: false,

                message:
                    "Server authentication configuration is missing.",
            });
        }

        const token =
            jwt.sign(
                {
                    userId:
                        user._id,

                    role:
                        user.role,
                },

                process.env.JWT_SECRET,

                {
                    expiresIn:
                        "1d",
                }
            );

        console.log(
            "LOGIN SUCCESS:",
            user.email
        );

        return res.status(200).json({
            success: true,

            message:
                "Login successful.",

            token,

            user: {
                id:
                    user._id,

                fullName:
                    user.fullName,

                email:
                    user.email,

                phone:
                    user.phone,

                role:
                    user.role,
            },
        });

    } catch (error) {

        console.error(
            "LOGIN ERROR:",
            error
        );

        return res.status(500).json({
            success: false,

            message:
                error.message ||
                "Something went wrong while logging in.",
        });
    }
}
async function forgotPassword(
    req,
    res
) {
    try {

        const {
            email,
        } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,

                message:
                    "Please enter your email address.",
            });
        }

        const normalizedEmail =
            email.trim().toLowerCase();

        const user =
            await User.findOne({
                email:
                    normalizedEmail,
            });

        if (!user) {
            return res.status(404).json({
                success: false,

                message:
                    "No account found with this email address.",
            });
        }
        const otp =
            crypto
                .randomInt(
                    100000,
                    1000000
                )
                .toString();
        const hashedOtp =
            crypto
                .createHash(
                    "sha256"
                )
                .update(otp)
                .digest("hex");

        user.resetPasswordToken =
            hashedOtp;
        user.resetPasswordExpires =
            Date.now() +
            10 * 60 * 1000;

        await user.save();
        try {

            await sendEmail({
                to:
                    user.email,

                subject:
                    "Hospital Management System - Password Reset OTP",

                message:
                    `Hello ${user.fullName},

We received a request to reset your Hospital Management System password.

Your password reset OTP is:

${otp}

This OTP is valid for 10 minutes.

Please enter this OTP in the Hospital Management System to create your new password.

If you did not request a password reset, you can safely ignore this email.

Regards,
Hospital Management System`,
            });

        } catch (emailError) {

            // Clear OTP if email sending fails
            user.resetPasswordToken =
                null;

            user.resetPasswordExpires =
                null;

            await user.save();

            console.error(
                "OTP EMAIL ERROR:",
                emailError
            );

            return res.status(500).json({
                success: false,

                message:
                    "Unable to send password reset OTP.",
            });
        }

        return res.status(200).json({
            success: true,

            message:
                "Password reset OTP has been sent to your email.",
        });

    } catch (error) {

        console.error(
            "FORGOT PASSWORD ERROR:",
            error
        );

        return res.status(500).json({
            success: false,

            message:
                error.message ||
                "Unable to send password reset OTP.",
        });
    }
}
async function resetPassword(
    req,
    res
) {
    try {

        const {
            email,
            otp,
            password,
        } = req.body;
        if (!email) {
            return res.status(400).json({
                success: false,

                message:
                    "Please enter your email address.",
            });
        }
        if (!otp) {
            return res.status(400).json({
                success: false,

                message:
                    "Please enter the OTP.",
            });
        }

        if (
            !/^\d{6}$/.test(otp)
        ) {
            return res.status(400).json({
                success: false,

                message:
                    "OTP must contain exactly 6 digits.",
            });
        }

        if (!password) {
            return res.status(400).json({
                success: false,

                message:
                    "Please enter a new password.",
            });
        }

        if (
            password.length < 6
        ) {
            return res.status(400).json({
                success: false,

                message:
                    "Password must contain at least 6 characters.",
            });
        }

        const normalizedEmail =
            email.trim().toLowerCase();

        const hashedOtp =
            crypto
                .createHash(
                    "sha256"
                )
                .update(otp)
                .digest("hex");

        const user =
            await User.findOne({
                email:
                    normalizedEmail,

                resetPasswordToken:
                    hashedOtp,

                resetPasswordExpires: {
                    $gt:
                        Date.now(),
                },
            });

        if (!user) {
            return res.status(400).json({
                success: false,

                message:
                    "Invalid or expired OTP.",
            });
        }

        user.password =
            await bcrypt.hash(
                password,
                10
            );
        user.resetPasswordToken =
            null;

        user.resetPasswordExpires =
            null;

        await user.save();

        console.log(
            "PASSWORD RESET SUCCESS:",
            user.email
        );

        return res.status(200).json({
            success: true,

            message:
                "Password has been reset successfully.",
        });

    } catch (error) {

        console.error(
            "RESET PASSWORD ERROR:",
            error
        );

        return res.status(500).json({
            success: false,

            message:
                error.message ||
                "Something went wrong while resetting the password.",
        });
    }
}
module.exports = {
    registerUser,
    loginUser,
    forgotPassword,
    resetPassword,
};