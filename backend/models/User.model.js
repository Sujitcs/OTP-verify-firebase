const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
      phone: { 
        type: String,  
      },
      email: { 
        type: String, 
      },
      otp: { type: String },
      otpExpires: { type: Date },
      isVerified: { type: Boolean, default: false }
    },
    { versionKey: false, timestamps: true }
  );


module.exports = mongoose.model("UserModel", userSchema);

console.log("User model is ready");
