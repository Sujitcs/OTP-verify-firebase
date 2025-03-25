import React, { useEffect, useState } from "react";
import { messaging, getToken } from "./firebaseConfig";
import { deleteToken } from "firebase/messaging";
const Fcmtoken = ({ setUserAuthenticated }) => {
  const [fcmToken, setFcmToken] = useState("");

  useEffect(() => {
    requestNewFCMToken();
  }, []);

  const requestNewFCMToken = async () => {
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        console.warn("Notification permission denied.");
        return;
      }

      const vapidKey = process.env.REACT_APP_VAPID_KEY;
      if (!vapidKey) {
        console.error("VAPID Key is missing in environment variables.");
        return;
      }

      const token = await getToken(messaging, { vapidKey });
      if (token) {
        console.log("✅ New FCM Token:", token);
        setFcmToken(token);
      } else {
        console.warn("⚠️ No FCM token received.");
      }
    } catch (error) {
      console.error("❌ Error getting FCM token:", error);
    }
  };
  

  const clearAndRequestNewToken = async () => {
    try {
      await deleteToken(messaging); // Clear old token
      requestNewFCMToken(); // Request a new one
    } catch (error) {
      console.error("Error deleting FCM token:", error);
    }
  };
  
  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <button
        onClick={requestNewFCMToken}
        className="bg-blue-500 text-white px-4 py-2 rounded mt-4"
      >
        Generate New FCM Token
      </button>
      <button onClick={clearAndRequestNewToken}>clear FCM Token</button>

      {fcmToken && <p className="mt-4"><strong>Your New FCM Token:</strong> {fcmToken}</p>}
    </div>
  );
};

export default Fcmtoken;
