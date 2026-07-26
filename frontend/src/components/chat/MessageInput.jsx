import React, { useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { ChatData } from "../../context/ChatContext";

const MessageInput = ({ setMessages, selectedChat }) => {
  const [textMsg, setTextMsg] = useState("");
  const { setChats } = ChatData();

  const handleMessage = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post("/api/messages", {
        message: textMsg,
        recieverId: selectedChat.users[0]._id,
      });

      setMessages((message) => [...message, data]);
      setTextMsg("");
      setChats((prev) => {
        const updatedChat = prev.map((chat) => {
          if (chat._id === selectedChat._id) {
            return {
              ...chat,
              latestMessage: {
                text: textMsg,
                sender: data.sender,
              },
            };
          }

          return chat;
        });

        return updatedChat;
      });

    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message);
    }
  };

  return (
    <div>
      <form onSubmit={handleMessage} className="flex gap-2">
        <input
          type="text"
          placeholder="Type a message..."
          className="flex-1 bg-white/10 backdrop-blur border border-white/20 rounded-full px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={textMsg}
          onChange={(e) => setTextMsg(e.target.value)}
          required
        />
        <button 
          type="submit" 
          className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-6 py-2 rounded-full hover:shadow-lg hover:shadow-blue-500/50 transition-all font-semibold"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
