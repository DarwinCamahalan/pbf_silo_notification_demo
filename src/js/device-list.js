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

  // Add this near the top of your DOMContentLoaded function

  let currentFilter = "today"; // Default filter

  // Add event listeners for filter buttons
  document.getElementById("filterToday").addEventListener("click", () => {
    setActiveFilter("today");
    filterDevices("today");
  });

  document.getElementById("filterWeek").addEventListener("click", () => {
    setActiveFilter("week");
    filterDevices("week");
  });

  document.getElementById("filterAll").addEventListener("click", () => {
    setActiveFilter("all");
    filterDevices("all");
  });

  // Function to set active filter button styles
  function setActiveFilter(filter) {
    currentFilter = filter;

    // Reset all buttons to inactive style
    document.getElementById("filterToday").className =
      "px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-300 hover:bg-gray-100 hover:text-green-700 focus:z-10 focus:ring-2 focus:ring-green-300 focus:outline-none";
    document.getElementById("filterWeek").className =
      "px-4 py-2 text-sm font-medium text-gray-900 bg-white border-t border-b border-gray-300 hover:bg-gray-100 hover:text-green-700 focus:z-10 focus:ring-2 focus:ring-green-300 focus:outline-none";
    document.getElementById("filterAll").className =
      "px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-300 hover:bg-gray-100 hover:text-green-700 focus:z-10 focus:ring-2 focus:ring-green-300 focus:outline-none";

    // Set active button style
    if (filter === "today") {
      document.getElementById("filterToday").className =
        "px-4 py-2 text-sm font-medium text-white bg-green-500 border border-green-600 rounded-l-lg hover:bg-green-600 focus:z-10 focus:ring-2 focus:ring-green-300 focus:outline-none";
    } else if (filter === "week") {
      document.getElementById("filterWeek").className =
        "px-4 py-2 text-sm font-medium text-white bg-green-500 border-t border-b border-green-600 hover:bg-green-600 focus:z-10 focus:ring-2 focus:ring-green-300 focus:outline-none";
    } else {
      document.getElementById("filterAll").className =
        "px-4 py-2 text-sm font-medium text-white bg-green-500 border border-green-600 rounded-r-lg hover:bg-green-600 focus:z-10 focus:ring-2 focus:ring-green-300 focus:outline-none";
    }
  }

  // Function to filter devices based on date
  function filterDevices(filter) {
    const deviceElements = document.querySelectorAll("#deviceList > div");

    // Set today to beginning of day (midnight)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Create tomorrow date for proper range checking
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    oneWeekAgo.setHours(0, 0, 0, 0);

    deviceElements.forEach((element) => {
      // Skip if it's the loading or error message
      if (!element.dataset.loginTime) return;

      const loginTime = new Date(element.dataset.loginTime);

      if (filter === "today") {
        // Show only if login time is between today midnight and tomorrow midnight
        element.style.display =
          loginTime >= today && loginTime < tomorrow ? "block" : "none";
      } else if (filter === "week") {
        element.style.display = loginTime >= oneWeekAgo ? "block" : "none";
      } else {
        element.style.display = "block";
      }
    });

    // Show message if no devices match the filter
    const visibleDevices = Array.from(deviceElements).filter(
      (el) => el.style.display !== "none" && el.dataset.loginTime
    );

    if (visibleDevices.length === 0) {
      deviceListContainer.innerHTML += `
        <div class="border border-gray-200 rounded-md p-4">
          <p class="text-gray-500">No devices found for the selected time period.</p>
        </div>
      `;
    }
  }

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
        <div class="border border-gray-200 rounded-md p-4 cursor-pointer">
          <p class="text-gray-500">No devices registered yet.</p>
        </div>
      `;
      return;
    }

    // Convert to array and sort by login time (newest first)
    const sortedDevices = Object.entries(devices)
      .map(([deviceId, deviceInfo]) => ({ deviceId, ...deviceInfo }))
      .sort((a, b) => {
        // Parse dates for comparison (newest first)
        return new Date(b.lastLoginAt) - new Date(a.lastLoginAt);
      });

    // Add each device to the list
    sortedDevices.forEach((deviceInfo) => {
      try {
        const deviceId = deviceInfo.deviceId;
        const lastLoginDate = new Date(deviceInfo.lastLoginAt);

        // Format date with time
        const formattedDate = lastLoginDate.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });

        // Format time separately with hours and minutes
        const formattedTime = lastLoginDate.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        });

        const deviceElement = document.createElement("div");
        // Add transition and hover effects
        deviceElement.className =
          "border border-gray-200 rounded-md p-4 mb-4 transition-all duration-200 hover:border-green-500 hover:bg-green-50";
        deviceElement.dataset.loginTime = deviceInfo.lastLoginAt;
        deviceElement.innerHTML = `
          <div class="flex justify-between items-start">
            <div>
              <h3 class="font-bold text-lg">${
                deviceInfo.manufacturer || "Unknown"
              } ${deviceInfo.model || "Device"}</h3>
              <p class="text-sm text-gray-600 mt-1">Logged in: ${formattedDate} at ${formattedTime}</p>
              <p class="text-xs text-gray-500 mt-1">OS Version: ${
                deviceInfo.osVersion || "Unknown"
              }</p>
              <p class="text-xs text-gray-500">App Version: ${
                deviceInfo.appVersion || "Unknown"
              }</p>
              <p class="text-xs text-gray-500">Device ID: ${deviceId}</p>
            </div>
            <div>
              <input 
                type="radio" 
                name="selectedDevice" 
                id="device-${deviceId}" 
                value="${deviceInfo.fcmToken}" 
                class="mr-2 device-radio"
              >
              <label for="device-${deviceId}" class="text-sm font-medium text-green-600">Select</label>
            </div>
          </div>
          <div class="mt-2">
            <p class="text-xs text-gray-500 font-semibold">FCM Token:</p>
            <p class="text-xs text-gray-500 break-all">${
              deviceInfo.fcmToken || "No token available"
            }</p>
          </div>
        `;

        // Add click event for the entire card to select the radio button
        deviceElement.addEventListener("click", function (e) {
          // Avoid triggering when clicking directly on the radio button
          if (e.target.type !== "radio") {
            const radio = this.querySelector('input[type="radio"]');
            radio.checked = true;

            // Trigger a change event to update all device card styles
            radio.dispatchEvent(new Event("change"));
          }
        });

        deviceListContainer.appendChild(deviceElement);
      } catch (error) {
        console.error(`Error rendering device ${deviceInfo.deviceId}:`, error);
      }
    });

    // After all devices are added, add event listeners to handle selection styling
    const deviceRadios = document.querySelectorAll(".device-radio");
    deviceRadios.forEach((radio) => {
      radio.addEventListener("change", function () {
        // Remove selected styles from all device cards
        document.querySelectorAll("#deviceList > div").forEach((card) => {
          card.classList.remove("border-green-500", "bg-green-50");
          card.classList.add("border-gray-200");
        });

        // Add selected styles to the parent card of the checked radio
        if (this.checked) {
          const selectedCard = this.closest("#deviceList > div");
          selectedCard.classList.remove("border-gray-200");
          selectedCard.classList.add("border-green-500", "bg-green-50");
        }
      });
    });

    // Select the first device by default
    const firstRadio = document.querySelector('input[name="selectedDevice"]');
    if (firstRadio) {
      firstRadio.checked = true;
      // Trigger change event to apply styling
      firstRadio.dispatchEvent(new Event("change"));
    }

    // Apply the default filter after loading devices
    filterDevices(currentFilter);
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
