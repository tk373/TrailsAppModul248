import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"
import { GoogleAuthProvider, getAuth } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "",
  authDomain: "m248-projekt.firebaseapp.com",
  projectId: "m248-projekt",
  storageBucket: "m248-projekt.appspot.com",
  messagingSenderId: "234538111854",
  appId: "1:234538111854:web:bcc854a1c77f323bfca77f",
  measurementId: "G-NSH5N7MTMR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app)
const storage = getStorage()
const auth = getAuth(app);
const googleAuthProvider = new GoogleAuthProvider()


export { db, auth, googleAuthProvider, storage }



