const nodemailer = require("nodemailer");

const sendEmail = async (data, req, res) => {
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.user,
      pass: process.env.pass,
    },
  });

  await transporter.sendMail({
    from: "Social Media",
    to: data.to,
    subject: data.subject,
    text: data.text,
    html: data.htm,
  });
};

module.exports = sendEmail;
