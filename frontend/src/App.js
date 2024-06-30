import React from 'react';
// import { Route, Switch } from 'react-router-dom';
import { BrowserRouter , Router, Route, Routes } from 'react-router-dom';

import SignIn from './components/account/SignIn';
import ChatApp from './components/chat/ChatApp';
import Profile from './components/account/Profile';
import Header from './components/common/Header';

import SignUp from './components/account/SignUp';



function App() {
	return (
        <div className='container'>
            <BrowserRouter> 
                <Routes>
                <Route path="/" element={<SignIn/>} />
                <Route path="/signIn" element={<SignIn/>} />
                <Route path="/signUp" element={<SignUp/>} />
                <Route path="/chat" element={<ChatApp/>} />
                {/* <Route path="/Header" element={<Header/>} /> */}
                <Route path="/profile" element={<Profile/>} />
                {/* <Route path="/logout" element={<Logout/>} /> */}

                Notifications
                </Routes>
            </BrowserRouter>	
        </div>  

	
	);
};

export default App;
