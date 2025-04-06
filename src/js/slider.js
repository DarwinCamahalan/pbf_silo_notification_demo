/**
 * Updates the silo level visualization based on the slider value
 * @param {number} value - The value from the slider (0-100)
 */
function updateSiloLevel(value) {
  const siloFill = document.getElementById("siloFill");
  const siloLevel = document.getElementById("siloLevel");

  // Update the fill height and text
  siloFill.style.height = value + "%";
  siloLevel.textContent = value + "%";

  // Change text color based on value for better visibility
  if (value < 53) {
    siloLevel.style.color = "black"; // Lower levels use black text
  } else {
    siloLevel.style.color = "white"; // Higher levels use white text
  }

  // Update notification body based on silo level
  updateNotificationBody(value);
}

/**
 * Updates the notification body text based on silo level
 * @param {number} value - The silo level (0-100)
 */
function updateNotificationBody(value) {
  const notificationBody = document.getElementById("notificationBody");

  let message = "This is a test notification from the web app!";

  if (value <= 20) {
    message =
      "ALERT: Silo level is critically low at " +
      value +
      "%! Immediate refill required.";
  } else if (value <= 40) {
    message =
      "WARNING: Silo level is low at " +
      value +
      "%. Please schedule a refill soon.";
  } else if (value >= 90) {
    message =
      "NOTICE: Silo level is very high at " +
      value +
      "%. Approaching maximum capacity.";
  }

  notificationBody.value = message;
}

/**
 * Initializes the silo slider functionality
 */
function initSiloSlider() {
  const slider = document.getElementById("siloSlider");

  // Set initial value to start near bottom
  slider.value = 50;

  // Update silo display based on slider value
  updateSiloLevel(slider.value);

  // Listen for changes
  slider.addEventListener("input", (e) => {
    updateSiloLevel(e.target.value);
  });

  // Add custom slider styles
  addCustomSliderStyles();
}

/**
 * Adds custom CSS for better slider appearance
 */
function addCustomSliderStyles() {
  // Remove any existing style to prevent duplication
  const existingStyle = document.getElementById("silo-slider-styles");
  if (existingStyle) {
    existingStyle.remove();
  }

  // Create new style element with ID
  const style = document.createElement("style");
  style.id = "silo-slider-styles";
  style.textContent = `
    /* Force white thumb color */
    input[type=range]#siloSlider::-webkit-slider-thumb {
      -webkit-appearance: none !important;
      appearance: none !important;
      width: 20px !important;
      height: 20px !important;
      border-radius: 15% !important;
      background-color: white !important;
      border: 1px solid #000 !important;
      cursor: pointer !important;

    }
    
    input[type=range]#siloSlider::-moz-range-thumb {
      width: 20px !important;
      height: 20px !important;
      border-radius: 50% !important;
      background-color: white !important;
      border: 2px solid #d1d5db !important;
      cursor: pointer !important;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3) !important;
    }
    
    /* Ensure track has gradient */
    input[type=range]#siloSlider::-webkit-slider-runnable-track {
      height: 8px !important;
      border-radius: 4px !important;
      background: linear-gradient(to top, #22c55e, #facc15, #dc2626) !important;
    }
    
    input[type=range]#siloSlider::-moz-range-track {
      height: 8px !important;
      border-radius: 4px !important;
      background: linear-gradient(to top, #22c55e, #facc15, #dc2626) !important;
    }
    
    /* Override any browser default styles */
    input[type=range]#siloSlider {
      appearance: none !important;
      -webkit-appearance: none !important;
      background: transparent !important;
      accent-color: white !important;
    }
  `;
  document.head.appendChild(style);

  // Also apply direct styling to the element
  const slider = document.getElementById("siloSlider");
  if (slider) {
    // Directly set CSS custom properties
    slider.style.accentColor = "white";
    slider.style.setProperty("--thumb-color", "white", "important");
  }
}

// Initialize slider when DOM is loaded
document.addEventListener("DOMContentLoaded", initSiloSlider);
