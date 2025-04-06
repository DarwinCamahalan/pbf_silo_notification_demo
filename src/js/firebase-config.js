// filepath: /pbf_silo_notification_demo/src/js/firebase-config.js
// Firebase configuration file
import firebase from "firebase/compat/app";
import "firebase/compat/messaging";

// Initialize Firebase with your web configuration
const firebaseConfig = {
  apiKey: "AIzaSyAuqJcVZDCSc66gY_rWytg__4k4KUEfXR8",
  authDomain: "pbf-silo-app.firebaseapp.com",
  projectId: "pbf-silo-app",
  storageBucket: "pbf-silo-app.firebasestorage.app",
  messagingSenderId: "544064554248",
  appId: "1:544064554248:web:546b5779d549ce72f4d8bd",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

console.log("Firebase initialized successfully");

// Enable the check for service worker
if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/firebase-messaging-sw.js")
    .then(function (registration) {
      console.log("Service Worker registered with scope:", registration.scope);
    })
    .catch(function (error) {
      console.log("Service Worker registration failed:", error);
    });
}
