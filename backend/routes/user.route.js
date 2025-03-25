const express = require('express');
const userrouter = express.Router();
const jwt = require('jsonwebtoken');
require('dotenv').config();
const User = require("../models/User.model");
const admin = require("../firebase");
// const twilio = require("twilio");

// Twilio configuration
// const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
// const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;
// console.log("Twilio Credentials:", twilioClient, TWILIO_PHONE_NUMBER);

// Function to generate OTP
const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

// 1. Create OTP and Send
// userrouter.post("/create-otp", async (req, res) => {
//     try {
//       const { phone } = req.body;
//       if (!phone) return res.status(400).json({ message: "Phone number is required" });
  
//       const otp = generateOtp();
//       const otpExpires = new Date(Date.now() + 10 * 60 * 1000);
  
//       let user = await User.findOne({ phone });
  
//       if (!user) {
//         user = new User({ phone, otp, otpExpires, isVerified: false });
//       } else {
//         user.otp = otp;
//         user.otpExpires = otpExpires;
//       }
  
//       await user.save();
  
//       // Send OTP via Twilio
//       // await twilioClient.messages.create({
//       //   body: `Your OTP is ${otp}. It will expire in 10 minutes.`,
//       //   from: TWILIO_PHONE_NUMBER,
//       //   to: phone,
//       // });
  
//       res.json({ message: "OTP sent successfully" });
//     } catch (error) {
//       console.error("Error in create-otp:", error);
//       res.status(500).json({ message: "Internal server error" });
//     }
//   });

// 1. Create OTP and Send via FCM
userrouter.post("/create-otp", async (req, res) => {
  const fcmToken="cH5iPsVLoH_24ysW1PDPfU:APA91bE9UX6WuRYI_iSWyEastR6QZOcrD6wyUBbAmkVrHUeljgQRaOkPBLsorAYNEykzr63bDES9nMSLnBRUawnh5Jlu389hBFYPYGsi1C99I_2V5TwqQUI";
  try {
    const { phone } = req.body;

    if (!phone || !fcmToken) {
      console.log("Phone:", phone, "FCM Token:", fcmToken);
      return res.status(400).json({ message: "Phone number and FCM token are required" });
    }

    const otp = generateOtp();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    let user = await User.findOne({ phone });

    if (!user) {
      user = new User({ phone, otp, otpExpires, isVerified: false, fcmToken });
    } else {
      user.otp = otp;
      user.otpExpires = otpExpires;
      user.fcmToken = fcmToken;
    }

    await user.save();

    // Send OTP via FCM
    const message = {
      notification: {
        title: "Your OTP Code",
        body: `Your OTP is ${otp}. It will expire in 10 minutes.`,
      },
      token: fcmToken,
    };

    admin.messaging().send(message)
      .then(() => {
        res.json({ message: "OTP sent successfully via FCM",otp });
        console.log(otp);
      })
      .catch((error) => {
        console.error("FCM Error:", error);
        if (error.code === "messaging/registration-token-not-registered") {
          return res.status(400).json({ message: "FCM token is invalid or expired" });
        }
        return res.status(500).json({ message: "Error sending OTP via FCM" });
      });

  } catch (error) {
    console.error("Error in create-otp:", error);
    if (!res.headersSent) {
      res.status(500).json({ message: "Internal server error" });
    }
  }
});


// 2. Verify OTP
userrouter.post("/verify-otp", async (req, res) => {
    try {
        const { phone, otp } = req.body;

        if (!phone || !otp) return res.status(400).json({ message: "Phone and OTP are required" });

        const user = await User.findOne({ phone });

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
        const { phone } = req.body;
        if (!phone) return res.status(400).json({ message: "Phone number is required" });

        const user = await User.findOne({ phone });

        if (!user || !user.isVerified) {
            return res.status(400).json({ message: "User not verified" });
        }

        const token = jwt.sign({ phone: user.phone }, process.env.SECRET_KEY, { expiresIn: "1h" });

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
