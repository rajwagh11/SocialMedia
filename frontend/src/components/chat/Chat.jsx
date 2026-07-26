import React from "react";
import { UserData } from "../../context/UserContext";
import { BsSendCheck } from "react-icons/bs";

const Chat = ({ chat, setSelectedChat, isOnline }) => {
  const { user: loggedInUser } = UserData();
  const user = chat?.users.find(u => u._id !== loggedInUser._id);
  return (
    <div>
      {user && (
        <div
          className="bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-cyan-500/10 hover:from-blue-500/20 hover:via-indigo-500/20 hover:to-cyan-500/20 py-3 px-4 rounded-lg cursor-pointer mx-2 my-2 border border-white/10 transition-all"
          onClick={() => setSelectedChat(chat)}
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              {isOnline && (
                <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full border-2 border-slate-900 shadow-lg"></div>
              )}
              <img
                src={
                  user.profilePic?.url ||
                  "https://ui-avatars.com/api/?name=" + encodeURIComponent(user.name)
                }
                onError={(e) => {
                  e.target.src = "https://ui-avatars.com/api/?name=" + encodeURIComponent(user.name);
                }}
                className="w-12 h-12 rounded-full border-2 border-white/20"
                alt="Profile"
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-white font-semibold truncate">{user.name}</span>
              </div>
              <span className="flex items-center gap-1 text-white/70 text-sm truncate">
                {loggedInUser._id === chat.latestMessage.sender && (
                  <BsSendCheck className="text-emerald-400" />
                )}
                {chat.latestMessage?.text?.slice(0, 25) || "No messages yet"}...
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;