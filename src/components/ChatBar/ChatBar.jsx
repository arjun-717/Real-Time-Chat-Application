import React, { useContext, useEffect, useState } from 'react'
import './ChatBar.css'
import assets from '../../assets/assets'
import { AppContext } from '../../context/AppContext'
import { arrayUnion, doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore'
import { db } from '../../config/Firebase'
import { toast } from 'react-toastify'

const ChatBar = () => {

    const {messages,setMessages, userData, messagesId,ChatUser,chatVisible,setChatVisible} = useContext(AppContext);

    //for getting send msg
    const [input,setInput] = useState("");
    
    const sendMessage = async ()=>{
        try {
            if(input && messagesId){
                await updateDoc(doc(db,'messages',messagesId),{
                    messages:arrayUnion({
                        sID: userData.id,
                        text:input,
                        createdAt:new Date()
                    })
                })
                setInput("");
                //GET SENDER AND RECEIVER ID'S
                const userIDs = [ChatUser.rID,userData.id];

                userIDs.forEach(async(id)=>{
                    const userChatRef = doc(db,'chats',id);
                    const userChatsSnapshot = await getDoc(userChatRef);

                    if(userChatsSnapshot.exists()){
                        const userChatData = userChatsSnapshot.data();
                        const chatIndex = userChatData.chatsData.findIndex((c)=>c.messageId === messagesId);
                        userChatData.chatsData[chatIndex].lastMessage =input.slice(0,30);
                        userChatData.chatsData[chatIndex].updatedAt = Date.now();

                        if( userChatData.chatsData[chatIndex].rID === userData.id){
                            userChatData.chatsData[chatIndex].messageSeen=false;
                        }
                        await updateDoc(userChatRef,{
                            chatsData:userChatData.chatsData
                        })
                    }
                })

            }
         
        } catch (error) {
            
        }

     
    }

    const sendImage = ()=>{
        toast.info("This feature is not available yet.");
    }

    //convert TimeStamp
    const ConvertTimeStamp =(timestamp)=>{
        let date = timestamp.toDate();
        const hr = date.getHours();
        // const mins = date.getMinutes();
        const mins = date.getMinutes().toString().padStart(2, '0'); //padstart(alteast, what u add)

        if(hr>12){
            return hr-12 + ":" + mins + " PM";
        }
        else{
            return hr + ":" + mins + " AM";
        }
    }

    //reload msg in each user chat logic

    useEffect(()=>{
        if(messagesId){
            const unSub = onSnapshot(doc(db,'messages',messagesId),(res)=>{
                setMessages(res.data().messages.reverse());
                // console.log(res.data().messages.reverse())
            })
            return ()=>{
                unSub();
            }
        }
       
    },[messagesId])


    return ChatUser? (
        <div className={`chatbox ${chatVisible? "":"hidden"}`}>
            <div className="chat-user">
                <img src={assets.profile_img} alt="" />
                <p> {ChatUser.userData.name} {Date.now() - ChatUser.userData.lastSeen <= 70000 ? <img src={assets.green_dot} className='dot' alt="" />:null}</p>
                <img src={assets.help_icon} alt="" className='help-icon' />
                <img src={assets.arrow_icon} alt="" onClick={()=>setChatVisible(false)} className='arrow-icon' />
            </div>



            <div className="chat-msg">
                {
                    messages.map((msg,index)=> (
                        <div key={index} className={msg.sID === userData.id ? "s-msg" : "r-msg"}>
                        <p className='msg'>{msg.text}</p>
                        <div>
                            <img src={assets.profile_img} alt="" />
                            <p>{ConvertTimeStamp(msg.createdAt)}</p>
                        </div>
                    </div>
                    )
                       
                    )
                }
          
                {/* <div className="s-msg">
                    <img src={assets.pic1} alt="" className='img-msg' />
                    <div>
                        <img src={assets.profile_img} alt="" />
                        <p>2.30 pm</p>
                    </div>
                </div>
                <div className="r-msg">
                    <p className='msg'>Reveriver dolor, adipisicing elit. Quasi, illum!</p>
                    <div>
                        <img src={assets.profile_img} alt="" />
                        <p>2.30 pm</p>
                    </div>
                </div> */}
            </div>




            <div className="chat-input">
                <input onChange={(e)=>setInput(e.target.value)} type="text"  value={input} placeholder='Send a message' />
                {/* <input onClick={sendImage}  type="file" id='image' accept='image/png,image.jpeg' hidden/>
                <label htmlFor='image'>
                    <img   src={assets.gallery_icon} alt="" />
                </label> */}
                <div onClick={sendImage}>
                    <img src={assets.gallery_icon} alt="" />
                </div>
                <img onClick={sendMessage} src={assets.send_button} alt="" className='send-btn'/>
            </div>
        </div>
    ):
    <div className={`chat-welcome ${chatVisible? "":"hidden"}`}>
        <img src={assets.logo_icon} alt="" />
        <p>Welcome to QuickChat</p>
        <p className='note'>Chat Anytime, AnyWhere</p>
    </div>
}

export default ChatBar