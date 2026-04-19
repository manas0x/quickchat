import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Heart, Smile, Coffee, Pizza, Car, Zap, Flag } from 'lucide-react';

const EMOJI_DATA = [
    { cat: 'Smilies', icon: <Smile size={14}/>, emojis: ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😮‍💨', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕'] },
    { cat: 'Hearts', icon: <Heart size={14}/>, emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟'] },
    { cat: 'Food', icon: <Pizza size={14}/>, emojis: ['🍎', '🍏', '🍐', '🍑', '🍒', '🍓', '🫐', '🥝', '🍅', '🫒', '🥥', '🥑', '🍆', '🥔', '🥕', '🌽', '🌶️', '🫑', '🥒', '🥬', '🥦', '🧄', '🧅', '🍄', '🥜', '🌰', '🍞', '🥐', '🥖', '🫓', '🥨', '🥯', '🥞', '🧇', '🧀', '🍖', '🍗', '🥩', '🥓', '🍔', '🍟', '🍕', '🌭', '🥪', '🌮', '🌯', '🫔', '🥗', '🥘', '🫕', '🥣', '🍝', '🍜', '🍲', '🍛', '🍣', '🍱', '🥟', '🍤', '🍙', '🍚', '🍘', '🍥', '🥠', '🥮', '🍢', '🍡', '🍧', '🍨', '🍦', '🥧', '🧁', '🍰', '🎂', '🍮', '🍭', '🍬', '🍫', '🍿', '🍩', '🍪', '🌰', '🥜'] },
    { cat: 'Symbols', icon: <Zap size={14}/>, emojis: ['🔥', '✨', '🌟', '💫', '💥', '💢', '💦', '💨', '⚡', '🌈', '☀️', '🌤️', '⛅', '🌥️', '☁️', '🌦️', '🌧️', '🌨️', '🌩️', '🌪️', '🌫️', '🌬️', '🌀', '🌊', '💧', '🌿', '☘️', '🍀', '🍃', '🌞', '🌝', '🌛', '🌜', '🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘', '🌙', '🌎', '🌍', '🌏', '🪐', '💫', '⭐️', '🌟', '✨'] },
];

const EmojiPicker = ({ onSelect, isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('Smilies');

  const filteredData = EMOJI_DATA.map(section => ({
    ...section,
    emojis: section.emojis.filter(e => e.includes(searchTerm) || section.cat.toLowerCase().includes(searchTerm.toLowerCase()))
  })).filter(section => section.emojis.length > 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-[60]" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="absolute bottom-20 right-0 w-80 h-96 bg-slate-900/90 backdrop-blur-3xl border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden z-[70]"
          >
            {/* Search */}
            <div className="p-4 border-b border-white/5">
                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={14} />
                    <input 
                        type="text" 
                        placeholder="Search emojis..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white/5 border border-white/5 rounded-xl py-2 pl-9 pr-4 text-xs text-white outline-none focus:border-blue-500/50 transition-all font-medium"
                    />
                </div>
            </div>

            {/* Emoji Grid */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                {filteredData.map((section) => (
                    <div key={section.cat} className="mb-6">
                        <h4 className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-3">{section.cat}</h4>
                        <div className="grid grid-cols-7 gap-1">
                            {section.emojis.map((emoji, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => {
                                        onSelect(emoji);
                                        // Optional: onClose();
                                    }}
                                    className="w-9 h-9 flex items-center justify-center text-xl hover:bg-white/10 rounded-xl transition-all hover:scale-110 active:scale-90"
                                >
                                    {emoji}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div className="p-2 border-t border-white/5 bg-slate-950/50 flex items-center justify-around">
                {EMOJI_DATA.map((tab) => (
                    <button
                        key={tab.cat}
                        onClick={() => setActiveTab(tab.cat)}
                        className={`p-2 rounded-lg transition-all ${activeTab === tab.cat ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        {tab.icon}
                    </button>
                ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default EmojiPicker;
