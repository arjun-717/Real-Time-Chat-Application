import React, { useContext,useEffect, useState } from 'react'
import './RightBar.css'
import assets from '../../assets/assets'
import { logout } from '../../config/Firebase'
import { AppContext } from '../../context/AppContext'
const RightBar = () => {
  const {ChatUser,messages} = useContext(AppContext);
  const [Img,setImg] = useState([]);
  useEffect(()=>{
    let temp =[];
    messages.map((img)=>{
      if(img.image){
        temp.push(img.image);
      }
      setImg(temp)
    })
  },[messages]);
  return ChatUser? (
    <div className="rs">
      <div className="rs-profile">
        <img src={assets.profile_img} alt="" />
        <h3> {Date.now() - ChatUser.userData.lastSeen <= 70000 ? <img src={assets.green_dot} className='dot' alt="" />:null }{ChatUser.userData.name} </h3>
        <p>{ChatUser.userData.bio}</p>
      </div>
      <hr />
      <div className="rs-media">
        <p>Media</p>
        <div>{
          Img.map((url,i)=>{
            <img onClick={window.open()} src={assets.pic2} alt="" />
          })
          }
          {/* <img src={assets.pic1} alt="" />
          <img src={assets.pic2} alt="" />
          <img src={assets.pic3} alt="" /> */}
        </div>
      </div>
      <div className="logout-btn">
      <button onClick={()=>logout()}>Logout</button>
      </div>
      
    </div>
  ):
  (
    <div className='rs'>
         {/* <div className="rs-profile">
        <img src={assets.avatar_icon} alt="" />
        <h3>Arjun B <img src={assets.green_dot} className='dot' alt="" /></h3>
        <p>Hi there now I'm using chatapp for messaging and communicating</p>
      </div> */}
      <div className="logout-btn">
      <button onClick={()=>logout()}>Logout</button>
      </div>
    </div>
  )
}

export default RightBar