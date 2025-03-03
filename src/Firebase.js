import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBgv2nwLsV8ZbSqI6iY-nOGjWHXoyTPBoQ",
    authDomain: "medi-ccc2d.firebaseapp.com",
    projectId: "medi-ccc2d",
    storageBucket: "medi-ccc2d.firebasestorage.app",
    messagingSenderId: "107861781991",
    appId: "1:107861781991:web:3d950616fcbb0fb14de142",
    measurementId: "G-J35730RPHF"
  };

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
