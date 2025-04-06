document.addEventListener("DOMContentLoaded", function () {
  const deviceListContainer = document.getElementById("deviceList");

  // Show loading state
  deviceListContainer.innerHTML = `
    <div class="border border-gray-200 rounded-md p-4">
      <p class="text-gray-500">Loading devices...</p>
    </div>
  `;

  // Make sure Firebase is initialized
  if (!firebase.apps.length) {
    console.error("Firebase not initialized! Check firebase-config.js");
    deviceListContainer.innerHTML = `
      <div class="border border-gray-200 rounded-md p-4">
        <p class="text-red-500">Error: Firebase not initialized</p>
      </div>
    `;
    return;
  }

  console.log(
    "Firebase database URL:",
    firebase.database().app.options.databaseURL
  );

  // Test database connection
  function testDatabaseConnection() {
    console.log("Testing database connection...");
    return firebase
      .database()
      .ref("devices")
      .once("value")
      .then((snapshot) => {
        console.log("Database connection successful");
        console.log("Devices data:", snapshot.val());
        return snapshot.val();
      })
      .catch((error) => {
        console.error("Database connection error:", error);
        throw error;
      });
  }

  // Call this function when the page loads
  testDatabaseConnection()
    .then((data) => {
      console.log("Database test completed successfully");
    })
    .catch((error) => {
      console.error("Database test failed:", error);
    });

  // Reference to devices node
  const devicesRef = firebase.database().ref("devices");

  // Test database connection
  firebase
    .database()
    .ref()
    .child("devices")
    .once("value")
    .then((snapshot) => {
      console.log("Database test:", snapshot.val());
      if (!snapshot.exists()) {
        console.warn("No devices found in database or path is incorrect");
      }
    })
    .catch((error) => {
      console.error("Database error:", error);
      deviceListContainer.innerHTML = `
        <div class="border border-gray-200 rounded-md p-4">
          <p class="text-red-500">Database connection error: ${error.message}</p>
        </div>
      `;
    });

  // Listen for changes to devices in the database
  devicesRef.on("value", (snapshot) => {
    console.log("Firebase data received:", snapshot.val());
    const devices = snapshot.val();

    // Clear the current device list
    deviceListContainer.innerHTML = "";

    if (!devices) {
      deviceListContainer.innerHTML = `
        <div class="border border-gray-200 rounded-md p-4">
          <p class="text-gray-500">No devices registered yet.</p>
        </div>
      `;
      return;
    }

    // Add each device to the list
    Object.entries(devices).forEach(([deviceId, deviceInfo]) => {
      try {
        const lastLoginDate = new Date(deviceInfo.lastLoginAt);
        const formattedDate = lastLoginDate.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });

        const deviceElement = document.createElement("div");
        deviceElement.className = "border border-gray-200 rounded-md p-4 mb-4";
        deviceElement.innerHTML = `
          <div class="flex justify-between items-start">
            <div>
              <h3 class="font-bold text-lg">${
                deviceInfo.manufacturer || "Unknown"
              } ${deviceInfo.model || "Device"}</h3>
              <p class="text-sm text-gray-600 mt-1">Logged in: ${formattedDate}</p>
              <p class="text-xs text-gray-500 mt-1">OS Version: ${
                deviceInfo.osVersion || "Unknown"
              }</p>
              <p class="text-xs text-gray-500">App Version: ${
                deviceInfo.appVersion || "Unknown"
              }</p>
              <p class="text-xs text-gray-500">Device ID: ${
                deviceInfo.deviceId
              }</p>
            </div>
            <div>
              <input 
                type="radio" 
                name="selectedDevice" 
                id="device-${deviceId}" 
                value="${deviceInfo.fcmToken}" 
                class="mr-2"
              >
              <label for="device-${deviceId}" class="text-sm font-medium text-blue-600">Select</label>
            </div>
          </div>
          <div class="mt-2">
            <p class="text-xs text-gray-500 font-semibold">FCM Token:</p>
            <p class="text-xs text-gray-500 break-all">${
              deviceInfo.fcmToken || "No token available"
            }</p>
          </div>
        `;

        deviceListContainer.appendChild(deviceElement);
      } catch (error) {
        console.error(`Error rendering device ${deviceId}:`, error);
      }
    });

    // Select the first device by default
    const firstRadio = document.querySelector('input[name="selectedDevice"]');
    if (firstRadio) {
      firstRadio.checked = true;
    }
  });

  // Handle errors
  devicesRef.on("error", (error) => {
    console.error("Error fetching devices:", error);
    deviceListContainer.innerHTML = `
      <div class="border border-gray-200 rounded-md p-4">
        <p class="text-red-500">Error loading devices: ${error.message}</p>
      </div>
    `;
  });
});
