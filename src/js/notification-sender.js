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

    // Status handling
    if (statusDiv) {
      statusDiv.textContent = "Sending notification...";
    } else {
      console.error("Status element not found");
    }

    // Get values from the form
    const title = titleInput.value || "PBF Silo Notification";
    const body =
      bodyInput.value || "This is a test notification from the web app!";

    // TESTING: Use hardcoded token instead of finding one on the page
    const testToken =
      "cZZubPRUTbmzYtWjrx2jsA:APA91bFB0Vnx1meFofXXO0YNcnVCQBis-NjTxJdZsYlVRgNq9p5-kz3NaFxYj5XuTALkWTXmfHhw0osYCM7vvTO2eVBInCCx4TOuLxRFgTyEsbynhx55Uck";
    sendRealNotification(testToken, title, body);
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
          statusDiv.innerHTML = `<p class='text-red-500'>✗ Error: ${
            data.error || "Unknown error"
          }</p>`;
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        statusDiv.innerHTML =
          "<p class='text-red-500'>✗ Error connecting to notification server</p>";
      });
  }
});
