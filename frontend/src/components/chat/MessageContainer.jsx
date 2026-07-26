import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { UserData } from "../../context/UserContext";
import { SocketData } from "../../context/SocketContext";
import { LoadingAnimation } from "../Loading";
import Message from "./Message";
import MessageInput from "./MessageInput";

const MessageContainer = ({ selectedChat, setChats }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = UserData();
  const { socket } = SocketData();
  const messagesEndRef = useRef(null);

  // Fix: Reliably identify the chat partner instead of hardcoding index [0]
  const chatPartner =
    selectedChat?.users?.find((u) => u._id !== user?._id) || selectedChat?.users?.[0];

  useEffect(() => {
    if (!socket || !selectedChat?._id) return;

    const handleNewMessage = (message) => {
      if (selectedChat._id === message.chatId) {
        setMessages((prev) => [...prev, message]);
      }

      setChats((prev) =>
        prev.map((chat) => {
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
        })
      );
    };

    socket.on("newMessage", handleNewMessage);
    return () => socket.off("newMessage", handleNewMessage);
  }, [socket, selectedChat, setChats]);

  const fetchMessages = async () => {
    if (!chatPartner?._id) return;
    setLoading(true);
    try {
      const { data } = await axios.get(
        `/api/messages/${chatPartner._id}`,
        { withCredentials: true }
      );
      setMessages(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedChat) {
      fetchMessages();
    }
  }, [selectedChat]);

  // Smooth auto-scroll to bottom whenever messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!selectedChat) return null;

  return (
    <div className="h-full rounded-2xl overflow-hidden bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col transition-colors duration-300">
      {/* Chat Header */}
      <div className="flex items-center gap-3.5 px-5 py-3.5 bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-200/80 dark:border-slate-700/60">
        <img
          src={
            chatPartner?.profilePic?.url ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(chatPartner?.name || "User")}&background=6366f1&color=fff`
          }
          onError={(e) => {
            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(chatPartner?.name || "User")}&background=6366f1&color=fff`;
          }}
          alt="Profile"
          className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-500/20"
        />
        <div>
          <h2 className="text-slate-800 dark:text-slate-100 text-sm font-semibold leading-tight">
            {chatPartner?.name || "Unknown User"}
          </h2>
          <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
            {chatPartner?.email || "Active conversation"}
          </span>
        </div>
      </div>

      {/* Message Feed */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center bg-slate-100/40 dark:bg-slate-950/20">
          <LoadingAnimation />
        </div>
      ) : (
        <>
          <div className="flex-1 flex flex-col gap-3 p-4 overflow-y-auto bg-slate-100/50 dark:bg-slate-950/40 custom-scrollbar">
            {messages && messages.length > 0 ? (
              messages.map((e, index) => (
                <Message
                  key={e._id || index}
                  message={e.text}
                  ownMessage={e.sender === user?._id}
                />
              ))
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  No messages yet
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                  Say hello to start the conversation!
                </p>
              </div>
            )}
            {/* Invisible anchor element for smooth scrolling */}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input Area */}
          <div className="p-3.5 bg-white/50 dark:bg-slate-800/30 border-t border-slate-200/80 dark:border-slate-700/60">
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