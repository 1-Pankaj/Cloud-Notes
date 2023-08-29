import firebase from "firebase/compat/app";
import 'firebase/compat/auth'
import 'firebase/compat/storage'
import 'firebase/compat/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyDuGjNmph3iWWIGNNTR0wmsnPqwMZL7t_A",
  authDomain: "cloudnotes-android.firebaseapp.com",
  projectId: "cloudnotes-android",
  storageBucket: "cloudnotes-android.appspot.com",
  messagingSenderId: "29670230722",
  appId: "1:29670230722:web:97813b86e44d74d3ae495b"
};

if(!firebase.apps.length){
    firebase.initializeApp(firebaseConfig)
}

export {firebase};