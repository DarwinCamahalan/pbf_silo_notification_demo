// filepath: /pbf_silo_notification_demo/src/js/notification-sender.js
document.addEventListener("DOMContentLoaded", function () {
  // Get the button and input elements
  const sendButton = document.getElementById("sendNotification");
  const titleInput = document.getElementById("notificationTitle");
  const bodyInput = document.getElementById("notificationBody");
  const statusDiv = document.getElementById("status");

  // Add a click event listener to the button
  sendButton.addEventListener("click", function () {
    console.log("Send notification button clicked");

    // Get values from the form
    const title = titleInput.value || "PBF Silo Notification";
    const body =
      bodyInput.value || "This is a test notification from the web app!";

    // Get the FCM token from the page
    const fcmTokenElement = document.querySelector(
      "p[style='word-break: break-all']"
    );
    const fcmToken = fcmTokenElement.textContent.trim();

    // Update status
    statusDiv.innerHTML =
      "<p class='text-blue-500'>Sending notification...</p>";

    // Actually send the notification through the server
    sendRealNotification(fcmToken, title, body);
  });

  // Send a real notification via our backend server
  function sendRealNotification(token, title, body) {
    console.log("Sending notification to token:", token);

    fetch("http://localhost:3000/send-notification", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token,
        title,
        body,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Success:", data);
        if (data.success) {
          statusDiv.innerHTML =
            "<p class='text-green-500'>✓ Notification sent successfully!</p>";
        } else {
          statusDiv.innerHTML = `<p class='text-red-500'>✗ Error: ${data.error}</p>`;
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        statusDiv.innerHTML =
          "<p class='text-red-500'>✗ Error connecting to notification server</p>";
      });
  }
});
