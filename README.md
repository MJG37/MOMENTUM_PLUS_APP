# **Momentum Plus: Build Momentum, Stay Focused**

Momentum Plus is a task-based rewards system mobile application built with **React Native and Expo** that helps students stay focused and reduce digital distractions through completing daily tasks. The app allows users to complete tasks, earn points, track their progress to encourage consistent study habits. Momentum Plus is designed to provide a simple, motivating and easy-to-use way for students to improve their productivity and manage their phone use.

The application is not performance-intensive and is designed to run across a wide range of modern Android and iOS devices.

## **Key Features**
* Access the app using a predetermined login account.
* Create and complete tasks to earn points.
* A task-based reward system designed to encourage productivity and reduce digital distractions.
* Track progress through the app.
* Maintain streaks to encourage consistency and continued productivity.
* A simple and intuitive interface designed with students in mind.
* Light and dark mode support.
* Responsive design intended to work across different phone screen sizes.
* Cross-platform support for Android and iOS devices.
* The application can be tested directly on a physical phone using Expo Go.
* User data and application functionality are supported by the project's Convex backend.

## **Getting Started**

### **Prerequisites**

To run this application, you need to have the following installed:

* **Node.js**: The LTS version is recommended.
* **npm**: A package manager for installing dependencies. npm is included with Node.js.
* **Git**: For cloning the Momentum Plus repository.
* **Expo Go**: The mobile application used to run and test Expo projects on a physical Android or iOS device.

You do **not** need to have the developer's GitHub, Expo, or other personal accounts logged into your computer or phone to run the project.

### **Installation & Setup**

This is a complete walkthrough on how to run Momentum Plus. First, ensure the above requirements are met. **Do not move directories until specified.**

1. **Check that Node.js and npm are installed.**

   You can use the following commands in your terminal:

   `node -v`

   `npm -v`

2. **Check that Git is installed and working.**

   You can use:

   `git --version`

3. **Open a terminal and navigate to the directory where you want to store the Momentum Plus project.**

**Clone the Repository**

Staying in the current terminal tab, run the following command to download the project:

`git clone https://github.com/MJG37/MOMENTUM_PLUS_APP.git`

The repository is public, so you do not need to sign into the developer's GitHub account to clone it.

**Navigate to the Project Directory**

Change into the project folder:

`cd MOMENTUM_PLUS_APP`

**Install Dependencies**

Install all the necessary packages for the app:

`npm install`

This will install the dependencies specified in the project's `package.json`, including React Native, Expo, Expo Router and Convex.

If `npm install` does not work, check that Node.js and npm are installed correctly and try running the command again.

**Run the Application**

Start the Expo development server:

`npx expo start`

After running this command, a QR code will appear in the terminal. Expo's current documentation recommends using a physical device for testing because it allows the application to be tested in an environment similar to what the user will experience.

### **View the App**

* **On an Android phone:** Install **Expo Go** from the Google Play Store. Open Expo Go and use the QR-code scanner to scan the QR code shown in the terminal.
* **On an iPhone:** Open the Camera app and scan the QR code. The project can then be opened through Expo Go.
* **On an Android emulator:** Press `a` in the terminal if an Android emulator has already been set up.
* **On an iOS simulator:** Press `i` in the terminal if an iOS simulator has already been set up.
* **On a web browser:** Press `w` in the terminal to open the web version. However, this is not the intended way to use Momentum Plus, and the appearance/functionality may differ from the mobile version.

Expo officially supports running Expo projects on Android, iOS and web, with Expo Go available for Android and iOS testing.

### **If the Phone Cannot Connect**

The computer and phone should normally be connected to the **same Wi-Fi network** when using the standard Expo connection.

If the phone cannot connect, try:

`npx expo start --tunnel`

Expo provides the tunnel connection as an alternative when the normal local network connection does not work, such as when the router or network configuration prevents the phone from connecting to the development server.

## **Important Notes ⚠️**

* **Login Credentials:** For this version of the app you can create any accoutn you wish

However, if any login account fails: please use THE ADMIN login credentials below:

  * **Username:** `Admin`
  * **Password:** `#Hello`

