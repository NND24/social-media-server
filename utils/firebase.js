const { initializeApp } = require("firebase/app");
const multer = require("multer");

const firebaseConfig = {
  apiKey: "AIzaSyDepkwoOOewPiAs2KR3F-e-5mdT7bFnnfk",
  authDomain: "social-media-3a38c.firebaseapp.com",
  projectId: "social-media-3a38c",
  storageBucket: "social-media-3a38c.appspot.com",
  messagingSenderId: "425470280912",
  appId: "1:425470280912:web:e6aaff25f8885d7c694ad5",
  measurementId: "G-YTQ0LYH7Y9",
};

const app = initializeApp(firebaseConfig);
const uploadToFirebase = multer({ storage: multer.memoryStorage() });

module.exports = { uploadToFirebase, app };
