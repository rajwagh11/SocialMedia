import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { UserData } from "../../context/UserContext";
import { LoadingAnimation } from "../Loading";
import Message from "./Message";
import MessageInput from "./MessageInput";
import { SocketData } from "../../context/SocketContext";

const MessageContainer = ({ selectedChat, setChats }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = UserData();
  const { socket } = SocketData();

     useEffect(() => {
    socket.on("newMessage", (message) => {
      if (selectedChat._id === message.chatId) {
        setMessages((prev) => [...prev, message]);
      }

      setChats((prev) => {
        const updatedChat = prev.map((chat) => {
          if (chat._id === message.chatId) {
            return {
              ...chat,
              latestMessage: {
                text: message.text,
                sender: message.sender,
              },
            };
          }
          return chat;
        });
        return updatedChat;
      });
    });

    return () => socket.off("newMessage");
  }, [socket, selectedChat, setChats]);
  const fetchMessages = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(
        `/api/messages/${selectedChat.users[0]._id}`,
        {
          withCredentials: true,
        }
      );
      setMessages(data); // Set received messages
    } catch (error) {
      console.log("Error fetching messages:", error);
    }
    setLoading(false);
  };

  const messageContainerRef = useRef(null);
  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop =
        messageContainerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (selectedChat) {
      fetchMessages();
    }
  }, [selectedChat]);

  return (
    <div className="h-full rounded-2xl overflow-hidden bg-white/5 backdrop-blur border border-white/10 shadow-xl flex flex-col">
      <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-500/20 via-indigo-500/20 to-cyan-500/20 border-b border-white/10">
        <img
          src={selectedChat.users[0].profilePic?.url || "/default-avatar.png"}
          alt="Profile"
          className="w-12 h-12 rounded-full border-2 border-white/20"
        />
        <h2 className="text-white text-lg font-semibold">{selectedChat.users[0].name}</h2>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <LoadingAnimation />
        </div>
      ) : (
        <>
        <div ref={messageContainerRef} className="flex-1 flex flex-col gap-4 p-4 overflow-y-auto bg-gradient-to-b from-slate-900/50 to-slate-800/50">
           {messages && messages.length > 0 ? (
                messages.map((e, index) => (
                    <Message
                    key={e._id || index}
                    message={e.text}
                    ownMessage={e.sender === user._id}
                    />
                ))
           ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-white/60">No messages yet. Start the conversation!</p>
            </div>
           )}
        </div>

        <div className="p-4 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-cyan-500/10 border-t border-white/10">
          <MessageInput
            setMessages={setMessages}
            selectedChat={selectedChat}
            />
        </div>
        </>
      )}
    </div>
  );
};

export default MessageContainer;
