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

    // Get the selected device token
    const selectedDevice = document.querySelector(
      'input[name="selectedDevice"]:checked'
    );

    if (selectedDevice && selectedDevice.value) {
      // Use the selected device's token
      sendRealNotification(selectedDevice.value, title, body);
    } else {
      // Fallback to hardcoded token if no device is selected
      const fallbackToken =
        "dp9Jw8a_TxK2hoZrj6nB92:APA91bGBv33U3Oez6_aOfse9Lr-yrXVXwuoKvo4RDpcPmCLJIdJgppaYWcfwQU5Py7z9COYQAQxnxzZG3MIISuO81VJTBa6ePIRHvInjuGjPCMUmXg3GcI8";
      statusDiv.innerHTML =
        "<p class='text-yellow-500'>⚠️ No device selected, using fallback token</p>";
      sendRealNotification(fallbackToken, title, body);
    }
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
