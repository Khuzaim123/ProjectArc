const nodemailer = require('nodemailer');

// Create email transporter
const createTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT),
        secure: false, // true for 465, false for other ports like 587
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
        tls: {
            // Do not fail on invalid certs for development
            rejectUnauthorized: false,
        },
    });
};

module.exports = createTransporter;
