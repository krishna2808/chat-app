import React, { useState, useEffect } from 'react';
import SignIn from './SignIn';

function Logout(){
    var token = localStorage.removeItem('access_token');
    var username = localStorage.removeItem('username');
    var user_id = localStorage.removeItem('user_id');
    var login_user_image = localStorage.removeItem('login_user_image');

        return(
            <SignIn/>
        );

}
export default Logout;

