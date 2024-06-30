import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Modal, Form, ListGroup } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../assets/styles/chat.css';

const chatMessageGetCreateDeleteUrl = `${process.env.REACT_APP_BACKEND_API_URL}/chat/chat_message/`;
const searchChatUserUrl = `${process.env.REACT_APP_BACKEND_API_URL}/chat/search_chat_user`;
const login_user_image = localStorage.getItem('login_user_image');
const login_username = localStorage.getItem('username');

function UserChatList({ onSelect }) {
  const [chats, setChats] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [showNewGroupChatModal, setShowNewGroupChatModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userList, setUserList] = useState([]);
  const [groupName, setGroupName] = useState('');
  const [selectedGroupUsers, setSelectedGroupUsers] = useState([]);
  const [contextMenu, setContextMenu] = useState(null);
  const [pinnedChats, setPinnedChats] = useState([]);

  const token = localStorage.getItem('access_token');
  const header = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };

  const navigate = useNavigate(); // Initialize useNavigate

  useEffect(() => {
    if (searchQuery.length >= 3) {
      axios.get(`${searchChatUserUrl}?query=${searchQuery}`, { headers: header })
        .then(response => setSearchResults(response.data.data))
        .catch(error => console.error('Error fetching usernames:', error));
    }
  }, [searchQuery]);

  useEffect(() => {
    axios.get(searchChatUserUrl, { headers: header })
      .then(response => setUserList(response.data.data))
      .catch(error => console.error('Error fetching usernames:', error));
  }, [showNewGroupChatModal]);

  useEffect(() => {
    fetch(chatMessageGetCreateDeleteUrl, {
      method: 'GET',
      headers: header
    })
      .then(response => {
        if (!response.ok) throw new Error('Failed to fetch data');
        return response.json();
      })
      .then(data => setChats(data))
      .catch(error => console.error('Error fetching data:', error));
  }, []);

  const chatNewUser = (username) => {
    const payload = { usernames: [username], type: "DM" };
    axios.post(chatMessageGetCreateDeleteUrl, payload, { headers: header })
      .then(response => {
        window.location.reload();
      })
      .catch(error => console.error('Error creating new chat:', error));
  };

  const handleGroupAdd = () => {
    if (selectedGroupUsers.length > 0 && groupName.length > 0) {
      const payload = { usernames: selectedGroupUsers, name: groupName, type: "GROUP" };
      axios.post(chatMessageGetCreateDeleteUrl, payload, { headers: header })
        .then(response => {
          window.location.reload();
        })
        .catch(error => console.error('Error creating group chat:', error));
    }
  };

  const handleDeleteChat = (chatId) => {
    var payload = { "chat_room_id": chatId };
    axios.delete(chatMessageGetCreateDeleteUrl, {
      headers: header,
      data: payload
    })
      .then(response => {
        setChats(chats.filter(chat => chat.id !== chatId));
      })
      .catch(error => console.error('Error deleting chat:', error));
  };

  const handlePinChat = (chatId) => {
    setPinnedChats((prevPinnedChats) => {
      if (prevPinnedChats.includes(chatId)) {
        return prevPinnedChats.filter(id => id !== chatId);
      } else {
        return [...prevPinnedChats, chatId];
      }
    });
  };

  const handleContextMenu = (event, chat) => {
    event.preventDefault();
    setContextMenu({
      x: event.clientX,
      y: event.clientY,
      chat
    });
  };

  const closeContextMenu = () => {
    setContextMenu(null);
  };

  return (
    <div>
      <Link to="/profile" className="no-underline">
        <img
          src={login_user_image ? `${process.env.REACT_APP_BACKEND_API_URL}/media/${login_user_image}` : "profile.png"}
          className="chat-profile-image"
          alt="Profile"
        />
        <h4>{login_username}</h4>
      </Link>

      <Button onClick={() => setShowNewChatModal(true)}>New Chat</Button>
      <Modal show={showNewChatModal} onHide={() => setShowNewChatModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>New Chat</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Control
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search username..."
          />
          <ListGroup>
            {searchResults.map(username => (
              <ListGroup.Item key={username.username} onClick={() => chatNewUser(username.username)}>
                {username.username}
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Modal.Body>
      </Modal>

      <Button onClick={() => setShowNewGroupChatModal(true)}>New Group</Button>
      <Modal show={showNewGroupChatModal} onHide={() => setShowNewGroupChatModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>New Group Chat</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Control
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="Group Name"
          />
          <Form.Control
            as="select"
            multiple
            onChange={(e) => setSelectedGroupUsers(Array.from(e.target.selectedOptions, option => option.value))}
          >
            {userList.map(username => (
              <option key={username.username} value={username.username}>
                {username.username}
              </option>
            ))}
          </Form.Control>
          <Button onClick={handleGroupAdd}>Add Group</Button>
        </Modal.Body>
      </Modal>

      <ul className="chat-list">
        {chats.map((room) => (
          <li key={room.id} className="chat-item" onClick={() => onSelect(room)}>
            <span className="delete-container">
              <button
                className="delete-btn"
                aria-label="Open the chat context menu"
                aria-hidden="true"
                tabIndex="0"
                onClick={(e) => {
                  e.stopPropagation();
                  handleContextMenu(e, room);
                }}
              >
                <svg viewBox="0 0 19 20" height="20" width="19" preserveAspectRatio="xMidYMid meet">
                  <title>down</title>
                  <path fill="currentColor" d="M3.8,6.7l5.7,5.7l5.7-5.7l1.6,1.6l-7.3,7.2L2.2,8.3L3.8,6.7z"></path>
                </svg>
              </button>
            </span>
            {room.type === 'DM' ? (
              <div className="dm-chat-item">
                <img
                  src={room.members[0].image}
                  alt={`${room.members[0].username}'s profile`}
                  className="dm-chat-pic"
                />
                <span>{room.members[0].username}</span>
              </div>
            ) : (
              <div className="dm-chat-item">
                <img
                  src={room.image}
                  alt={`${room.name}'s group`}
                  className="dm-chat-pic"
                />
                <span>{room.name}</span>
              </div>
            )}
          </li>
        ))}
      </ul>

      {contextMenu && (
        <div
          className="context-menu"
          style={{
            top: contextMenu.y,
            left: contextMenu.x,
            position: 'absolute',
            backgroundColor: 'white',
            boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
            zIndex: 1000,
            borderRadius: '4px',
            padding: '10px'
          }}
        >
          <Button variant="link" onClick={() => {
            handleDeleteChat(contextMenu.chat.id);
            closeContextMenu();
          }}>Delete Chat</Button>
          <Button variant="link" onClick={closeContextMenu}>Close</Button>
        </div>
      )}
    </div>
  );
}

export default UserChatList;
