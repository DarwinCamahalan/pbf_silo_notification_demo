// Firebase Cloud Messaging Service Worker

importScripts(
  "https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js"
);

firebase.initializeApp({
  apiKey: "AIzaSyAuqJcVZDCSc66gY_rWytg__4k4KUEfXR8",
  authDomain: "pbf-silo-app.firebaseapp.com",
  projectId: "pbf-silo-app",
  storageBucket: "pbf-silo-app.firebasestorage.app",
  messagingSenderId: "544064554248",
  appId: "1:544064554248:web:546b5779d549ce72f4d8bd",
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage(function (payload) {
  console.log(
    "[firebase-messaging-sw.js] Received background message ",
    payload
  );

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/favicon.ico",
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
