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

  const API_URL = "https://otp-verify-firebase-fcm-node.onrender.com";

  const onSignup = async () => {
    if (phone.length !== 10) {
      console.log("Invalid phone number:", phone);
      return;
    }
    setLoading(true);
    try {
      console.log("Sending OTP to:", phone);
      const response = await axios.post(
        `${API_URL}/api/create-otp`,
        { phone },
        { headers: { "Content-Type": "application/json" } }
      );
      console.log("OTP Sent Response:", response.data);
      if (response.data.otp) {
        setReceivedOtp(response.data.otp);
      }
      setShowOTP(true);
      console.log("otpp", response.data.otp);
    } catch (error) {
      console.error(
        "API Error:",
        error.response ? error.response.data : error.message
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
      console.log("Invalid OTP entered:", otp);
      return;
    }
    setLoading(true);
    try {
      console.log("Verifying OTP for phone:", phone, "OTP:", otp);
      const response = await axios.post(`${API_URL}/api/verify-otp`, {
        phone,
        otp,
      });
      console.log("OTP Verification Response:", response.data);

      if (response.data.message === "OTP verified successfully") {
        console.log("OTP verified successfully. Logging in...");
        const loginResponse = await axios.post(`${API_URL}/api/login`, {
          phone,
        });
        console.log("Login Response:", loginResponse.data);

        if (loginResponse.data.message === "Login successful") {
          const token = loginResponse.data.token;
          console.log("Login successful. Token received:", token);
          localStorage.setItem("authToken", token);
          setAuthToken(token);
          setUserAuthenticated(true);
        } else {
          console.log("Login failed:", loginResponse.data.message);
        }
      } else {
        console.log("OTP verification failed:", response.data.message);
      }
    } catch (error) {
      console.error(
        "Error verifying OTP:",
        error.response ? error.response.data : error.message
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

    // Check if input starts with consecutive identical numbers (e.g., 000, 111, 999)
    if (/^(\d)\1+/.test(input)) {
      return; // Prevent setting numbers that start with repeated digits
    }

    if (input.length <= 10) {
      setPhone(input); // Update state only if it passes validation
    }
  };

  return (
    <section className="containerStyle">
      <div className="boxStyle">
        <h2>OTP verify with Firebase</h2>
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
