import React, { useState } from 'react'
import './Login.css'
import assets from '../../assets/assets'
import { login, signup,ResetPass } from '../../config/Firebase';
const Login = () => {

    const [currState, setcurrState] = useState("Sign Up");
    const [user, setUser] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const HandleSubmit =(e)=>{
        e.preventDefault();
        if(currState === "Sign Up"){
            signup(user,email,password);
           
        }
        if(currState === "Login"){
            login(email,password);
            
        }
    }

    return (
        <div className="login">
            <img src={assets.logo_big} alt="" className="logo" />
            <form onSubmit={HandleSubmit} className="login-form">
                <h2>{currState}</h2>
                {currState === "Sign Up" ? <input onChange={(e)=>setUser(e.target.value)} value={user} type="text" className="form-input" name='user' placeholder='username' required /> : null}

                <input onChange={(e)=>setEmail(e.target.value)} value={email} type="email" className="form-input" name='email' placeholder='email address' required />
                <input onChange={(e)=>setPassword(e.target.value)} value={password} type="password" className="form-input" name='password' placeholder='password' required />
                <button type='submit'>{currState === "Sign Up" ? "Create account" : "Login"}</button>
                <div className="login-term">

                    <input type='checkbox' />
                    <p>Agree to the terms of use and privacy policy</p>
                </div>
                <div className="login-toogle">
                    {currState == "Sign Up" ? <p>Already have an account? <span onClick={() => setcurrState("Login")}>Login here</span> </p>
                     : <><p>Create an account <span onClick={() => setcurrState("Sign Up")}>click here</span> </p>
                        <p>Forgot password ? <span onClick={() => ResetPass(email)}>click here</span> </p>
                    </>
                    }


                </div>
            </form>
        </div>
    )
}

export default Login