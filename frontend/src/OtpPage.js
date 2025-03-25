import React, { useState } from "react";
import OtpInput from "otp-input-react";
import axios from "axios";
import "./otppage.css";

const OtpPage = ({ setUserAuthenticated, setAuthToken }) => {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [showOTP, setShowOTP] = useState(false);
  const [loading, setLoading] = useState(false);
  const [receivedOtp, setReceivedOtp] = useState("");
  const [error, setError] = useState("");


  const API_URL = "https://otp-verify-firebase-fcm-node.onrender.com";

  const onSignup = async () => {
    if (phone.length !== 10) {
      setError("Invalid phone number. Please enter a valid 10-digit number.");
      return;
    }
    setLoading(true);
    setError("");
  
    try {
      const response = await axios.post(
        `${API_URL}/api/create-otp`,
        { phone },
        { headers: { "Content-Type": "application/json" } }
      );
  
      if (response.data.otp) {
        setReceivedOtp(response.data.otp);
        setShowOTP(true);
      } else {
        setError("Failed to send OTP. Please try again.");
      }
    } catch (error) {
      setError(
        error.response?.data?.message || "An error occurred. Please try again."
      );
    }
    setLoading(false);
  };
  

  const onResendOtp = () => {
    console.log("Resending OTP...");
    onSignup();
  };

  const onOTPVerify = async () => {
    if (otp.length !== 6) {
      setError("Invalid OTP. Please enter a 6-digit code.");
      return;
    }
    setLoading(true);
    setError("");
  
    try {
      const response = await axios.post(`${API_URL}/api/verify-otp`, {
        phone,
        otp,
      });
  
      if (response.data.message === "OTP verified successfully") {
        const loginResponse = await axios.post(`${API_URL}/api/login`, { phone });
  
        if (loginResponse.data.message === "Login successful") {
          const token = loginResponse.data.token;
          localStorage.setItem("authToken", token);
          setAuthToken(token);
          setUserAuthenticated(true);
        } else {
          setError("Login failed. Please try again.");
        }
      } else {
        setError("OTP verification failed. Please check and try again.");
      }
    } catch (error) {
      setError(
        error.response?.data?.message || "An error occurred. Please try again."
      );
    }
    setLoading(false);
  };
  
  const handlePhoneChange = (e) => {
    let input = e.target.value.replace(/\D/g, ""); // Remove non-numeric characters
  
    // Check if input starts with 0 or 1
    if (/^[01]/.test(input)) {
      return;
    }
  
    // Check if input contains five or more consecutive identical digits
    if (/(.)\1{4,}/.test(input)) {
      return; // Prevent setting numbers that have 5 or more repeated digits
    }
  
    if (input.length <= 10) {
      setPhone(input); // Update state only if it passes validation
    }
  };
  

  return (
    <section className="containerStyle">
      <div className="boxStyle">
        <h2>OTP verify with Firebase</h2>
        <h4 className="error">{error ? error : " "}</h4>

        {showOTP ? (
          <div className="otpContainerStyle">
            <label>Your OTP is {receivedOtp}</label>

            <OtpInput
              value={otp}
              onChange={setOtp}
              OTPLength={6}
              otpType="number"
              autoFocus
              inputClassName="otp-input"
            />

            <div className="buttonContainer">
              <button
                onClick={onOTPVerify}
                disabled={loading}
                className="buttonStyle"
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </button>

              <button
                onClick={onResendOtp}
                disabled={loading}
                className="buttonStyle resendButtonStyle"
              >
                {loading ? "Resending..." : "Resend OTP"}
              </button>
            </div>
          </div>
        ) : (
          <div className="phoneContainerStyle">
            <label>Enter your phone number</label>

            <input
              type="tel"
              value={phone}
              onChange={handlePhoneChange}
              placeholder="Enter your 10-digit phone number"
              className="inputStyle"
              maxLength="10"
            />

            <button
              onClick={onSignup}
              disabled={loading}
              className="buttonStyle1"
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default OtpPage;
