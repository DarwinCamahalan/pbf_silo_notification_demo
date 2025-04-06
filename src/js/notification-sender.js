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
      "dUG2lRV_T-KRQLdWoV9lSk:APA91bGkY0xDa7JhObPGin5iCItumaD0MOoM2f9n0gwwEmXs-Xim7Yjw19myr8VZVjvMwUEVq70Ok0JASXZU60aMnGtKWgjMHLPfvp7Q-k_b0YP7FbE3o3M";
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
