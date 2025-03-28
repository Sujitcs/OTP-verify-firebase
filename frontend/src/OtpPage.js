import React, { useState } from "react";
import OtpInput from "otp-input-react";
import axios from "axios";
import "./otppage.css";

const OtpPage = ({ setUserAuthenticated, setAuthToken }) => {
  const [inputValue, setInputValue] = useState(""); // Accepts phone or email
  const [otp, setOtp] = useState("");
  const [showOTP, setShowOTP] = useState(false);
  const [loading, setLoading] = useState(false);
  const [receivedOtp, setReceivedOtp] = useState("");
  const [error, setError] = useState("");

  const API_URL = "http://localhost:5000";

  // Function to validate phone number or email
  const validateInput = () => {
    const trimmedInput = inputValue.trim();
    if (!trimmedInput) return "Please enter a phone number or an email.";
  
    if (/^\d+$/.test(trimmedInput)) {
      if (!/^\d{10}$/.test(trimmedInput)) return "Invalid phone number format. Enter a 10-digit number.";
    } else {
      if (!/^\S+@\S+\.\S+$/.test(trimmedInput)) return "Invalid email format.";
    }
  
    return "";
  };
  
  // Function to handle OTP send
  const onSignup = async () => {
    const validationError = validateInput();
    if (validationError) {
      setError(validationError);
      return;
    }
  
    setLoading(true);
    setError("");
  
    const payload = /^\d+$/.test(inputValue)
      ? { phone: inputValue }  // Send as phone if numeric
      : { email: inputValue }; // Send as email if non-numeric
  
    try {
      const response = await axios.post(`${API_URL}/api/create-otp`, payload, {
        headers: { "Content-Type": "application/json" },
      });
  
      if (response.data.otp) {
        setReceivedOtp(response.data.otp);
        setShowOTP(true);
      } else {
        setError("Failed to send OTP. Please try again.");
      }
    } catch (error) {
      setError(error.response?.data?.message || "An error occurred. Please try again.");
    }
  
    setLoading(false);
  };
  

  // Function to verify OTP
  const onOTPVerify = async () => {
    try {
      if (!/^\d{6}$/.test(otp.trim())) {
        setError("Please enter a valid 6-digit OTP.");
        return;
      }
  
      // Construct payload correctly
      const trimmedInput = inputValue.trim();
      let payload = {};
  
      if (/^\d{10}$/.test(trimmedInput)) {
        payload = { phone: trimmedInput, otp };
      } else if (/^\S+@\S+\.\S+$/.test(trimmedInput)) {
        payload = { email: trimmedInput, otp };
      } else {
        setError("Invalid input format. Please enter a valid phone number or email.");
        return;
      }
  
      console.log("Payload being sent to backend:", payload);
  
      // Send OTP verification request
      const response = await axios.post(`${API_URL}/api/verify-otp`, payload, {
        headers: { "Content-Type": "application/json" },
      });
  
      console.log("OTP Verification Response:", response.data);
  
      if (response.data?.message === "OTP verified successfully") {
        // Proceed with login
        const loginResponse = await axios.post(`${API_URL}/api/login`, payload);
  
        console.log("Login Response:", loginResponse.data);
  
        if (loginResponse.data?.message === "Login successful" && loginResponse.data?.token) {
          localStorage.setItem("authToken", loginResponse.data.token);
          setAuthToken(loginResponse.data.token);
          setUserAuthenticated(true);
        } else {
          setError("Login failed. Please try again.");
        }
      } else {
        setError("OTP verification failed. Please check and try again.");
      }
    } catch (error) {
      console.error("OTP Verification Error:", error);
      setError(error.response?.data?.message || "An error occurred. Please try again.");
    }
  };
  
  
  
  

  return (
    <section className="containerStyle">
      <div className="boxStyle">
        <h2>OTP Verification</h2>
        <h4 className="error">{error || " "}</h4>

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
              <button onClick={onOTPVerify} disabled={loading} className="buttonStyle">
                {loading ? "Verifying..." : "Verify OTP"}
              </button>

              <button onClick={onSignup} disabled={loading} className="buttonStyle resendButtonStyle">
                {loading ? "Resending..." : "Resend OTP"}
              </button>
            </div>
          </div>
        ) : (
          <div className="phoneContainerStyle">
            <label>Enter your phone number or email</label>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Enter phone number or email"
              className="inputStyle"
              maxLength={50}
              minLength={10}
            />

            <button onClick={onSignup} disabled={loading} className="buttonStyle1">
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default OtpPage;
