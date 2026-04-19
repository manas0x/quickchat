import React, { useState, useEffect, useRef } from 'react';
import { Send, Hash, Info, Smile, Plus, Phone, Video, Search, UserPlus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import EmojiPicker from '../../components/EmojiPicker';
import Modal from '../../components/Modal';

const ChatWindow = ({ activeChannel, activeDMUser, messages, socket, user }) => {
  const [content, setContent] = useState('');
  const [remoteTyping, setRemoteTyping] = useState(null);
  const scrollRef = useRef();
  const typingTimeoutRef = useRef(null);

  // Search States
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  // Member Management States
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [userResults, setUserResults] = useState([]);

  // Emoji States
  const [isEmojiOpen, setIsEmojiOpen] = useState(false);

  useEffect(() => {
    const handleRemoteTyping = (data) => {
        // Only show if it matches current context (channel or DM)
        const isMatch = (data.channelId && data.channelId === activeChannel?._id) ||
                        (data.recipientId && data.recipientId === user._id && data.senderId === activeDMUser?._id);
        
        if (isMatch && data.username !== user.username) {
            setRemoteTyping(data.username);
            
            // Clear previous timeout
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            
            // Set new timeout to hide after 3 seconds
            typingTimeoutRef.current = setTimeout(() => {
                setRemoteTyping(null);
            }, 3000);
        }
    };

    socket.on('user_typing', handleRemoteTyping);
    return () => {
        socket.off('user_typing', handleRemoteTyping);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [activeChannel, activeDMUser, user, socket]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle Search API
  useEffect(() => {
    if (!searchQuery.trim()) {
        setSearchResults([]);
        return;
    }
    const timer = setTimeout(async () => {
        const url = activeChannel 
            ? `/api/channels/${activeChannel._id}/search?q=${searchQuery}`
            : `/api/messages/${activeDMUser?._id}/search?q=${searchQuery}`;
        
        const res = await fetch(url, { headers: { Authorization: `Bearer ${user.token}` } });
        const data = await res.json();
        setSearchResults(data);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, activeChannel, activeDMUser, user]);

  // Handle User Search for adding members
  useEffect(() => {
    if (!userSearch.trim()) {
        setUserResults([]);
        return;
    }
    const timer = setTimeout(async () => {
        const res = await fetch(`/api/auth/search?q=${userSearch}`, { headers: { Authorization: `Bearer ${user.token}` } });
        const data = await res.json();
        setUserResults(data);
    }, 300);
    return () => clearTimeout(timer);
  }, [userSearch, user.token]);

  const handleAddMember = async (targetId) => {
    try {
        const res = await fetch(`/api/channels/${activeChannel._id}/members`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${user.token}`
            },
            body: JSON.stringify({ userId: targetId })
        });
        if (res.ok) {
            alert('Member added successfully!');
            setIsMemberModalOpen(false);
        }
    } catch (err) {
        console.error(err);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    const messageData = {
      channelId: activeChannel?._id || null,
      recipientId: activeDMUser?._id || null,
      senderId: user._id,
      username: user.username,
      avatar: user.avatar,
      content: content.trim(),
    };

    socket.emit('send_message', messageData);
    setContent('');
    setIsEmojiOpen(false);
  };

  const handleTyping = (e) => {
    setContent(e.target.value);
    socket.emit('typing', { 
        channelId: activeChannel?._id, 
        recipientId: activeDMUser?._id,
        senderId: user._id,
        username: user.username 
    });
  };

  const activeTitle = activeChannel ? `# ${activeChannel.name}` : activeDMUser?.username;
  const activeSub = activeChannel ? 'Text Channel' : 'Direct Message';

  return (
    <div className="flex-1 flex flex-col bg-[#0f172a] h-screen overflow-hidden relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-blue-500/5 blur-[120px] pointer-events-none" />

      {/* Chat Header */}
      <div className="h-20 px-8 border-b border-white/5 flex items-center justify-between bg-slate-950/20 backdrop-blur-3xl z-20">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 group cursor-pointer hover:border-blue-500/50 transition-all">
            {activeChannel ? (
                <Hash className="text-slate-500 w-5 h-5 group-hover:text-blue-400" />
            ) : (
                <img src={activeDMUser?.avatar} className="w-6 h-6 rounded-lg" alt="avatar" />
            )}
          </div>
          <div>
            <h3 className="text-white font-bold text-lg tracking-tight">{activeTitle || 'Select a chat'}</h3>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black">{activeSub}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
            <AnimatePresence>
                {isSearchOpen && (
                    <motion.div 
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: 240, opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        className="relative mr-2"
                    >
                        <input 
                            autoFocus
                            type="text"
                            placeholder="Search messages..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-4 pr-10 text-xs text-white outline-none focus:border-blue-500/50 transition-all font-medium"
                        />
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                    </motion.div>
                )}
            </AnimatePresence>
            <button 
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className={`p-2.5 rounded-xl transition-all ${isSearchOpen ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
            >
                <Search size={20} />
            </button>
            {activeChannel && (
                <button 
                    onClick={() => setIsMemberModalOpen(true)}
                    className="p-2.5 text-slate-500 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                >
                    <UserPlus size={20} />
                </button>
            )}
            {[<Phone />, <Video />, <Info />].map((icon, i) => (
                <button key={i} className="p-2.5 text-slate-500 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                    {React.cloneElement(icon, { size: 20 })}
                </button>
            ))}
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto px-8 py-6 space-y-8 scroll-smooth z-10">
        {isSearchOpen && searchQuery && (
            <div className="mb-8 p-4 bg-blue-600/10 border border-blue-500/20 rounded-2xl">
                 <h4 className="text-[10px] text-blue-400 uppercase font-black tracking-widest mb-3">Found {searchResults.length} matches for "{searchQuery}"</h4>
                 <div className="space-y-4">
                    {searchResults.map((msg, i) => (
                        <div key={i} className="flex gap-3 text-xs">
                             <span className="text-slate-500 font-bold whitespace-nowrap">{msg.username}:</span>
                             <span className="text-slate-300 line-clamp-1">{msg.content}</span>
                        </div>
                    ))}
                 </div>
            </div>
        )}

        {!messages.length && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-20 h-20 bg-gradient-to-tr from-blue-600/20 to-indigo-600/20 rounded-[2.5rem] flex items-center justify-center mb-6 border border-blue-500/20">
                    {activeChannel ? <Hash className="text-blue-400 w-10 h-10" /> : <Plus className="text-blue-400 w-10 h-10" />}
                </div>
                <h4 className="text-2xl font-black text-white mb-2 uppercase tracking-tighter">
                    {activeChannel ? `Welcome to #${activeChannel.name}` : `Conversation with ${activeDMUser?.username}`}
                </h4>
                <p className="text-slate-500 max-w-sm font-medium">This is the start of your message history. Stay safe and enjoy!</p>
                <div className="w-full h-px bg-gradient-to-r from-transparent via-white/5 to-transparent mt-12" />
            </div>
        )}

        <AnimatePresence initial={false}>
            {messages.map((msg, i) => {
                const isSystemMessage = !msg.sender && msg.username === 'System';
                const senderName = msg.sender?.username || msg.username;
                const senderAvatar = msg.sender?.avatar || msg.avatar;
                
                // Highlight search matches
                const isMatch = searchQuery && msg.content.toLowerCase().includes(searchQuery.toLowerCase());

                return (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={msg._id || i}
                        className={`flex items-start gap-5 group relative ${isMatch ? 'bg-blue-600/5 -mx-4 px-4 py-2 rounded-2xl border border-blue-500/10' : ''}`}
                    >
                        <motion.img 
                            whileHover={{ scale: 1.1 }}
                            src={senderAvatar} 
                            alt="avatar" 
                            className="w-12 h-12 rounded-2xl border border-white/10 shadow-lg cursor-pointer" 
                        />
                        <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1.5">
                            <span className="text-white font-black text-sm hover:text-blue-400 cursor-pointer transition-colors uppercase tracking-tight">
                                {senderName}
                            </span>
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                        <div className="bg-white/[0.03] border border-white/5 rounded-2xl rounded-tl-none p-4 group-hover:bg-white/[0.05] transition-all relative">
                            <p className="text-slate-300 text-[15px] leading-relaxed break-words font-medium">{msg.content}</p>
                        </div>
                        </div>
                    </motion.div>
                );
            })}
        </AnimatePresence>
        <div ref={scrollRef} className="h-4" />
      </div>

      {/* Message Input Container */}
      <div className="px-8 pb-8 z-20">
        <form 
          onSubmit={handleSendMessage}
          className="bg-slate-950/40 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-3 shadow-2xl focus-within:border-blue-500/50 transition-all group relative"
        >
          <EmojiPicker 
            isOpen={isEmojiOpen} 
            onClose={() => setIsEmojiOpen(false)} 
            onSelect={(e) => setContent(prev => prev + e)}
          />

          <div className="flex items-end gap-3">
            <button 
                type="button" 
                className="w-12 h-12 flex items-center justify-center bg-white/5 text-slate-400 hover:text-white hover:bg-blue-600 rounded-2xl transition-all flex-shrink-0"
            >
                <Plus size={24} />
            </button>
            <div className="flex-1 min-w-0 flex flex-col py-1">
                <textarea
                    rows="1"
                    value={content}
                    onChange={handleTyping}
                    placeholder={`Message ${activeTitle || '...'}`}
                    className="w-full bg-transparent border-none outline-none text-white py-2 px-1 resize-none max-h-48 font-medium placeholder:text-slate-600"
                    onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e);
                    }
                    }}
                />
            </div>
            <div className="flex items-center gap-2 pr-1 pb-1">
                <button 
                    type="button" 
                    onClick={() => setIsEmojiOpen(!isEmojiOpen)}
                    className={`p-2.5 transition-colors rounded-xl hover:bg-white/5 ${isEmojiOpen ? 'text-blue-400 bg-white/5' : 'text-slate-500 hover:text-white'}`}
                >
                    <Smile size={22} />
                </button>
                <button
                    type="submit"
                    disabled={!content.trim()}
                    className="bg-gradient-to-tr from-blue-600 to-indigo-600 text-white w-12 h-12 rounded-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 shadow-lg shadow-blue-600/20"
                >
                    <Send size={20} />
                </button>
            </div>
          </div>
        </form>
        <div className="h-6 flex items-center px-4">
             <AnimatePresence>
                {remoteTyping && (
                    <motion.p 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }}
                        className="text-[10px] text-blue-400 font-bold uppercase tracking-widest animate-pulse"
                    >
                        {remoteTyping} is typing...
                    </motion.p>
                )}
             </AnimatePresence>
        </div>
      </div>

      {/* Add Member Modal */}
      <Modal 
        isOpen={isMemberModalOpen} 
        onClose={() => setIsMemberModalOpen(false)} 
        title="Add to Channel"
      >
        <div className="space-y-6">
             <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400" size={14} />
                <input 
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Search users by name..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-10 pr-4 text-white outline-none focus:border-blue-500/50 transition-all text-sm font-medium"
                />
             </div>

             <div className="max-h-60 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                {userResults.length > 0 ? (
                    userResults.map(u => (
                        <div key={u._id} className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/5 transition-colors group">
                             <div className="flex items-center gap-3">
                                <img src={u.avatar} className="w-8 h-8 rounded-lg" alt="avatar" />
                                <div>
                                    <p className="text-white text-sm font-bold uppercase tracking-tight">{u.username}</p>
                                    <p className="text-[10px] text-slate-500 font-medium">{u.email}</p>
                                </div>
                             </div>
                             <button 
                                onClick={() => handleAddMember(u._id)}
                                className="p-2 bg-blue-600/10 text-blue-400 rounded-lg hover:bg-blue-600 hover:text-white transition-all"
                            >
                                <UserPlus size={16} />
                             </button>
                        </div>
                    ))
                ) : userSearch && (
                    <p className="text-center text-slate-500 text-xs py-4">No users found matching your search.</p>
                )}
             </div>
        </div>
      </Modal>
    </div>
  );
};

export default ChatWindow;


