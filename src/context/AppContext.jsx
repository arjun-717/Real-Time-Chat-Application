import { createContext, useEffect, useState } from "react";
import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { Auth, db } from "../config/Firebase";
import { useNavigate } from "react-router-dom";

export const AppContext = createContext();

export const AppContextProvider = (props) => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [chatData, setChatData] = useState(null);


  const [messagesId,setMessagesID] = useState(null);
  const [messages,setMessages] = useState([]);
  const [ChatUser,setChatUser ] = useState(null);

  const[chatVisible,setChatVisible] = useState(false);


  const loadUserData = async (uid) => {
    const UserRef = doc(db, "users", uid);
    const UserSnap = await getDoc(UserRef);
    const userData = UserSnap.data();
    setUserData(userData);
    // if(userData.avatar && userData.name){
    if (userData.name && userData.bio) {
      navigate("/chat");
    } else {
      navigate("/profile");
    }
    await updateDoc(UserRef, {
      lastSeen: Date.now(),
    });
    //need to check

    // setInterval(async () => {
    //     if(Auth.chatUser){
    //         await updateDoc(UserRef,{
    //             lastSeen : Date.now()
    //         })
    //     }
    // }, 60000);

    setInterval(async () => {
      if (Auth.currentUser) {
        // Correct check: Check if there's a logged-in user
        const UserRef = doc(db, "users", Auth.currentUser.uid); // Use the current user's UID
        await updateDoc(UserRef, {
          lastSeen: Date.now(),
        });
      }
    }, 60000); // Run every 60 seconds
  };
  useEffect(()=>{
    if(userData){
        const chatRef = doc(db,'chats',userData.id);
        const unSub = onSnapshot(chatRef,async(res)=>{
            const chatItems = res.data().chatsData;
            const TempData =[];
            for (const item of chatItems){
                const rID = item.rID; // <-- Add this line
                const userRef = doc(db, 'users', rID); //rID - receiver id it creates when chat are created
                const userSnap = await getDoc(userRef);
                const userData = userSnap.data();
                // TempData.push([{...item,userData}]);
                TempData.push({ ...item, userData }); // ✅ No extra array

            }
            setChatData(TempData.sort((a,b)=>b.updatedAt - a.updatedAt ));
        })
        return ()=>{
            unSub();
        }
    }
  },[userData])
  const value = {
    userData,
    setUserData,
    chatData,
    setChatData,
    loadUserData,
    messages,setMessages,
    messagesId,setMessagesID,
    ChatUser,setChatUser,
    chatVisible,setChatVisible
  };
  return (
    <AppContext.Provider value={value}>{props.children}</AppContext.Provider>
  );
};

export default AppContextProvider;
