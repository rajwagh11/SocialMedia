import React from "react";
import { UserData } from "../../context/UserContext";
import { BsSendCheck } from "react-icons/bs";

const Chat = ({ chat, setSelectedChat, isOnline }) => {
  const { user: loggedInUser } = UserData();
  const user = chat?.users?.find((u) => u._id !== loggedInUser?._id);

  if (!user) return null;

  // Safe optional chaining prevents crashes when a conversation has zero messages
  const isMyMessage = loggedInUser?._id === chat?.latestMessage?.sender;
  const messageText = chat?.latestMessage?.text;

  return (
    <div
      onClick={() => setSelectedChat(chat)}
      className="group relative flex items-center gap-3 p-3.5 mx-2 my-1.5 rounded-2xl bg-white/85 hover:bg-slate-100/80 dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200/70 dark:border-slate-700/50 shadow-2xs hover:shadow-sm transition-all duration-200 cursor-pointer active:scale-[0.98]"
      role="button"
      tabIndex={0}
    >
      {/* Avatar & Online Status Badge */}
      <div className="relative flex-shrink-0">
        <img
          src={
            user.profilePic?.url ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=6366f1&color=fff`
          }
          onError={(e) => {
            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=6366f1&color=fff`;
          }}
          className="w-12 h-12 rounded-full object-cover ring-2 ring-slate-200/80 dark:ring-slate-700/80 group-hover:ring-indigo-500/50 transition-all"
          alt={user.name}
        />
        {isOnline && (
          <span
            className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 dark:bg-emerald-400 rounded-full border-2 border-white dark:border-slate-800 shadow-xs"
            title="Online"
          />
        )}
      </div>

      {/* User Name & Latest Message Preview */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
            {user.name}
          </h4>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          {isMyMessage && (
            <BsSendCheck
              className="text-indigo-600 dark:text-indigo-400 text-sm flex-shrink-0"
              title="Sent by you"
            />
          )}
          <p className="truncate">
            {messageText ? (
              messageText
            ) : (
              <span className="italic opacity-75">No messages yet</span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Chat;