## **WHEN RESETTING YOUR PASSWORD: Authentication details for admin is as follows:**
  * **Birthday:** `1st January 2006`
  * **Born in Country:** `New Zealand`
  * **Favourite color:** `Black`

* **No Developer Accounts Required:** The teacher does not need access to the developer's personal GitHub, Expo or other accounts. The GitHub repository is public and can be cloned directly.

* **Phone Compatibility:** Momentum Plus is designed as a cross-platform React Native and Expo application for a wide range of modern Android and iOS devices. This includes Android devices from manufacturers such as Xiaomi, Samsung and Google, as well as iPhones. Exact compatibility can depend on the device's operating system version and the version of Expo Go installed.

NOTE: PLEASE MAKE SURE THAT EXPO GO version SDK54 is installed!

* **Android Phone Compatibility:** Momentum Plus can be tested on a Android phone through Expo Go. Please install Expo Go on your device and scan the QR code generated by `npx expo start`.

* **Dark Mode:** Momentum Plus supports both light and dark mode. The application is configured to automatically respond to the device's interface style.

* **Orientation:** Momentum Plus is ONLY designed for portrait orientation in this version.

* **Internet Connection:** An internet connection is required to install the project dependencies and connect the phone to the Expo development server. The phone and computer should normally be connected to the same Wi-Fi network when using the standard connection method.

* **Expo Go:** Expo Go is being used to test the application during development. Expo describes Expo Go as a tool for students and learners to quickly test Expo projects on Android and iOS devices.

* **Expo SDK:** This project currently uses **Expo SDK 54**. The installed Expo version is specified in the project's `package.json`.

* **Project Backend:** The application uses Convex for backend functionality, with the required Convex dependencies included in the project.

## **Troubleshooting & FAQ ❓**

* **`npm install` fails:** This could be caused by network issues, an outdated Node.js installation, or a problem installing one of the project dependencies. Check that Node.js and npm are installed correctly, then try running `npm install` again.

* **The app does not load on the EMULATOR phone:** In the same terminal where Expo Go is deployed, press r
<img width="1045" height="932" alt="image" src="https://github.com/user-attachments/assets/f8e39258-7a3b-4be4-80c2-6cab450539c1" />

* **The app does not load on the phone:** Ensure that the computer and phone are connected to the **same Wi-Fi network** and that Expo Go is installed on the phone.

* **The QR code does not work:** Make sure Expo Go is open and that the QR code is being scanned correctly. If the standard connection does not work, try:

  `npx expo start --tunnel`

* **Can't find the QR code:** Scroll up in the terminal to find the output from the `npx expo start` command.

* **Phone cannot connect:** Ensure Expo Go is installed on your phone and that both the phone and computer are connected to the SAME Wi-Fi network. If this still does not work, try the tunnel command shown above.

   **NOTE** IF USING A PHYSICAL ANDROID/IOS PHONE: My app and expo go WILL NOT be able to work on the EGGS SCHOOL WIFI (eduroam) as the adminstrator permissions block users from entering the app output! So instead switch to another PRIVATE Wifi network or connect both your laptop/computer and physical phone/phone emulator to mobile data hotspot.

* **The project says it is incompatible with Expo Go:** The version of Expo Go must support the Expo SDK version used by the project. Expo notes that projects using an unsupported SDK version can display an incompatibility error. If this occurs, the project's Expo SDK may need to be updated or the appropriate compatible Expo Go version may need to be used.

* **The app looks slightly different on another phone:** Differences in screen sizes, Android/iOS versions and system UI can cause small visual differences. Momentum Plus is designed to be responsive and cross-platform, but exact rendering can vary between devices.

* **Login does not work:** Make sure the credentials are entered exactly as follows:

  * **Username:** `Admin`
  * **Password:** `#Hello`

  **//WHEN RESETTING YOUR PASSWORD: Authentication details for admin is as follows:**
  * **Birthday:** `1st January 2006`
  * **Born in Country:** `New Zealand`
  * **Favourite color:** `Black`

## **Repository**

The complete Momentum Plus project can be accessed through the following public GitHub repository:

`https://github.com/MJG37/MOMENTUM_PLUS_APP`

The repository contains the application's source code, assets, configuration files and dependencies required to run the project.
