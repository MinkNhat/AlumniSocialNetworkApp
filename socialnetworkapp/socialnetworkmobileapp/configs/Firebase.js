// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage";
import { getFirestore, collection, addDoc, onSnapshot, query, where, orderBy, serverTimestamp } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBfHmVVumUTRsbqCPKkmX9U60NH6EVDuzw",
  authDomain: "alumnisocialnetworking.firebaseapp.com",
  projectId: "alumnisocialnetworking",
  storageBucket: "alumnisocialnetworking.firebasestorage.app",
  messagingSenderId: "387551554112",
  appId: "1:387551554112:web:df8b2605d0a48a42034da5",
  measurementId: "G-X1GN26G43F"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { db, storage, collection, addDoc, onSnapshot, query, where, orderBy, serverTimestamp };