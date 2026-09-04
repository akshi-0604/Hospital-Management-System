const axios = require("axios");

async function sendEmail({ to, subject, message }) {
  try {
    if (!to || !subject || !message) {
      throw new Error("Email recipient, subject, and message are required");
    }

    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: process.env.BREVO_SENDER_NAME || "Hospital Management System",
          email: process.env.BREVO_SENDER_EMAIL,
        },

        to: [
          {
            email: to,
          },
        ],

        subject: subject,

        textContent: message,
      },
      {
        headers: {
          accept: "application/json",
          "api-key": process.env.BREVO_API_KEY,
          "content-type": "application/json",
        },
      }
    );

    console.log("Brevo email sent successfully:", response.data);

    return response.data;
  } catch (error) {
    console.error(
      "Brevo email error:",
      error.response?.data || error.message
    );

    throw new Error("Failed to send email");
  }
}

module.exports = sendEmail;