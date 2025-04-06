// filepath: /pbf_silo_notification_demo/src/js/notification-sender.js
document.addEventListener("DOMContentLoaded", function () {
  // Get the button and input elements
  const sendButton = document.getElementById("sendNotification");
  const titleInput = document.getElementById("notificationTitle");
  const bodyInput = document.getElementById("notificationBody");
  const statusDiv = document.getElementById("status");
  const selectAllCheckbox = document.getElementById("selectAllDevices");

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

    // Check if "Send to all" is selected
    if (selectAllCheckbox.checked) {
      sendToAllDevices(title, body);
    } else {
      // Get the selected device token
      const selectedDevice = document.querySelector(
        'input[name="selectedDevice"]:checked'
      );

      if (selectedDevice && selectedDevice.value) {
        // Use the selected device's token
        sendRealNotification(selectedDevice.value, title, body);
      } else {
        // No device selected and not sending to all
        statusDiv.innerHTML =
          "<p class='text-yellow-500'>⚠️ Please select a device or check \"Send to all devices\"</p>";
      }
    }
  });

  // Function to send notification to all devices
  function sendToAllDevices(title, body) {
    // Get all device tokens
    const allDeviceRadios = document.querySelectorAll(".device-radio");
    const deviceTokens = Array.from(allDeviceRadios).map(
      (radio) => radio.value
    );

    if (deviceTokens.length === 0) {
      statusDiv.innerHTML =
        "<p class='text-yellow-500'>⚠️ No devices available to send notifications</p>";
      return;
    }

    statusDiv.innerHTML = `<p class='text-blue-500'>Sending notifications to ${deviceTokens.length} devices...</p>`;

    // Use Promise.all to send notifications to all devices and track progress
    let successCount = 0;
    let failureCount = 0;

    Promise.all(
      deviceTokens.map((token) =>
        fetch("http://localhost:3000/send-notification", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token, title, body }),
        })
          .then((response) => response.json())
          .then((data) => {
            if (data.success) {
              successCount++;
            } else {
              failureCount++;
            }
            return data;
          })
          .catch((error) => {
            failureCount++;
            console.error("Error sending to device:", error);
            return { success: false, error: error.message };
          })
      )
    ).finally(() => {
      if (failureCount > 0) {
        statusDiv.innerHTML = `<p class='text-yellow-500'>✓ Sent to ${successCount} devices, failed for ${failureCount} devices</p>`;
      } else {
        statusDiv.innerHTML = `<p class='text-green-500'>✓ Notifications sent successfully to all ${successCount} devices!</p>`;
      }
    });
  }

  // Add event listener to toggle device selection when "Select All" is checked/unchecked
  selectAllCheckbox.addEventListener("change", function () {
    const deviceRadios = document.querySelectorAll(".device-radio");

    // If checked, disable all individual selection radio buttons
    deviceRadios.forEach((radio) => {
      radio.disabled = this.checked;

      // Update styling for disabled state
      const deviceCard = radio.closest("#deviceList > div");
      if (deviceCard) {
        if (this.checked) {
          // When select all is checked, highlight all cards
          deviceCard.classList.remove("border-gray-200");
          deviceCard.classList.add(
            "border-green-500",
            "bg-green-50",
            "opacity-70"
          );
        } else {
          // When unchecked, restore normal state and only highlight the selected one
          deviceCard.classList.remove(
            "border-green-500",
            "bg-green-50",
            "opacity-70"
          );
          deviceCard.classList.add("border-gray-200");

          // Reselect the first one
          const firstRadio = document.querySelector(
            'input[name="selectedDevice"]'
          );
          if (firstRadio) {
            firstRadio.checked = true;
            firstRadio.dispatchEvent(new Event("change"));
          }
        }
      }
    });
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
