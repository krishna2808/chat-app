import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../../assets/styles/header.css';
import axios from 'axios';

const totalFriendRequestUrl = `${process.env.REACT_APP_BACKEND_API_URL}/post/total-friend-request/`;
const searchUserUrl = `${process.env.REACT_APP_BACKEND_API_URL}/post/search_user`;
const notificationUrl = `${process.env.REACT_APP_BACKEND_API_URL}/post/notification/`;

function Header() {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [friendRequestCount, setFriendRequestCount] = useState(0);
    const [notificationCount, setNotificationCount] = useState(0);
    const navigate = useNavigate();
    const token = localStorage.getItem('access_token');
    const login_user_image = localStorage.getItem('login_user_image');

    const header = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
    };

    useEffect(() => {
        // Fetch the count of friend requests
        axios.get(totalFriendRequestUrl, { headers: header })
            .then(response => {
                setFriendRequestCount(response.data.total_friend_request);
            })
            .catch(error => {
                console.error('Error fetching friend request count:', error);
            });

        // Fetch the count of notifications
        axios.get(notificationUrl, { headers: header })
            .then(response => {
                const unreadNotifications = response.data.filter(notification => !notification.status).length;
                setNotificationCount(unreadNotifications);
            })
            .catch(error => {
                console.error('Error fetching notifications:', error);
            });
    }, []);

    const handleSearchChange = async (e) => {
        const query = e.target.value;
        setSearchQuery(query);

        if (query.length >= 2) {
            axios.get(`${searchUserUrl}?query=${query}`, { headers: header })
                .then(response => setSearchResults(response.data.data))
                .catch(error => console.error('Error fetching usernames:', error));
        } else {
            setSearchResults([]);
        }
    };

    const handleResultClick = (username) => {
        setSearchQuery('');
        setSearchResults([]);
        localStorage.setItem('profile_username', username);
        navigate(`/user-profile/?username=${username}`);
        window.location.reload();
    };

    const handleNotificationClick = () => {
        navigate('/notifications');
    };

    return (
        <>
            <nav className="navbar navbar-expand-lg navbar-light bg-light fixed-top">
                <div className="container-fluid">
                    <Link className="navbar-brand" to="/dashboard">Home</Link>
                    <Link className="navbar-brand" to="/create-post">
                        <img src="add_post.png" className="header-image circular-image" alt="add-post" />
                    </Link>
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarNav">
                        <ul className="navbar-nav ml-auto">
                            <li className="nav-item">
                                <div className="d-flex position-relative">
                                    <input
                                        className="form-control me-2"
                                        type="search"
                                        placeholder="Search"
                                        aria-label="Search"
                                        value={searchQuery}
                                        onChange={handleSearchChange}
                                        style={{ position: 'relative' }}
                                    />
                                    {searchResults.length > 0 && (
                                        <ul className="list-group position-absolute" style={{ zIndex: 1000, top: '100%', left: 0, right: 0 }}>
                                            {searchResults.map((user) => (
                                                <li
                                                    key={user.username}
                                                    className="list-group-item"
                                                    onClick={() => handleResultClick(user.username)}
                                                >
                                                    {user.username}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" to="/chat">
                                    <img src="message_logo.jpeg" className="header-image circular-image" alt="Chat" />
                                </Link>
                            </li>
                            <li className="nav-item position-relative">
                                <Link className="nav-link" to="/my-network">
                                    <img src="network_logo.png" className="header-image circular-image" alt="network" />
                                    {friendRequestCount > 0 && (
                                        <span className="friend-request-count">{friendRequestCount}</span>
                                    )}
                                </Link>
                            </li>
                            <li className="nav-item position-relative">
                                <span className="nav-link" onClick={handleNotificationClick}>
                                    <img src="notifications.png" className="header-image circular-image" alt="Notifications" />
                                    {notificationCount > 0 && (
                                        <span className="notification-count">{notificationCount}</span>
                                    )}
                                </span>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" to="/profile">
                                    <img 
                                        src={login_user_image ? `${process.env.REACT_APP_BACKEND_API_URL}/media/${login_user_image}` : "profile.png"} 
                                        className="header-image circular-image" 
                                        alt="Profile" 
                                    />
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" to="/logout">
                                    <img 
                                        src="logout_out.png" 
                                        className="header-image circular-image" 
                                        alt="logout" 
                                    />
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>
        </>
    );
}

export default Header;
