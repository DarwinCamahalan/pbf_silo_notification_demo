// filepath: /pbf_silo_notification_demo/src/js/notification-sender.js
document.addEventListener("DOMContentLoaded", function () {
  // Get the button and input elements
  const sendButton = document.getElementById("sendNotification");
  const titleInput = document.getElementById("notificationTitle");
  const bodyInput = document.getElementById("notificationBody");
  const statusDiv = document.getElementById("status");
  const selectAllCheckbox = document.getElementById("selectAllDevices");
  const toastContainer = document.getElementById("toastContainer");

  // Make window.sendNotificationToAll available for the automatic notification feature
  window.sendNotificationToAll = function (title, body) {
    sendToAllDevices(title, body);
  };

  // Make window.sendNotificationToSelected available for the automatic notification feature
  window.sendNotificationToSelected = function (title, body) {
    const selectedDevice = document.querySelector(
      'input[name="selectedDevice"]:checked'
    );
    if (selectedDevice && selectedDevice.value) {
      sendRealNotification(selectedDevice.value, title, body);
    } else {
      showToast("No device selected for notification", "error");
    }
  };

  // Function to show toast notification
  function showToast(message, type = "success") {
    // Create toast element
    const toast = document.createElement("div");

    // Set classes based on type
    if (type === "success") {
      toast.className =
        "bg-green-700 text-white px-4 py-3 rounded-md shadow-lg flex items-center";
      toast.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
        </svg>
        ${message}
      `;
    } else {
      toast.className =
        "bg-gray-500 text-white px-4 py-3 rounded shadow-lg flex items-center";
      toast.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
        </svg>
        ${message}
      `;
    }

    // Add to container
    toastContainer.appendChild(toast);

    // Auto remove after 4 seconds
    setTimeout(() => {
      toast.classList.add("opacity-0", "transition-opacity", "duration-500");
      setTimeout(() => {
        toastContainer.removeChild(toast);
      }, 500);
    }, 4000);
  }

  // Add a click event listener to the button
  sendButton.addEventListener("click", function () {
    console.log("Send notification button clicked");

    // Clear previous status
    statusDiv.textContent = "";

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
        showToast(
          "Please select a device or check 'Send to all devices'",
          "error"
        );
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
      showToast("No devices available to send notifications", "error");
      return;
    }

    // Show sending indicator
    const sendingToast = document.createElement("div");
    sendingToast.className =
      "bg-blue-500 text-white px-4 py-3 rounded shadow-lg flex items-center";
    sendingToast.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 animate-spin" viewBox="0 0 24 24" fill="none">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      Sending notifications to ${deviceTokens.length} devices...
    `;
    toastContainer.appendChild(sendingToast);

    // Use Promise.all to send notifications to all devices and track progress
    let successCount = 0;
    let failureCount = 0;

    Promise.all(
      deviceTokens.map((token) =>
        fetch("/api/send-notification", {
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
      // Remove the sending toast
      toastContainer.removeChild(sendingToast);

      if (failureCount > 0) {
        showToast(
          `Sent to ${successCount} devices, failed for ${failureCount} devices`,
          failureCount > successCount ? "error" : "success"
        );
      } else {
        showToast(
          `Notifications sent successfully to all ${successCount} devices!`,
          "success"
        );
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

    // Show sending toast
    const sendingToast = document.createElement("div");
    sendingToast.className =
      "bg-blue-500 text-white px-4 py-3 rounded shadow-lg flex items-center";
    sendingToast.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 animate-spin" viewBox="0 0 24 24" fill="none">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      Sending notification...
    `;
    toastContainer.appendChild(sendingToast);

    fetch("/api/send-notification", {
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
        // Remove sending toast
        toastContainer.removeChild(sendingToast);

        console.log("Success:", data);
        if (data.success) {
          showToast("Notification sent successfully!", "success");
        } else {
          showToast(`Error: ${data.error || "Unknown error"}`, "error");
        }
      })
      .catch((error) => {
        // Remove sending toast
        if (toastContainer.contains(sendingToast)) {
          toastContainer.removeChild(sendingToast);
        }

        console.error("Error:", error);
        showToast("Error connecting to notification server", "error");
      });
  }
});
