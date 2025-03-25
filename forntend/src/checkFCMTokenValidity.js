import { getToken } from "firebase/messaging";
import { messaging } from "./firebaseConfig";

const checkFCMTokenValidity = async () => {
  try {
    const token = await getToken(messaging, {
      vapidKey: process.env.REACT_APP_VAPID_KEY, // Ensure this is set in .env
    });

    if (token) {
      console.log("✅ FCM Token is valid:", token);
      return token; // Return the valid token
    } else {
      console.warn("⚠️ No FCM token found. Requesting a new one...");
      return null;
    }
  } catch (error) {
    console.error("❌ Error checking FCM Token validity:", error);
    return null;
  }
};

export default checkFCMTokenValidity;
