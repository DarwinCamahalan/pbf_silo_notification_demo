/**
 * Handles toggling between manual and automatic notification modes
 */
function setupNotificationToggle() {
  // Get the radio buttons and containers
  const manualRadio = document.getElementById("enableManual");
  const autoRadio = document.getElementById("enableAuto");
  const manualContainer = document.getElementById(
    "manualNotificationContainer"
  );
  const autoContainer = document.querySelector(
    ".flex.flex-col.border.border-green-600.bg-green-50.rounded-lg:not(#manualNotificationContainer)"
  );

  // Give the auto container an ID for easier reference
  if (autoContainer && !autoContainer.id) {
    autoContainer.id = "autoNotificationContainer";
  }

  // Function to enable manual mode
  function enableManualMode() {
    // Highlight manual container, dim auto container
    manualContainer.classList.add("border-green-600", "bg-green-50");
    manualContainer.classList.remove(
      "border-gray-300",
      "bg-gray-100",
      "opacity-60"
    );

    autoContainer.classList.remove("border-green-600", "bg-green-50");
    autoContainer.classList.add("border-gray-300", "bg-gray-100", "opacity-60");

    // Enable manual controls, disable auto controls
    enableFormElements(manualContainer, true);
    enableFormElements(autoContainer, false);
  }

  // Function to enable auto mode
  function enableAutoMode() {
    // Highlight auto container, dim manual container
    autoContainer.classList.add("border-green-600", "bg-green-50");
    autoContainer.classList.remove(
      "border-gray-300",
      "bg-gray-100",
      "opacity-60"
    );

    manualContainer.classList.remove("border-green-600", "bg-green-50");
    manualContainer.classList.add(
      "border-gray-300",
      "bg-gray-100",
      "opacity-60"
    );

    // Enable auto controls, disable manual controls
    enableFormElements(autoContainer, true);
    enableFormElements(manualContainer, false);
  }

  // Helper function to enable/disable form elements within a container
  function enableFormElements(container, enable) {
    const inputs = container.querySelectorAll(
      "input:not([type=radio]), textarea, button, select"
    );
    const slider = container.querySelector("#siloSlider");

    inputs.forEach((input) => {
      input.disabled = !enable;
      if (enable) {
        input.classList.remove("opacity-50", "cursor-not-allowed");
      } else {
        input.classList.add("opacity-50", "cursor-not-allowed");
      }
    });

    // Special handling for the silo slider
    if (slider) {
      if (enable) {
        slider.style.pointerEvents = "auto";
        slider.classList.remove("opacity-50");
      } else {
        slider.style.pointerEvents = "none";
        slider.classList.add("opacity-50");
      }
    }
  }

  // Add event listeners to the radio buttons
  manualRadio.addEventListener("change", function () {
    if (this.checked) {
      enableManualMode();
    }
  });

  autoRadio.addEventListener("change", function () {
    if (this.checked) {
      enableAutoMode();
    }
  });

  // Initial setup based on which radio is checked
  if (manualRadio.checked) {
    enableManualMode();
  } else if (autoRadio.checked) {
    enableAutoMode();
  } else {
    // Default to manual if neither is checked
    manualRadio.checked = true;
    enableManualMode();
  }

  // Setup automatic notifications when silo reaches critical levels
  setupAutomaticNotifications();
}

/**
 * Sets up automatic notifications when silo levels reach critical thresholds
 */
function setupAutomaticNotifications() {
  const siloSlider = document.getElementById("siloSlider");
  const autoRadio = document.getElementById("enableAuto");
  let lastNotificationLevel = null;

  // Function to send notification if level is critical
  function checkCriticalLevel(level) {
    // Only proceed if auto mode is enabled
    if (!autoRadio.checked) return;

    // Create messages for critical levels
    let title = "PBF Silo Notification";
    let message = "";

    if (
      level <= 10 &&
      (lastNotificationLevel === null || lastNotificationLevel > 10)
    ) {
      message = `ALERT: Silo level is critically low at ${level}%! Immediate refill required.`;
    } else if (
      level >= 90 &&
      (lastNotificationLevel === null || lastNotificationLevel < 90)
    ) {
      message = `NOTICE: Silo level is very high at ${level}%. Approaching maximum capacity.`;
    }

    // Send notification if we have a message
    if (message && typeof window.sendNotificationToAll === "function") {
      window.sendNotificationToAll(title, message);
      showToast(message, level <= 10 ? "error" : "warning");
    }

    // Update last level
    lastNotificationLevel = level;
  }

  // Function to show toast notifications
  function showToast(message, type = "info") {
    const toast = document.createElement("div");
    const toastContainer = document.getElementById("toastContainer");

    // Set toast style based on type
    let bgColor = "bg-blue-500";
    if (type === "error") bgColor = "bg-red-500";
    if (type === "warning") bgColor = "bg-yellow-500";
    if (type === "success") bgColor = "bg-green-500";

    toast.className = `${bgColor} text-white px-4 py-3 rounded shadow-md mb-2`;
    toast.textContent = message;

    // Add toast to container
    toastContainer.appendChild(toast);

    // Remove after 5 seconds
    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transition = "opacity 0.5s";
      setTimeout(() => {
        if (toastContainer.contains(toast)) {
          toastContainer.removeChild(toast);
        }
      }, 500);
    }, 5000);
  }

  // Listen for slider changes
  siloSlider.addEventListener("input", function () {
    checkCriticalLevel(parseInt(this.value));
  });

  // Listen for radio button changes
  autoRadio.addEventListener("change", function () {
    if (this.checked) {
      // Check current level when switching to auto mode
      checkCriticalLevel(parseInt(siloSlider.value));
    }
  });
}

// Initialize when DOM content is loaded
document.addEventListener("DOMContentLoaded", setupNotificationToggle);
