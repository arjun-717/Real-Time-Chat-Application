// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getFirestore ,setDoc,doc } from "firebase/firestore/lite";
import { getFirestore, setDoc, doc, getDoc, collection, query, where, getDocs } from "firebase/firestore"; // Full Firestore

import { createUserWithEmailAndPassword, getAuth, sendPasswordResetEmail, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { toast } from "react-toastify";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD4cm6d0l2Sm9GKfRMiZ-V8z5j73piWTrY",
  authDomain: "chat-application-ebd17.firebaseapp.com",
  projectId: "chat-application-ebd17",
  storageBucket: "chat-application-ebd17.firebasestorage.app",
  messagingSenderId: "810232419887",
  appId: "1:810232419887:web:5fa6d59a6ccfd9019ed8da"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const Auth = getAuth(app);
const db = getFirestore(app);

const signup = async(username,email,password)=>{
    try {
        const res = await createUserWithEmailAndPassword(Auth,email,password);
        const user = res.user;

        await setDoc(doc(db,"users",user.uid),{
            id : user.uid,
            username : username.toLowerCase(),
            email,
            name:"",
            avatar:"",
            bio:"Hi, There welcome to QuickChat",
            lastSeen : Date.now()
        })

        await setDoc(doc(db,"chats",user.uid),{
            chatsData :[]
        })
    } catch (error) {
        console.error(error);
        toast.error(error.code.split('/')[1].split('-').join(" "));
    }
}

const login = async(email,password)=>{
    try {
        await signInWithEmailAndPassword(Auth,email,password);
    } catch (error) {
        console.error(error);
        toast.error(error.code.split('/')[1].split('-').join(" "));
    }
}

const logout = async ()=>{
    try {
        await signOut(Auth);
    } catch (error) {
        console.error(error);
        toast.error(error.code.split('/')[1].split('-').join(" "));
    }



}

const ResetPass = async (email) =>{
    if(!email){
        toast.error("Enter Email address");
        return null;
    }
   try {
    const UserRef = collection(db,'users');
    const q = query(UserRef,where("email","==",email));
    const querySnap = await getDocs(q);
    if(!querySnap.empty){
        await sendPasswordResetEmail(Auth,email);
        toast.success("Password Reset mail sent");
    }
    else{
        toast.error("Email doesn't exixts");
    }
   } catch (error) {
        console.error(error);
        toast.error(error.message);
   }
}
export {login,signup,logout,db,Auth,ResetPass};