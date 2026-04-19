import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageSquare, Bell } from 'lucide-react';

const NotificationToast = ({ notifications, removeNotification }) => {
  return (
    <div className="fixed top-6 right-6 z-[100] flex flex-col gap-3 w-80 pointer-events-none">
      <AnimatePresence>
        {notifications.map((notif) => (
          <motion.div
            key={notif.id}
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.95 }}
            className="pointer-events-auto group relative bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-2xl p-4 shadow-2xl overflow-hidden"
          >
            <div className="absolute inset-0 bg-blue-500/5 group-hover:bg-blue-500/10 transition-colors" />

            <div className="relative flex gap-4">
              <div className="relative flex-shrink-0">
                <img
                  src={notif.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"}
                  alt="avatar"
                  className="w-10 h-10 rounded-xl border border-white/10"
                />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center border-2 border-slate-900">
                  <MessageSquare size={8} className="text-white" />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <p className="text-sm font-black text-white truncate uppercase tracking-tight">{notif.senderName}</p>
                  <button
                    onClick={() => removeNotification(notif.id)}
                    className="text-slate-500 hover:text-white transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
                <p className="text-xs text-slate-400 font-medium truncate leading-relaxed">
                  {notif.content}
                </p>
                <p className="text-[10px] text-blue-400/60 font-black uppercase tracking-widest mt-1">
                  New Message
                </p>
              </div>
            </div>

            {/* Progress Bar (Visual only for now) */}
            <div className="absolute bottom-0 left-0 h-0.5 bg-blue-500/30 w-full" />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default NotificationToast;
