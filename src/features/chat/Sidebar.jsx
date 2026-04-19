import React, { useState } from 'react';
import { Hash, Settings, LogOut, Plus, ChevronDown, Radio } from 'lucide-react';
import Modal from '../../components/Modal';
import SettingsModal from './SettingsModal';

const Sidebar = ({ channels, activeChannel, setActiveChannel, users, activeDMUser, setActiveDMUser, unreadCounts, user, logout, refreshChannels, onUpdateUser }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [newChannel, setNewChannel] = useState({ name: '', description: '', isPrivate: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCreateChannel = async (e) => {
    e.preventDefault();
    if (!newChannel.name) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/channels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(newChannel)
      });
      const data = await res.json();

      if (res.ok) {
        setIsModalOpen(false);
        setNewChannel({ name: '', description: '', isPrivate: false });
        if (refreshChannels) refreshChannels(data);
      } else {
        setError(data.message || 'Failed to create channel');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-80 bg-slate-950 flex flex-col border-r border-white/5 h-screen transition-all select-none">
      {/* Workspace Header */}
      <div className="p-6 mb-2 flex items-center justify-between group cursor-pointer hover:bg-white/[0.02] transition-colors">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 text-white font-black text-xl">
                Q
            </div>
            <div>
                <h2 className="text-lg font-bold text-white leading-tight">QuickChat</h2>
                <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Pro Workspace</span>
                </div>
            </div>
        </div>
        <ChevronDown className="w-4 h-4 text-slate-500 group-hover:text-slate-300 transition-colors" />
      </div>

      {/* Lists */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-8">
        {/* Channels List */}
        <div>
            <div className="px-3 mb-3 flex items-center justify-between text-slate-500 uppercase text-[10px] font-black tracking-[0.2em]">
                <span>Text Channels</span>
                <Plus 
                    className="w-4 h-4 cursor-pointer hover:text-white transition-colors" 
                    onClick={() => setIsModalOpen(true)}
                />
            </div>
            
            <div className="space-y-1">
            {channels.map((channel) => (
                <button
                key={channel._id}
                onClick={() => setActiveChannel(channel)}
                className={`w-full group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                    activeChannel?._id === channel._id 
                    ? 'bg-blue-600/10 text-blue-400 shadow-[inset_0_0_20px_rgba(59,130,246,0.05)]' 
                    : 'text-slate-400 hover:bg-white/[0.03] hover:text-slate-200'
                }`}
                >
                <div className={`flex items-center justify-center w-5 h-5 ${activeChannel?._id === channel._id ? 'text-blue-400' : 'text-slate-600 group-hover:text-slate-400'}`}>
                    <Hash className="w-4 h-4" />
                </div>
                <span className="font-semibold text-sm truncate">{channel.name}</span>
                {activeChannel?._id === channel._id ? (
                    <div className="ml-auto w-1.5 h-1.5 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
                ) : unreadCounts[channel._id] > 0 && (
                    <div className="ml-auto min-w-[1.25rem] h-5 px-1.5 bg-blue-600 rounded-full flex items-center justify-center text-[10px] font-black text-white shadow-lg shadow-blue-500/20">
                        {unreadCounts[channel._id]}
                    </div>
                )}
                </button>
            ))}
            </div>
        </div>

        {/* Direct Messages List */}
        <div>
            <div className="px-3 mb-3 flex items-center justify-between text-slate-500 uppercase text-[10px] font-black tracking-[0.2em]">
                <span>Direct Messages</span>
                <Plus className="w-4 h-4 cursor-pointer hover:text-white transition-colors" />
            </div>
            
            <div className="space-y-1">
            {users.map((u) => (
                <button
                key={u._id}
                onClick={() => setActiveDMUser(u)}
                className={`w-full group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                    activeDMUser?._id === u._id 
                    ? 'bg-blue-600/10 text-blue-400 shadow-[inset_0_0_20px_rgba(59,130,246,0.05)]' 
                    : 'text-slate-400 hover:bg-white/[0.03] hover:text-slate-200'
                }`}
                >
                <div className="relative">
                    <img src={u.avatar} alt="avatar" className="w-6 h-6 rounded-lg opacity-80 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-500 border-2 border-slate-950 rounded-full" />
                </div>
                <span className="font-semibold text-sm truncate">{u.username}</span>
                {activeDMUser?._id === u._id ? (
                    <div className="ml-auto w-1.5 h-1.5 bg-blue-500 rounded-full shadow-[0_0_10_rgba(59,130,246,0.8)]" />
                ) : unreadCounts[u._id] > 0 && (
                    <div className="ml-auto min-w-[1.25rem] h-5 px-1.5 bg-blue-600 rounded-full flex items-center justify-center text-[10px] font-black text-white shadow-lg shadow-blue-500/20">
                        {unreadCounts[u._id]}
                    </div>
                )}
                </button>
            ))}
            </div>
        </div>
      </div>

      {/* New Channel Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Create Channel"
      >
        <form onSubmit={handleCreateChannel} className="space-y-6">
            <div className="space-y-2">
                <label className="text-[10px] text-slate-500 uppercase font-black tracking-widest ml-1">Channel Name</label>
                <input 
                    type="text"
                    required
                    value={newChannel.name}
                    onChange={(e) => setNewChannel({ ...newChannel, name: e.target.value })}
                    placeholder="e.g. general-chat"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-blue-500/50 transition-all font-medium"
                />
            </div>
            <div className="space-y-2">
                <label className="text-[10px] text-slate-500 uppercase font-black tracking-widest ml-1">Description (Optional)</label>
                <textarea 
                    rows="3"
                    value={newChannel.description}
                    onChange={(e) => setNewChannel({ ...newChannel, description: e.target.value })}
                    placeholder="What is this channel about?"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-blue-500/50 transition-all font-medium resize-none"
                />
            </div>
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                <div className="flex items-center gap-3">
                    <Radio className={`w-5 h-5 ${newChannel.isPrivate ? 'text-blue-500' : 'text-slate-600'}`} />
                    <div>
                        <p className="text-white text-sm font-bold">Private Channel</p>
                        <p className="text-[10px] text-slate-500">Only invited members can view</p>
                    </div>
                </div>
                <button 
                    type="button"
                    onClick={() => setNewChannel({ ...newChannel, isPrivate: !newChannel.isPrivate })}
                    className={`w-10 h-6 rounded-full relative transition-all ${newChannel.isPrivate ? 'bg-blue-600' : 'bg-slate-700'}`}
                >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${newChannel.isPrivate ? 'left-5' : 'left-1'}`} />
                </button>
            </div>
            
            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-xs font-bold uppercase tracking-tight text-center">
                    {error}
                </div>
            )}

            <button 
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black uppercase tracking-widest py-4 rounded-2xl shadow-lg shadow-blue-500/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
            >
                {loading ? 'Creating...' : 'Create Channel'}
            </button>
        </form>
      </Modal>

      {/* User Footer */}

      <div className="p-4 mt-auto">
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex items-center gap-4 hover:bg-white/[0.04] transition-all group">
          <div className="relative">
            <img src={user?.avatar} alt="avatar" className="w-12 h-12 rounded-2xl border-2 border-white/10 shadow-xl" />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-4 border-slate-950 rounded-full" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white truncate group-hover:text-blue-400 transition-colors uppercase tracking-tight">{user?.username}</p>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Active Now</p>
          </div>
          <div className="flex gap-1">
             <button 
                onClick={() => setIsSettingsOpen(true)}
                className="p-2 text-slate-500 hover:text-white transition-colors"
                title="Settings"
             >
                <Settings className="w-4 h-4" />
             </button>
             <button 
                onClick={logout}
                className="p-2 text-slate-500 hover:text-red-400 transition-colors"
                title="Logout"
            >
                <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        user={user} 
        onUpdate={onUpdateUser}
      />
    </div>
  );
};

export default Sidebar;

