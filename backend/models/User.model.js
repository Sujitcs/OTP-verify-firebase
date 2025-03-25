const mongoose = require('mongoose');

const userschema= new mongoose.Schema({
    phone: { type: String, required: true, unique: true },
    otp: { type: String },
    otpExpires: { type: Date },
    isVerified: { type: Boolean, default: false }
    
},{versionKey:false})
module.exports=mongoose.model('usermodel',userschema)
console.log('user model is ready')