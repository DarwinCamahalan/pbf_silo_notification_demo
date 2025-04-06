require("dotenv").config();
const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
const bodyParser = require("body-parser");

// Initialize the app
const app = express();
app.use(cors()); // Enable CORS for browser requests
app.use(bodyParser.json()); // Parse JSON request bodies

// Use environment variables for Firebase initialization
let firebaseCredentials;

try {
  firebaseCredentials = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  };

  admin.initializeApp({
    credential: admin.credential.cert(firebaseCredentials),
  });

  console.log("Firebase initialized with environment variables");
} catch (error) {
  console.error("Error initializing Firebase:", error);
  process.exit(1);
}

// API endpoint to send notifications
app.post("/send-notification", async (req, res) => {
  try {
    const { token, title, body } = req.body;

    if (!token || !title || !body) {
      return res.status(400).json({
        success: false,
        error: "Missing required parameters: token, title, or body",
      });
    }

    const message = {
      notification: {
        title,
        body,
      },
      token,
    };

    // Send the message
    const response = await admin.messaging().send(message);
    console.log("Successfully sent message:", response);

    return res.status(200).json({
      success: true,
      messageId: response,
    });
  } catch (error) {
    console.error("Error sending message:", error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
