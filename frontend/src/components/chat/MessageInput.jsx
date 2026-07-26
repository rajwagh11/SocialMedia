import React, { useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { IoSend } from "react-icons/io5";
import { ChatData } from "../../context/ChatContext";
import { UserData } from "../../context/UserContext";

const MessageInput = ({ setMessages, selectedChat }) => {
  const [textMsg, setTextMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const { setChats } = ChatData();
  const { user: loggedInUser } = UserData();

  // Fix: Dynamically identify the recipient instead of hardcoding users[0]
  const receiver =
    selectedChat?.users?.find((u) => u._id !== loggedInUser?._id) ||
    selectedChat?.users?.[0];

  const handleMessage = async (e) => {
    e.preventDefault();
    if (!textMsg.trim() || !receiver?._id || loading) return;

    setLoading(true);
    try {
      const { data } = await axios.post("/api/messages", {
        message: textMsg.trim(),
        recieverId: receiver._id, // Preserved original backend spelling
      });

      setMessages((prev) => [...prev, data]);
      setTextMsg("");

      // Update latest message preview in sidebar
      setChats((prev) =>
        prev.map((chat) => {
          if (chat._id === selectedChat._id) {
            return {
              ...chat,
              latestMessage: {
                text: data.text || textMsg.trim(),
                sender: data.sender || loggedInUser?._id,
              },
            };
          }
          return chat;
        })
      );
    } catch (error) {
      console.error("Error sending message:", error);
      const msg =
        error.response?.data?.message || "Failed to send message. Try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleMessage} className="flex items-center gap-2 w-full">
      <input
        type="text"
        placeholder="Type a message..."
        disabled={loading}
        className="flex-1 bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all shadow-2xs disabled:opacity-60"
        value={textMsg}
        onChange={(e) => setTextMsg(e.target.value)}
        required
      />
      <button
        type="submit"
        disabled={loading || !textMsg.trim()}
        className="flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm shadow-sm transition-all active:scale-95 flex-shrink-0 cursor-pointer"
        aria-label="Send message"
      >
        <span>Send</span>
        <IoSend className="text-sm -rotate-45 translate-x-0.5 -translate-y-0.5" />
      </button>
    </form>
  );
};

export default MessageInput;