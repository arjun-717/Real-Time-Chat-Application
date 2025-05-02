import React, { useContext, useState,useEffect, useRef } from 'react'
import './LeftBar.css'
import assets from '../../assets/assets'
import { useNavigate } from 'react-router-dom'
import { db, logout } from '../../config/Firebase'
import { arrayUnion, collection, doc, getDoc, getDocs, query, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore'
import { AppContext } from '../../context/AppContext'
import { toast } from 'react-toastify'

const LeftBar = () => {
  const navigate = useNavigate();
  const {userData,chatData, setMessagesID,setChatUser,messagesId,chatVisible,setChatVisible,ChatUser} = useContext(AppContext);
  const [user,setUser] = useState(null);
  const [showSearch,setshowSearch] = useState(false);
  //searching logic
  const inputHandler = async (event)=>{
    try {
      const input = event.target.value;
      if(input){
        setshowSearch(true);
        const userRef = collection(db,'users');
        const q = query(userRef,where("username","==",input.toLowerCase()));
        const querySnap = await getDocs(q);
        if(!querySnap.empty && querySnap.docs[0].data().id !== userData.id){
          // console.log(querySnap.docs[0].data());
          // console.log("--------------------------------------");
          let userExist = false;
          chatData.map((user)=>{
            if(user.rID === querySnap.docs[0].data().id){
              userExist = true;
            }
          })
          if(!userExist){
            setUser(querySnap.docs[0].data());
          }
        }
        else{
          setUser(null)
        }
      }
      else{
        setshowSearch(false);
      }
    
    } catch (error) {
      console.log(error);
    }
  }

  // make connection btw 2 users when they are in chat

  const addChat = async ()=>{
    const messagesRef = collection(db,"messages");
    const chatRef = collection(db,"chats");
    try {
      const newMessagesRef = doc(messagesRef);
      
     

      await setDoc(newMessagesRef,{
        createdAt : serverTimestamp(),
        messages :[]
      })


      await updateDoc(doc(chatRef,user.id),{
        chatsData : arrayUnion({
          messageId:newMessagesRef.id,
          lastMessage:"",
          rID: userData.id,
          updatedAt:Date.now(),
          messageSeen:true
        })
      })
      await updateDoc(doc(chatRef,userData.id),{
        chatsData : arrayUnion({
          messageId:newMessagesRef.id,
          lastMessage:"",
          rID: user.id,
          updatedAt:Date.now(),
          messageSeen:true
        })
      })
      const uSnap = await getDoc(db,'users',user.id);
      const uData = uSnap.data();
      // console.log(uData)
      setChat({
        messagesId:newMessagesRef.id,
        lastMessage:"",
        rID:user.id,
        updatedAt:Date.now(),
        userData:uData
      })
      setshowSearch(false);
      setChatVisible(true);
    } catch (error) {
      toast.error(error.message);
      console.log(error);
    }
  }


  useEffect(() => {
    // Clear previous chat info on new login
    setChatUser(null);
    setMessagesID(null);
  }, [userData]); 





  //display chat in chat page




  const setChat = async (item) =>{
    // console.log(item);
    setMessagesID(item.messageId);
    setChatUser(item)
    const userChatRef = doc(db,'chats',userData.id)
    const userSnapShot = await getDoc(userChatRef);
    const userChatdata = userSnapShot.data();
     // console.log(userChatdata) 
    //  console.log(item);
    const chatIndex = userChatdata.chatsData.findIndex((c)=>c.messageId === item.messageId);
    userChatdata.chatsData[chatIndex].messageSeen = true;
    await updateDoc(userChatRef,{
      chatsData:userChatdata.chatsData
    })
    setChatVisible(true)
   
  }

  useEffect(()=>{
    const UpdatedChatUserData = async()=>{
      if(ChatUser){
        const userRef = doc(db,'users',ChatUser.userData.id);
        const userSnap = await getDoc(userRef);
        const userData = userSnap.data();
        setChatUser(pre =>({...pre,userData:userData}))
      }
    }
    UpdatedChatUserData();
  },[chatData])

  return (
    <div className={`ls ${chatVisible? "hidden":""}`}>
      <div className="ls-top">
        <div className="ls-nav">
          <img src={assets.logo} alt="" className='logo' />
          <div className="menu">
            <img src={assets.menu_icon} alt="" />
            <div className="sub-menu">
            <p onClick={()=>navigate("/profile")}>Edit profile</p>
            <hr/>
            <p onClick={()=>logout()}>Logout</p>
          </div>
          </div>
        </div>
        <div className="ls-search">
          <img src={assets.search_icon} alt="" />
          <input onChange={inputHandler} type='text' placeholder='Search' />
        </div>
      </div>
      <div className="ls-list">
        {showSearch && user ?
        <div className="friend add-user" onClick={addChat}>
          <img src={assets.profile_img} alt="" />
          <div>
            <p>{user.name}</p>
            {/* <span>Hello! how are you?</span> */}
   
          </div>
        </div> :
        chatData?.map((v,i)=>(
          <div onClick={()=>setChat(v)} className={`friend ${v.messageSeen || v.messageId===messagesId?"":"border"}`} key={i}>
          <img src={assets.profile_img} alt="" />
          <div>
            <p>{v.userData.name}</p>
            <span>{v.lastMessage}</span>
   
          </div>
        </div>
        )
       )  
      }
   

     
        
      </div>
    </div>
  )
}

export default LeftBar