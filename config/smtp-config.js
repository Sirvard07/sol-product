require("dotenv").config();

let smtpConfig = {
  host: "smtp.sendgrid.net",
  secure: true, // use SSL
  auth: {
    user: "apikey",
    pass: process.env.SENDGRID_API_KEY,
  },
};

module.exports = smtpConfig
