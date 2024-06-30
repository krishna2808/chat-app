import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperclip, faDownload, faPaperPlane } from '@fortawesome/free-solid-svg-icons';

const websocketUrl = `${process.env.REACT_APP_BACKEND_WS_URL}/ws/chat`;
const fileUploadFromChatUrl = `${process.env.REACT_APP_BACKEND_API_URL}/chat/file-upload-send-chat/`;
const fileDownloadfromChatUrl = `${process.env.REACT_APP_BACKEND_API_URL}/chat/download-chat-files/`;

function UserChat({ user }) {
  const currentUser = localStorage.getItem('username');
  const [messages, setMessages] = useState(user.chat_room || []);
  const [newMessage, setNewMessage] = useState('');
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [roomId, setRoomId] = useState(user.roomId);
  const socketRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);
  const chatContainerRef = useRef(null);

  const token = localStorage.getItem('access_token');
  const header = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
    'Content-Type': 'multipart/form-data',
  };

  const formatDate = (datetime) => {
    const date = new Date(datetime);

    const day = date.getDate();
    const month = date.getMonth() + 1; // Months are zero-based
    const year = date.getFullYear();

    const hours = date.getHours() % 12 || 12;
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    const ampm = date.getHours() >= 12 ? 'PM' : 'AM';

    return `${day}/${month}/${year}, ${hours}:${minutes}:${seconds} ${ampm}`;
  };

  useEffect(() => {
    if (socketRef.current) {
      if (socketRef.current.readyState === WebSocket.OPEN && socketRef.current.roomId === roomId) {
        return;
      }
      if (socketRef.current.readyState === WebSocket.OPEN && socketRef.current.roomId !== roomId) {
        socketRef.current.close();
      }
    }

    const ws = new WebSocket(`${websocketUrl}/${roomId}/?token=${token}`);
    ws.roomId = roomId;

    ws.onopen = () => {
      console.log('WebSocket connected to room:', roomId);
      socketRef.current = ws;
    };

    ws.onmessage = (event) => {
      const newMsg = JSON.parse(event.data);
      if (newMsg.action === 'onlineUser') {
        setOnlineUsers(newMsg.userList);
      } else if (newMsg.action === 'typing') {
        handleTypingIndicator(newMsg.user);
      } else if (newMsg.action === 'file') {
        setMessages((prevMessages) => [...prevMessages, newMsg]);
      } else {
        setMessages((prevMessages) => [...prevMessages, newMsg]);
      }
      scrollToBottom();
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket connection closed for room:', roomId);
      socketRef.current = null;
    };

    return () => {
      if (ws) ws.close();
    };
  }, [roomId]);

  useEffect(() => {
    setRoomId(user.roomId);
    setMessages(user.chat_room || []);
    scrollToBottom();
  }, [user]);

  const handleSendMessage = () => {
    if ((newMessage.trim() !== '' || fileInputRef.current.files.length > 0) && socketRef.current) {
      if (newMessage.trim() !== '') {
        const newMsg = {
          message: newMessage,
          sender: currentUser,
          roomId: user.roomId,
          action: 'message',
        };
        socketRef.current.send(JSON.stringify(newMsg));
        setNewMessage('');
        clearTypingIndicator();
      }

      if (fileInputRef.current.files.length > 0) {
        const file = fileInputRef.current.files[0];
        const formData = new FormData();

        formData.append('message', file.name);
        formData.append('sender', currentUser);
        formData.append('roomId', roomId);
        formData.append('action', 'file');
        formData.append('file', file);

        axios
          .post(fileUploadFromChatUrl, formData, { headers: header })
          .then((response) => {
            var newFileMsg = response.data;
            // Handle response if needed
          })
          .catch((error) => console.error('Error uploading file:', error));

        fileInputRef.current.value = '';
      }
    }
  };

  const handleTypingIndicator = (username) => {
    if (username !== currentUser) {
      setTypingUsers((prevTypingUsers) => {
        if (!prevTypingUsers.includes(username)) {
          return [...prevTypingUsers, username];
        }
        return prevTypingUsers;
      });

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        setTypingUsers((prevTypingUsers) => prevTypingUsers.filter((user) => user !== username));
      }, 3000);
    }
  };

  const handleTyping = () => {
    if (socketRef.current) {
      const typingMsg = {
        action: 'typing',
        user: currentUser,
        roomId: user.roomId,
      };
      socketRef.current.send(JSON.stringify(typingMsg));
    }
  };

  const clearTypingIndicator = () => {
    setTypingUsers((prevTypingUsers) => prevTypingUsers.filter((user) => user !== currentUser));
  };

  const selectedUser = user.type === 'DM' ? user.members[0] : null;
  const isSelectedUserOnline = selectedUser ? onlineUsers.includes(selectedUser.username) : false;

  const handleFileInputChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      console.log('Selected file:', file.name);
    }
  };

  const handleFileDownload = async (fileUrl, fileName) => {
    var file_name_list = fileName.split('/');
    var file_name = file_name_list[file_name_list.length - 1];

    try {
      const response = await axios.get(`${fileDownloadfromChatUrl}${file_name}`, {
        responseType: 'blob',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading the file:', error);
    }
  };

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div>
      <h2 className="chat-header">
        {user.type === 'DM' ? (
          <>
            <img src={selectedUser.image} alt={`${selectedUser.username}'s profile`} />
            {selectedUser.username}
            <span className={isSelectedUserOnline ? 'status online' : 'status offline'}></span>
            {typingUsers.includes(selectedUser.username) && (
              <span className="typing-indicator"> is typing...</span>
            )}
          </>
        ) : (
          <>
            <img src={user.image} alt={`${user.name}'s group pic`} />
            {user.name}
            {typingUsers.length > 0 && (
              <div className="typing-indicator-group">
                {typingUsers.map((username) => (
                  <span key={username} className="typing-indicator">
                    {username} is typing...
                  </span>
                ))}
              </div>
            )}
          </>
        )}
      </h2>

      <div className="chat-messages" ref={chatContainerRef}>
        {messages.map((message, index) => (
          <div
            key={index}
            className={`chat-message ${message.sender === currentUser ? 'sent' : 'received'}`}
          >
            <div className="message-header">
              <img
                src={`${process.env.REACT_APP_BACKEND_API_URL}/media/${message.sender_image}`}
                alt={`${message.sender}'s profile`}
                className="profile-pic"
              />
              <div className="message-content">
                {user.type !== 'DM' && <strong>{message.sender}</strong>}
                {message.file ? (
                  <div className="message-text">
                    <button
                      className="download-button"
                      onClick={() =>
                        handleFileDownload(
                          `${process.env.REACT_APP_BACKEND_API_URL}/chat/download-chat-files/${message.file}`,
                          message.file
                        )
                      }
                    >
                      <FontAwesomeIcon icon={faDownload} /> {message.message}
                    </button>
                  </div>
                ) : (
                  <div className="message-text">{message.message}</div>
                )}
              </div>
              <div className="message-timestamp">
                <span>({formatDate(message.timestamp)})</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="message-input">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => {
            setNewMessage(e.target.value);
            handleTyping();
          }}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleSendMessage();
            }
          }}
          placeholder="Type your message..."
        />
        <label className="file-upload-button" htmlFor="fileInput">
          <FontAwesomeIcon icon={faPaperclip} />
        </label>
        <input
          type="file"
          id="fileInput"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileInputChange}
        />
        <button className="send-button" onClick={handleSendMessage}>
          <FontAwesomeIcon icon={faPaperPlane} />
        </button>
      </div>
    </div>
  );
}

export default UserChat;
