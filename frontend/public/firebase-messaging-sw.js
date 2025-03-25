importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js");

// Firebase Config (Same as firebase.js)
firebase.initializeApp({
  apiKey: "AIzaSyDQRITE1FycP0MBX8t7DXRndB1WLw2pr6Q",
  authDomain: "verify-otp-c9cde.firebaseapp.com",
  projectId: "verify-otp-c9cde",
  storageBucket: "verify-otp-c9cde.firebasestorage.app",
  messagingSenderId: "254997881536",
  appId: "1:254997881536:web:7ec9aa39c62e25c6208325",
  measurementId: "G-PVJDT0B6FD"
});

const messaging = firebase.messaging();

// Handle background notifications
messaging.onBackgroundMessage((payload) => {
    console.log("📩 Background Notification Received:", payload);
    self.registration.showNotification(payload.notification.title, {
        body: payload.notification.body,
        icon: "/logo192.png",
    });
});
