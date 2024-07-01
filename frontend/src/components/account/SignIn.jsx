
import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import Header from '../common/header';
import '../../assets/styles/main.css' 

import {Link, useNavigate} from "react-router-dom";

import { BLOG_API_URL } from '../../config';

const signInUrl = `${process.env.REACT_APP_BACKEND_API_URL}/account/signin/`


function SignIn() {
    const [isLogin, setIsLogin] = useState(false);
    const [accessToken, setAccesssToken] = useState(false);
    const [username, setUsername] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    

    //Normal function 
    // async function onSubmit(e){
    // arrow function SignIn
    const onSubmit = async (e) =>{
        console.log("click when ", e)
        const payload = {
            "email" :email,
            "password" : password
        }
        console.log(email,password)
        try {
            // Make the API request using the fetch function
            const response = await fetch(signInUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            // credentials: 'include',
            body: JSON.stringify(payload),
            });
            // Check if the request was successful (status code 2xx)
            const responseData = await response.json();
            if (response.ok) {
                // Process the response data (if needed)
                setAccesssToken(responseData["access"])
                setUsername(responseData["username"])

                localStorage.removeItem('access_token');
                localStorage.removeItem('username');
                localStorage.removeItem('user_id');
                localStorage.removeItem('login_user_image');

                localStorage.setItem('access_token', responseData["access"]);
                localStorage.setItem('username', responseData["username"]);
                localStorage.setItem('user_id', responseData["id"]);
                localStorage.setItem('login_user_image', responseData["login_user_image"]);
                setIsLogin(true)
                console.log(responseData);
            } else {
            // Handle errors
            console.error('API request failed', response );
            }
        } catch (error) {
            console.error('Error during API request', error);
        }
    }

    useEffect(() => {

    }, [isLogin]);

    if(accessToken){


            {/* <chat/> */}
            navigate('/chat');
            window.location.reload();

    }


    return (
        <>
            <div className='forms p-3 bg-info bg-opacity-10 border border-info border-start-0 rounded-end'>
            {/* <form className="forms" style={{margin:"10%"}}> */}
            <div className="mb-3">
                <label htmlFor="exampleInputEmail1" className="form-label label-text">Email address</label>
                <input 
                    type="email" 
                    className="email form-control input-text" 
                    id="exampleInputEmail1" 
                    name="email" 
                    required 
                    aria-describedby="emailHelp"
                    onChange={(e) => setEmail(e.target.value)}
                ></input>
                <div id="emailHelp" className="form-text">We'll never share your email with anyone else.</div>
            </div>
            <div className="mb-3">
                <label htmlFor="exampleInputPassword1" className="form-label label-text">Password</label>
                <input 
                    type="password"
                    className="password form-control input-text" 
                    // id="exampleInputPassword1" 
                    name="password" 
                    required
                    onChange={(e) => setPassword(e.target.value)}
                ></input>
            </div>
            {/* <div className="mb-3 form-check">
                <input 
                    type="checkbox"
                    className="form-check-input" 
                    id="exampleCheck1"
                ></input>
                <label className="form-check-label label-text" htmlFor="exampleCheck1">Check me out</label>
            </div> */}
            <div>
            <Link to="/forgot-password" > Forgot-password</Link> <br></br> <br></br>

            </div>
            
            <input type="submit" value="Sign-In"className="btn btn-primary" onClick={onSubmit}></input>  &nbsp; &nbsp;
            <button  className="btn btn-primary">  <Link to="/signUp" style={{"color": "white",  'text-decoration': 'none'}}> Sign-Up</Link></button>
            {/* </form> */}
            </div>
        </>	
    );
}

export default SignIn;
