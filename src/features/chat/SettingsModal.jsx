import React, { useState } from 'react';
import { RefreshCw, User, Mail, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import Modal from '../../components/Modal';

const SettingsModal = ({ isOpen, onClose, user, onUpdate }) => {
  const [formData, setFormData] = useState({
    username: user.username,
    bio: user.bio || '',
    avatar: user.avatar
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const randomizeAvatar = () => {
    const seed = Math.random().toString(36).substring(7);
    setFormData({ 
        ...formData, 
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}` 
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to update profile');
      }

      setSuccess(true);
      if (onUpdate) onUpdate({ ...data, token: user.token });
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="User Settings">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Avatar Section */}
        <div className="flex flex-col items-center gap-4">
            <div className="relative group">
                <img 
                    src={formData.avatar} 
                    alt="avatar" 
                    className="w-24 h-24 rounded-3xl border-2 border-white/10 shadow-2xl group-hover:border-blue-500/50 transition-all" 
                />
                <button 
                  type="button"
                  onClick={randomizeAvatar}
                  className="absolute -bottom-2 -right-2 w-10 h-10 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/40 hover:scale-110 active:scale-95 transition-all"
                >
                    <RefreshCw size={18} />
                </button>
            </div>
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Click icon to randomize look</p>
        </div>

        {/* Form Fields */}
        <div className="space-y-5">
            <div className="space-y-2">
                <label className="text-[10px] text-slate-500 uppercase font-black tracking-widest ml-1 flex items-center gap-2">
                    <User size={12} /> Username
                </label>
                <input 
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-blue-500/50 transition-all font-medium"
                />
            </div>

            <div className="space-y-2">
                <label className="text-[10px] text-slate-500 uppercase font-black tracking-widest ml-1 flex items-center gap-2">
                    <FileText size={12} /> Bio
                </label>
                <textarea 
                    rows="3"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Tell us about yourself..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-blue-500/50 transition-all font-medium resize-none"
                />
            </div>
        </div>

        {/* Feedback */}
        {error && (
            <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-xs font-bold uppercase tracking-tight">
                <AlertCircle size={16} /> {error}
            </div>
        )}
        {success && (
            <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-500 text-xs font-bold uppercase tracking-tight">
                <CheckCircle2 size={16} /> Profile updated successfully!
            </div>
        )}

        <button 
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black uppercase tracking-widest py-4 rounded-2xl shadow-lg shadow-blue-500/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
        >
            {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </Modal>
  );
};

export default SettingsModal;
