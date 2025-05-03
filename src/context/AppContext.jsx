import { createContext, useEffect, useState } from "react";
import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { Auth, db } from "../config/Firebase";
import { useNavigate } from "react-router-dom";

export const AppContext = createContext();

export const AppContextProvider = (props) => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [chatData, setChatData] = useState(null);

  const [messagesId, setMessagesID] = useState(null);
  const [messages, setMessages] = useState([]);
  const [ChatUser, setChatUser] = useState(null);

  const [chatVisible, setChatVisible] = useState(false);

  const [Rnav, setRnav] = useState(false);

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

    setInterval(async () => {
      if (Auth.currentUser) {
        const UserRef = doc(db, "users", Auth.currentUser.uid); // Use the current user's UID
        await updateDoc(UserRef, {
          lastSeen: Date.now(),
        });
      }
    }, 60000); // Run every 60 seconds
  };

  useEffect(() => {
    if (userData) {
      const chatRef = doc(db, 'chats', userData.id);
      const unSub = onSnapshot(chatRef, async (res) => {
        const data = res.data();
        if (data && data.chatsData) { // Check if data and chatsData exist
          const chatItems = data.chatsData;
          const TempData = [];
          for (const item of chatItems) {
            const rID = item.rID; // <-- Add this line
            const userRef = doc(db, 'users', rID); // rID - receiver id it creates when chats are created
            const userSnap = await getDoc(userRef);
            const userData = userSnap.data();
            TempData.push({ ...item, userData }); // ✅ No extra array
          }
          setChatData(TempData.sort((a, b) => b.updatedAt - a.updatedAt));
        } else {
          // Handle the case where there is no chatsData or data is undefined
          console.log('No chatsData available or data is undefined');
        }
      });

      return () => {
        unSub();
      };
    }
  }, [userData]);

  const HandleRightNav = () => {
    setRnav(true);
  };

  const HandleCloseRightNav = () => {
    setRnav(false);
  };

  const value = {
    userData,
    setUserData,
    chatData,
    setChatData,
    loadUserData,
    messages, setMessages,
    messagesId, setMessagesID,
    ChatUser, setChatUser,
    chatVisible, setChatVisible,
    Rnav, setRnav,
    HandleRightNav,
    HandleCloseRightNav
  };

  return (
    <AppContext.Provider value={value}>{props.children}</AppContext.Provider>
  );
};

export default AppContextProvider;
