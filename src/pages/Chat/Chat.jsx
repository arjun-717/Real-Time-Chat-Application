import React, { useContext, useEffect, useState } from 'react'
import './Chat.css'
import LeftBar from '../../components/LeftBar/LeftBar'
import RightBar from '../../components/RightBar/RightBar'
import ChatBar from '../../components/ChatBar/ChatBar'
import { AppContext } from '../../context/AppContext'

const Chat = () => {

  const {userData,chatData} = useContext(AppContext);
  const [loading,setLoading] = useState(true);
  
  useEffect(()=>{
    if(userData && chatData){
      setLoading(false);
    }
  },[userData,chatData])
  return (
    <div className="chat">
      {
        loading ?
        <p className='loading'>Loading...</p>
        :
        <div className="chat-container">
        <LeftBar/>
        <ChatBar/>
        <RightBar/>
        
      </div>
      }
     
    </div>
  )
}

export default Chat