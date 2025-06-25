// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import {getFirestore} from 'firebase/firestore'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA4JeUzO5YBvqlumNmZLMnb33puHhNZQRI",
  authDomain: "vmo-v1.firebaseapp.com",
  projectId: "vmo-v1",
  storageBucket: "vmo-v1.appspot.com",
  messagingSenderId: "70890371545",
  appId: "1:70890371545:web:9b1aa7d09e8f84160901c8",
  measurementId: "G-834EQPGVRN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Autenticação
const auth = getAuth(app)
const googleProvider = new GoogleAuthProvider()
// Firestore
const db = getFirestore(app)
// Analitics
// const analytics = getAnalytics(app); --> Colocar só quando for usar

export { db, auth, googleProvider }