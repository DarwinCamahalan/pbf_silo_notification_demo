# PBF Silo Notification Demo

## Overview
The PBF Silo Notification Demo is a web application that demonstrates how to send push notifications to a Flutter app using Firebase Cloud Messaging (FCM). This project includes a simple HTML interface styled with Tailwind CSS and utilizes Firebase for handling notifications.

## Project Structure
```
pbf_silo_notification_demo
├── src
│   ├── css
│   │   └── styles.css          # Custom styles for the application
│   ├── js
│   │   ├── firebase-config.js   # Firebase configuration and initialization
│   │   └── notification-sender.js # Logic for sending push notifications
│   └── index.html              # Main HTML file for the web application
├── public
│   ├── css
│   │   └── tailwind.css        # Compiled Tailwind CSS stylesheet
│   └── favicon.ico             # Favicon for the web application
├── tailwind.config.js          # Tailwind CSS configuration
├── postcss.config.js           # PostCSS configuration
├── package.json                # npm configuration file
└── README.md                   # Project documentation
```

## Setup Instructions

1. **Clone the Repository**
   Clone this repository to your local machine using:
   ```
   git clone <repository-url>
   ```

2. **Navigate to the Project Directory**
   ```
   cd pbf_silo_notification_demo
   ```

3. **Install Dependencies**
   Install the required npm packages:
   ```
   npm install
   ```

4. **Configure Firebase**
   Update the `src/js/firebase-config.js` file with your Firebase project configuration.

5. **Build the Project**
   Use the following command to build the project:
   ```
   npm run build
   ```

6. **Serve the Application**
   Start a local server to serve the application:
   ```
   npm start
   ```

7. **Access the Application**
   Open your web browser and navigate to `http://localhost:3000` (or the port specified in your server configuration).

## Usage
- Use the web interface to send push notifications to the Flutter app.
- Ensure that the Flutter app is running and properly configured to receive notifications.

## License
This project is licensed under the MIT License. See the LICENSE file for details.