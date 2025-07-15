// src/firebase.js

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";


// Your Firebase config—paste your own values here
const firebaseConfig = {
  apiKey: "AIzaSyBJ3a2Z__yblE1j6gDLWghaP7bW0yAMovg",
  authDomain: "valensc-chat.firebaseapp.com",
  projectId: "valensc-chat",
  storageBucket: "valensc-chat.firebasestorage.app",
  messagingSenderId: "557816724150",
  appId: "1:557816724150:web:52ea33e37cfefe8078c417"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Init and export Auth and Firestore
export const auth = getAuth(app);
export const db   = getFirestore(app);

// Automatically sign in anonymously
signInAnonymously(auth).catch(console.error);

// Optional: expose a promise that resolves when auth is ready
export const authReady = new Promise((resolve) => {
  const unsub = onAuthStateChanged(auth, (user) => {
    if (user) {
      unsub();
      resolve(user);
    }
  });
});




// // Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// // TODO: Add SDKs for Firebase products that you want to use
// // https://firebase.google.com/docs/web/setup#available-libraries

// // Your web app's Firebase configuration
// const firebaseConfig = {
//   apiKey: "AIzaSyBJ3a2Z__yblE1j6gDLWghaP7bW0yAMovg",
//   authDomain: "valensc-chat.firebaseapp.com",
//   projectId: "valensc-chat",
//   storageBucket: "valensc-chat.firebasestorage.app",
//   messagingSenderId: "557816724150",
//   appId: "1:557816724150:web:52ea33e37cfefe8078c417"
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);