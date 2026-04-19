import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import Auth from './features/auth/Auth';
import Sidebar from './features/chat/Sidebar';
import ChatWindow from './features/chat/ChatWindow';
import NotificationToast from './components/NotificationToast';

const socket = io('http://localhost:5000');


function App() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  const [channels, setChannels] = useState([]);
  const [activeChannel, setActiveChannel] = useState(null);
  const [users, setUsers] = useState([]);
  const [activeDMUser, setActiveDMUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [notifications, setNotifications] = useState([]);

  // Load Channels & Users from API
  useEffect(() => {
    if (user) {
      // Fetch Channels
      fetch('/api/channels', {
        headers: { Authorization: `Bearer ${user.token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
            setChannels(data);
            if (data.length > 0) setActiveChannel(data[0]);
        }
      });

      // Fetch Users for DM
      fetch('/api/auth/users', {
        headers: { Authorization: `Bearer ${user.token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setUsers(data);
      });
    }
  }, [user]);

  // Join Personal Room
  useEffect(() => {
      if (user) {
          socket.emit('join_room', user._id);
      }
  }, [user]);

  // Handle Chat Switch (Channel or DM)
  useEffect(() => {
    if (user) {
      const targetId = activeChannel?._id || activeDMUser?._id;
      if (targetId) {
          // Clear unread count for the active chat
          setUnreadCounts(prev => {
              const next = { ...prev };
              delete next[targetId];
              return next;
          });
      }

      if (activeChannel) {
        socket.emit('join_room', activeChannel._id);
        fetch(`/api/channels/${activeChannel._id}/messages`, {
            headers: { Authorization: `Bearer ${user.token}` }
        })
        .then(res => res.json())
        .then(data => {
            if (Array.isArray(data)) setMessages(data);
        });
      } else if (activeDMUser) {
        fetch(`/api/messages/${activeDMUser._id}`, {
            headers: { Authorization: `Bearer ${user.token}` }
        })
        .then(res => res.json())
        .then(data => {
            if (Array.isArray(data)) setMessages(data);
        });
      }
    }
  }, [activeChannel, activeDMUser, user]);

  // Socket Listeners
  useEffect(() => {
    const handleReceiveMessage = (message) => {
        const isFromOthers = message.senderId !== user?._id;
        const msgChannelId = message.channelId;
        const msgSenderId = message.senderId;
        const msgRecipientId = message.recipientId;

        const isCurrentChannel = activeChannel && msgChannelId === activeChannel._id;
        const isCurrentDM = activeDMUser && (
            (msgSenderId === activeDMUser._id && msgRecipientId === user._id) ||
            (msgSenderId === user._id && msgRecipientId === activeDMUser._id)
        );

        if (isCurrentChannel || isCurrentDM) {
            setMessages((prev) => [...prev, message]);
        } else if (isFromOthers) {
            // New Notification and Unread Count
            const targetId = msgChannelId || msgSenderId;
            setUnreadCounts(prev => ({
                ...prev,
                [targetId]: (prev[targetId] || 0) + 1
            }));

            const newNotif = {
                id: Date.now(),
                content: message.content,
                senderName: message.username,
                avatar: message.avatar,
                targetId: targetId
            };
            setNotifications(prev => [...prev, newNotif]);
            
            // Auto remove after 5 seconds
            setTimeout(() => {
                setNotifications(prev => prev.filter(n => n.id !== newNotif.id));
            }, 5000);
        }
    };

    socket.on('receive_message', handleReceiveMessage);
    return () => socket.off('receive_message', handleReceiveMessage);
  }, [activeChannel, activeDMUser, user]);

  const removeNotification = (id) => {
      setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const updateUser = (updatedUser) => {
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
  };

  if (!user) {
    return <Auth setUser={setUser} />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#0f172a] font-['Outfit'] relative">
      <NotificationToast 
        notifications={notifications} 
        removeNotification={removeNotification} 
      />
      
      <Sidebar 
        channels={channels} 
        activeChannel={activeChannel} 
        setActiveChannel={(channel) => {
            setActiveChannel(channel);
            setActiveDMUser(null);
        }} 
        users={users}
        activeDMUser={activeDMUser}
        setActiveDMUser={(dmUser) => {
            setActiveDMUser(dmUser);
            setActiveChannel(null);
        }}
        onUpdateUser={updateUser}
        unreadCounts={unreadCounts}
        user={user} 
        logout={logout}
      />
      
      <ChatWindow 
        activeChannel={activeChannel} 
        activeDMUser={activeDMUser}
        messages={messages} 
        socket={socket} 
        user={user} 
      />
    </div>
  );
}

export default App;

