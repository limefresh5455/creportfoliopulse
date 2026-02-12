// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA5-4YvNiUJLsQxVkY1nYrB2IT01Jc-faI",
  authDomain: "portfolio-forum-723df.firebaseapp.com",
  projectId: "portfolio-forum-723df",
  storageBucket: "portfolio-forum-723df.firebasestorage.app",
  messagingSenderId: "151602026978",
  appId: "1:151602026978:web:33e89a3fcbbce1a07c41bb",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { app, db };
