const express = require('express');
const userrouter = express.Router();
const jwt = require('jsonwebtoken');
require('dotenv').config();
const User = require("../models/User.model");
const admin = require("../firebase");
const nodemailer = require('nodemailer');
// const twilio = require("twilio");

// Twilio configuration
// const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
// const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;
// console.log("Twilio Credentials:", twilioClient, TWILIO_PHONE_NUMBER);

// Function to generate OTP
const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

// Nodemailer Transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Function to send OTP via Email
const sendOtpViaEmail = (email, otp) => {
  return transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your OTP Code",
    text: `Your OTP is ${otp}. It will expire in 5 minutes.`,
  });
};

// Function to send OTP via FCM
const sendOtpViaFCM = (fcmToken, otp) => {
  return admin.messaging().send({
    notification: {
      title: "Your OTP Code",
      body: `Your OTP is ${otp}. It will expire in 5 minutes.`,
    },
    token: fcmToken,
  });
};

// API to Create OTP
userrouter.post("/create-otp", async (req, res) => {
  try {
    const { phone, email } = req.body;
    const fcmToken = "dBvvJDOZB9BmY4yggIEV9p:APA91bE0tes1EI0gNsBPfKU-jtaqJ5xCdtCta7FoS_kub-S6mVwQ2fpk7GS9nX53cAhoEL9fcP46BdDMcNxIS4vIE6OmLtbtIZtD27Y2FlvK2DfxjIr9tzo";

    if (!phone && !email) return res.status(400).json({ message: "Phone or email is required" });

    let user = await User.findOne(phone ? { phone } : { email });

    if (user?.otp && new Date() < new Date(user.otpExpires)) {
      return res.status(200).json({ message: "OTP already sent. Try again after 5 minutes.", otp: user.otp });
    }

    // Generate & Update OTP
    const otp = generateOtp();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000);

    if (!user) {
      user = new User({ phone, email, otp, otpExpires, isVerified: false, fcmToken });
    } else {
      Object.assign(user, { otp, otpExpires, fcmToken });
    }
    await user.save();

    // Send OTP
    const sendOtp = phone
      ? sendOtpViaFCM(fcmToken, otp).then(() => "OTP sent via FCM")
      : sendOtpViaEmail(email, otp).then(() => "OTP sent via Email");

    sendOtp
      .then((message) => res.json({ message, otp }))
      .catch(() => res.status(500).json({ message: "Error sending OTP" }));
  } catch (error) {
    console.error("Error in create-otp:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// 2. Verify OTP
userrouter.post("/verify-otp", async (req, res) => {
    try {
        const { phone, email, otp } = req.body;
        console.log("Received request body:", req.body);

        if ((!phone && !email) || !otp) {
            return res.status(400).json({ message: "Phone or Email and OTP are required" });
        }

        const user = phone ? await User.findOne({ phone }) : await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        if (user.otp !== otp) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        if (new Date().getTime() > new Date(user.otpExpires).getTime()) {
            return res.status(400).json({ message: "OTP expired" });
        }

        user.isVerified = true;
        user.otp = null;
        user.otpExpires = null;
        await user.save();

        res.json({ message: "OTP verified successfully" });
    } catch (error) {
        console.error("Error in verify-otp:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});


// 3. Login and Generate JWT Token
userrouter.post("/login", async (req, res) => {
  try {
      const { phone, email } = req.body;

      if (!phone && !email) {
          return res.status(400).json({ message: "Phone or Email is required" });
      }

      const user = phone ? await User.findOne({ phone }) : await User.findOne({ email });

      if (!user || !user.isVerified) {
          return res.status(400).json({ message: "User not verified" });
      }

      const token = jwt.sign({ id: user._id, phone: user.phone, email: user.email }, process.env.SECRET_KEY, { expiresIn: "1h" });

      res.json({ message: "Login successful", token });
  } catch (error) {
      console.error("Error in login:", error);
      res.status(500).json({ message: "Internal server error" });
  }
});

//let blacklistedTokens = new Set();
// 4. Logout
userrouter.post("/logout", async (req, res) => {
  try {
    //const { token } = req.body;
    // if (!token) {
    //   return res.status(400).json({ message: "Token is required for logout" });
    // }
   // blacklistedTokens.add(token);

    res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Error in logout:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});



module.exports = userrouter;
console.log('User router is ready');
