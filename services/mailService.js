const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendOTPEmail = async (email, otp) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Your Verification OTP',
        text: `Your OTP for registration is: ${otp}. It will expire in 10 minutes.`,
        html: `<h3>Welcome to Shopzy Ecommerce</h3>
               <p>Your OTP for registration is: <strong>${otp}</strong></p>
               <p>This OTP will expire in 10 minutes.</p>`
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`OTP sent to ${email}`);
    } catch (error) {
        console.error("Error sending email:", error);
        throw new Error("Failed to send OTP email");
    }
};

module.exports = { sendOTPEmail };
