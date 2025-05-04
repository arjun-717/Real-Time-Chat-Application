import React, { useContext, useEffect, useState } from 'react'
import './ChatBar.css'
import assets from '../../assets/assets'
import { AppContext } from '../../context/AppContext'
import { arrayUnion, doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore'
import { db } from '../../config/Firebase'
import { toast } from 'react-toastify'

const ChatBar = () => {
    const {
        messages, setMessages,
        userData, messagesId, ChatUser,
        chatVisible, setChatVisible,
        setChatUser, setMessagesID,
        HandleRightNav
    } = useContext(AppContext);

    const [input, setInput] = useState("");
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    // Track screen width for responsive logic
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Persist ChatUser and messagesId
    useEffect(() => {
        if (ChatUser && messagesId) {
            localStorage.setItem("chatUser", JSON.stringify(ChatUser));
            localStorage.setItem("messagesId", messagesId);
        }
    }, [ChatUser, messagesId]);

    // ✅ Restore ChatUser and messagesId only if Firestore document exists
    useEffect(() => {
        const restoreChat = async () => {
            const storedUser = localStorage.getItem("chatUser");
            const storedMessagesId = localStorage.getItem("messagesId");

            if (storedUser && storedMessagesId) {
                const messageDoc = await getDoc(doc(db, 'messages', storedMessagesId));
                if (messageDoc.exists()) {
                    setChatUser(JSON.parse(storedUser));
                    setMessagesID(storedMessagesId);
                } else {
                    // 🔥 Clear invalid local storage
                    localStorage.removeItem("chatUser");
                    localStorage.removeItem("messagesId");
                    setChatUser(null);
                    setMessagesID(null);
                }
            }
        };
        restoreChat();
    }, []);

    const sendMessage = async () => {
        try {
            if (input && messagesId) {
                await updateDoc(doc(db, 'messages', messagesId), {
                    messages: arrayUnion({
                        sID: userData.id,
                        text: input,
                        createdAt: new Date()
                    })
                });
                setInput("");

                const userIDs = [ChatUser.rID, userData.id];
                userIDs.forEach(async (id) => {
                    const userChatRef = doc(db, 'chats', id);
                    const userChatsSnapshot = await getDoc(userChatRef);
                    if (userChatsSnapshot.exists()) {
                        const userChatData = userChatsSnapshot.data();
                        const chatIndex = userChatData.chatsData.findIndex((c) => c.messageId === messagesId);
                        userChatData.chatsData[chatIndex].lastMessage = input.slice(0, 30);
                        userChatData.chatsData[chatIndex].updatedAt = Date.now();

                        if (userChatData.chatsData[chatIndex].rID === userData.id) {
                            userChatData.chatsData[chatIndex].messageSeen = false;
                        }

                        await updateDoc(userChatRef, {
                            chatsData: userChatData.chatsData
                        });
                    }
                });
            }
        } catch (error) {
            console.error("Send message error:", error);
        }
    };

    const sendImage = () => {
        toast.info("This feature is not available yet.");
    };

    const ConvertTimeStamp = (timestamp) => {
        // Ensure that timestamp is a Firestore Timestamp object
        let date = timestamp instanceof Date ? timestamp : timestamp.toDate();
        
        const hr = date.getHours();
        const mins = date.getMinutes().toString().padStart(2, '0');
        
        // Convert to 12-hour format
        const period = hr >= 12 ? 'PM' : 'AM';
        const hour = hr > 12 ? hr - 12 : hr;
        
        return `${hour}:${mins} ${period}`;
    };
    

    // ✅ Safe listener for message updates
    useEffect(() => {
        if (messagesId) {
            const unSub = onSnapshot(doc(db, 'messages', messagesId), (res) => {
                const data = res.data();
                if (data && data.messages) {
                    setMessages(data.messages.reverse());
                } else {
                    setMessages([]);
                }
            });
            return () => {
                unSub();
            };
        }
    }, [messagesId]);

    return ChatUser ? (
        <div className={`chatbox ${chatVisible ? "" : "hidden"}`}>
            <div className="chat-user">
                <img src={assets.profile_img} alt="" />
                <p>
                    {ChatUser.userData.name}
                    {Date.now() - ChatUser.userData.lastSeen <= 70000 && (
                        <img src={assets.green_dot} className='dot' alt="" />
                    )}
                </p>
                <img src={assets.help_icon} alt="" className='help-icon' onClick={HandleRightNav} />
                <img src={assets.arrow_icon} alt="" onClick={() => setChatVisible(false)} className='arrow-icon' />
            </div>

            <div className="chat-msg">
                {messages.map((msg, index) => (
                    <div key={index} className={msg.sID === userData.id ? "s-msg" : "r-msg"}>
                        <p className='msg'>{msg.text}</p>
                        <div>
                            <img src={assets.profile_img} alt="" />
                            <p>{ConvertTimeStamp(msg.createdAt)}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="chat-input">
                <input
                    onChange={(e) => setInput(e.target.value)}
                    type="text"
                    value={input}
                    placeholder='Send a message'
                />
                <div onClick={sendImage}>
                    <img src={assets.gallery_icon} alt="" className='gal-icon' />
                </div>
                <img onClick={sendMessage} src={assets.send_button} alt="" className='send-btn' />
            </div>
        </div>
    ) : (
        !isMobile && (
            <div className={`chat-welcome ${chatVisible ? "" : "hidden"}`}>
                <img src={assets.logo_icon} alt="" />
                <p>Welcome to QuickChat</p>
                <p className='note'>Chat Anytime, AnyWhere</p>
            </div>
        )
    );
};

export default ChatBar;
