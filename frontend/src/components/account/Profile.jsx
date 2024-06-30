import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../assets/styles/main.css';
import Header from '../common/Header';

const profileUrl = `${process.env.REACT_APP_BACKEND_API_URL}/account/profile/`


function Profile() {
    const [user, setUser] = useState({
        profilePic: '',
        firstName: '',
        lastName: '',
        username: '',
        email: '',
        mobile: '',
        address: '',
        bio: '',
        isPrivateAccount: false,
    });

    const token = localStorage.getItem('access_token');
    const header = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
    };

    useEffect(() => {
        axios.get(profileUrl, { headers: header })
            .then(response => {
                const data = response.data;
                console.log("User data fetched: ", data);
                setUser({
                    profilePic: data.image || '',
                    firstName: data.first_name || '',
                    lastName: data.last_name || '',
                    username: data.username || '',
                    email: data.email || '',
                    mobile: data.mobile || '',
                    address: data.address || '',
                    bio: data.bio || '',
                    isPrivateAccount: data.is_private_account || false,
                });
            })
            .catch(error => {
                console.error('Error fetching user data:', error);
            });
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === "isPrivateAccount") {
            setUser({ ...user, [name]: value === "yes" });
        } else {
            setUser({ ...user, [name]: value });
        }
    };

    const handleProfilePicChange = (e) => {
        setUser({ ...user, profilePic: e.target.files[0] });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const formData = new FormData();
        if (user.profilePic && user.profilePic instanceof File) {
            formData.append('image', user.profilePic);
        }
        formData.append('first_name', user.firstName);
        formData.append('last_name', user.lastName);
        formData.append('username', user.username);
        formData.append('email', user.email);
        formData.append('mobile', user.mobile);
        formData.append('address', user.address);
        formData.append('bio', user.bio);
        formData.append('is_private_account', user.isPrivateAccount);

        axios.put(profileUrl, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${token}`,
            }
        })
            .then(response => {
                console.log('Profile updated successfully!', response.data);
            })
            .catch(error => {
                console.error('Error updating profile:', error);
            });
    };

    return (
        <>
            {/* <Header /> */}
            <div class="create-post-container">               
             <div className="profile-container">
                    <h1>Profile</h1>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="profilePic" className="form-label">Profile Picture</label>
                            <input type="file" className="form-control" id="profilePic" name="profilePic" onChange={handleProfilePicChange} />
                            {user.profilePic && (
                                <img
                                    src={typeof user.profilePic === 'string' ? user.profilePic : URL.createObjectURL(user.profilePic)}
                                    alt="Profile"
                                    className="profile-preview"
                                />
                            )}
                        </div>
                        <div className="form-group">
                            <label htmlFor="firstName" className="form-label">First Name</label>
                            <input type="text" className="form-control" id="firstName" name="firstName" value={user.firstName} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="lastName" className="form-label">Last Name</label>
                            <input type="text" className="form-control" id="lastName" name="lastName" value={user.lastName} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="username" className="form-label">Username</label>
                            <input type="text" className="form-control" id="username" name="username" value={user.username} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="email" className="form-label">Email</label>
                            <input type="email" className="form-control" id="email" name="email" value={user.email} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="mobile" className="form-label">Mobile</label>
                            <input type="text" className="form-control" id="mobile" name="mobile" value={user.mobile} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="address" className="form-label">Address</label>
                            <input type="text" className="form-control" id="address" name="address" value={user.address} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="bio" className="form-label">Bio</label>
                            <textarea className="form-control" id="bio" name="bio" value={user.bio} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="isPrivateAccount" className="form-label">Private Account</label>
                            <select className="form-control" id="isPrivateAccount" name="isPrivateAccount" value={user.isPrivateAccount ? "yes" : "no"} onChange={handleChange}>
                                <option value="yes">Yes</option>
                                <option value="no">No</option>
                            </select>
                        </div>
                        <button type="submit" className="btn-primary">Submit</button>
                    </form>
                </div>

        


            </div>

    
        </>
    );
}

export default Profile;