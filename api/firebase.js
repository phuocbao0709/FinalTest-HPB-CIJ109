// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCLLWD-k6sHHX50KsZEejWZUKSNDgoa070",
  authDomain: "finaltest-cij109.firebaseapp.com",
  projectId: "finaltest-cij109",
  storageBucket: "finaltest-cij109.firebasestorage.app",
  messagingSenderId: "605787236855",
  appId: "1:605787236855:web:d070d0ab8e42a8859266f2",
  measurementId: "G-6B4QDJ0F1M",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
