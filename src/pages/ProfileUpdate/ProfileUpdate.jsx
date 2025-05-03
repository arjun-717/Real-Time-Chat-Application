import React, { useContext, useEffect, useState } from 'react'
import './ProfileUpdate.css'
import assets from '../../assets/assets'
import { onAuthStateChanged } from 'firebase/auth';
import { Auth, db } from '../../config/Firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
// import { upload } from '../../lib/upload';

import { AppContext } from '../../context/AppContext';

const ProfileUpdate = () => {

  const [image,setImage] = useState(false);

  const [name,setName] = useState("");
  const [bio,setBio] = useState("");
  const [uid,setUid] = useState("");
  // const [preImage ,setPreImage] = useState("");
  const navigate = useNavigate();

  const {setUserData} = useContext(AppContext);


  const ProfileUpdate = async(e)=>{
    try {
      e.preventDefault();
    
    //works on firebase storage 

      // if(!preImage && !image){
      //   toast.error("Upload Profile Picture");
      // }
      // const userRef = doc(db,"users",uid);
      // if(image){
      //   const imageUrl = await upload(image);
      //   setPreImage(imageUrl);
      //   updateDoc(userRef,{
      //     avatar :imageUrl,
      //     name :name,
      //     bio:bio
      //   })
      // }
      // else{
      //   updateDoc(userRef,{
      //     name :name,
      //     bio:bio
      //   })
      // }

      if(!name || !bio){
        toast.error("Enter Credentials");
      }
      const userRef = doc(db, "users" ,uid);
      await updateDoc(userRef,{
        name:name,
        bio:bio,
        avatar:""
      })
      console.log("Profile Updated")

   
     
      // update in appContent file
      const snap = await getDoc(userRef);
      setUserData(snap.data());
      if(name && bio){
        navigate("/chat");
      }
      
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }

  }

  useEffect(()=>{
      onAuthStateChanged(Auth, async (user) =>{
        if(user){
          setUid(user.uid);
          const docRef = doc(db,"users",user.uid);
          const docSnap = await getDoc(docRef);
          if(docSnap.data().name){
            setName(docSnap.data().name);
          }
          if(docSnap.data().bio){
            setBio(docSnap.data().bio);
          }
          // if(docSnap.data().avatar){
          //   setPreImage(docSnap.data().avatar);
          // }
        }
           
        else{
          navigate("/");
      } 
      })
  },[])

  return (
    <div className="profile">
      <div className="profile-container">
        <form  onSubmit={ProfileUpdate}>
            <h3>Profile details</h3>
            <label htmlFor='avatar' onClick={()=>{
              toast.info("This feature is not available yet.");
            }}>
              {/* <input onChange={(e)=>setImage(e.target.files[0])} type="file" accept='.png,.jpg,.jpeg' id='avatar' hidden/> */}
              <img src={image ? URL.createObjectURL(image) :  assets.avatar_icon} alt="" />
              Upload profile image
            </label>
            <input onChange={(e)=>setName(e.target.value)} value={name} type="text" placeholder='Your name' />
            <textarea onChange={(e)=>setBio(e.target.value)} value={bio} placeholder='Write bio about you'></textarea>
            <button type='submit'>Save</button>
        </form>
        {/* <img src={image?URL.createObjectURL(image) : assets.logo_icon} className='profile-pic' alt="" /> */}
        <img src={image?URL.createObjectURL(image) : assets.logo_icon} className='profile-pic' alt="" />
      </div>
    </div>
  )
}

export default ProfileUpdate