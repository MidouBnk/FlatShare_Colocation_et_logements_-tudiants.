import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBN-AUO6jqH5V7aJb_T5_1o9tQ9wpPzFtM",
  authDomain: "m2sid-5ea14.firebaseapp.com",
  projectId: "m2sid-5ea14",
  storageBucket: "m2sid-5ea14.appspot.com",
  messagingSenderId: "276432212196",
  appId: "1:276432212196:web:8a80c12dab4aca38ba1cf1"
};

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
