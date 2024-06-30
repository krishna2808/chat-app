import React, { useState } from 'react';
import '../../assets/styles/chat.css';

import UserChatList from './UserChatList';
import UserChat from './UserChat';

function App() {
  const [selectedUser, setSelectedUser] = useState(null);

  const handleUserSelect = (user) => {
    setSelectedUser(user);
  };

  return (
    <div className="app-container">
      <div className="user-chat-list">
        <UserChatList onSelect={handleUserSelect} />
      </div>
      <div className="user-chat">
        {selectedUser ? <UserChat user={selectedUser} /> : <div className='select-chat'>Select a chat to start messaging</div>}
      </div>
    </div>
  );
}

export default App;
