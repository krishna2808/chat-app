import React, { useState, useSyncExternalStore } from 'react';
import SignIn from './SignIn';
import $ from 'jquery';
import {Link} from "react-router-dom";

import '../../assets/styles/main.css' 


// import { useHistory } from 'react-router-dom';

const signUpUrl = `${process.env.REACT_APP_BACKEND_API_URL}/account/signup/`



function SignUp() {
    const [isSignUp, isSignUpSet] = useState(false);
    const [getResponseError, setGetResponseError] = useState(false);
	// const history = useHistory();
	const [email, setEmail] = useState('');
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [mobile, setMobile] = useState('');

    //Normal function 
    // async function onSubmit(e){
    // arrow function 
	const onSubmit = async (e) =>{
		console.log("click when ", e)
		const payload = {
			"email" :email,
			"username" : username,
			"mobile" : mobile, 
			"password" : password,
		}
		console.log(email,password, username, password)
		try {
			// Make the API request using the fetch function
			const response = await fetch(signUpUrl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(payload),
			});
	
			// Check if the request was successful (status code 2xx)
			const responseData = await response.json();
			if (response.ok) {
				isSignUpSet(true)
			} else {
			// Handle errors
			debugger
			if ("email" in responseData || "username" in responseData ){
				setGetResponseError(true)
				console.log("getResponseError", getResponseError)

			}

			console.error('API request failed', response );
			}
		} catch (error) {
			console.error('Error during API request', error);
		}
	}
	if(getResponseError){
	    $(".show-error").show()
	}
	if(isSignUp){
		console.log("this is login successfully")
	    return(<SignIn/>)
	}
    return (
	    <>
		    <div  className='forms p-3 bg-info bg-opacity-10 border border-info border-start-0 rounded-end'>
				<h4 className='show-error' style={{"display": 'none'}}>Email or Username is already Exists try different once</h4>
			    <div className="mb-3">

					<label htmlFor="exampleInputEmail1" className="form-label label-text"> Email  </label>
					<input 
						type="email" 
						id="signup-email"
						className="email form-control input-text" 
						name="email" 
						required  
						onChange={(e) => setEmail(e.target.value)}
					></input>
				</div>
			    <div className="mb-3">
					<label htmlFor="exampleInputPassword1" className="form-label label-text"> Mobile </label>
					<input 
							type="number" 
							id="signup-mobile"
							className="mobile form-control input-text" 
							name="mobile" 
							required  
							onChange={(e) => setMobile(e.target.value)}
					></input>
				</div>
                <div className="mb-3">
					<label htmlFor="exampleInputPassword1" className="form-label label-text">Username  </label>
					<input 
							type="text" 
							id="signup-username"
							className="username form-control input-text" 
							name="username" 
							required  
							onChange={(e) => setUsername(e.target.value)}
					></input>
				</div>

                <div className="mb-3">
					<label htmlFor="exampleInputPassword1" className="form-label label-text">Password </label>
						<input 
							type="password"
							className="password password form-control input-text" 
							id="signup-password" 
							name="password" 
							required
							onChange={(e) => setPassword(e.target.value)}
					></input>
				</div>
				<div className="mb-3">
				    <input 
						type="submit" 
						value="Sign Up" 
						className='btn btn-primary'
						onClick={onSubmit}
					></input> &nbsp; &nbsp;
				<button  className="btn btn-primary">  <Link to="/signIn" style={{"color": "white",  'text-decoration': 'none'}}> Sign-In</Link></button>

				</div>
			</div>

		</>

	
	);}

export default SignUp;
