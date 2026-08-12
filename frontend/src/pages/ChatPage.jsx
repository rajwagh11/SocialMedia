import React, { useEffect, useState } from "react";
import { ChatData } from "../context/ChatContext";
import { UserData } from "../context/UserContext";
import axiosInstance from "../api/axiosInstance.js";
import { FaSearch } from "react-icons/fa";
import Chat from "../components/chat/Chat";
import MessageContainer from "../components/chat/MessageContainer";
import { SocketData } from "../context/SocketContext";

const ChatPage = () => {
  const { createChat, selectedChat, setSelectedChat, chats, setChats } = ChatData();
  const { user } = UserData();
  const { onlineUsers, socket } = SocketData();

  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState(false);

  const fetchAllUsers = async () => {
    try {
      const { data } = await axiosInstance.get("/user/all?search=" + query, {
        withCredentials: true,
      });
      setUsers(data);
    } catch (error) {
      console.log("Error fetching users:", error);
    }
  };

  const getAllChats = async () => {
    try {
      const { data } = await axiosInstance.get("/messages/chats", {
        withCredentials: true,
      });
      setChats(data);
    } catch (error) {
      console.log("Error fetching chats:", error);
    }
  };

  useEffect(() => {
    fetchAllUsers();
  }, [query]);

  useEffect(() => {
    getAllChats();
  }, []);

  const createNewChat = async (id) => {
    await createChat(id);
    setSearch(false);
    getAllChats();
  };

  return (
    <div className="h-[calc(100vh-5rem)] w-full bg-slate-50 dark:bg-slate-900 overflow-hidden flex flex-col">
      <div className="max-w-7xl mx-auto w-full px-4 md:px-6 lg:px-8 py-6 flex-1 flex flex-col min-h-0">
        <h1 className="text-slate-800 dark:text-slate-100 text-2xl font-bold mb-6 flex-shrink-0">
          Messages
        </h1>
        <div className="flex gap-4 flex-1 min-h-0">
          <div className="w-full md:w-[35%] rounded-2xl overflow-hidden bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col min-h-0">
            <div className="p-4 border-b border-slate-200/80 dark:border-slate-700/60 flex-shrink-0">
              <button
                className="bg-teal-600 hover:bg-teal-500 text-white px-4 py-2 rounded-full transition-colors"
                onClick={() => setSearch(!search)}
              >
                {search ? "✕ Close" : <><FaSearch className="inline mr-2" /> New Chat</>}
              </button>
            </div>

            {search ? (
              <div className="p-4 flex-1 flex flex-col min-h-0">
                <input
                  type="text"
                  className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/60 rounded-lg px-4 py-2 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/40 flex-shrink-0"
                  placeholder="Search users..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />

                <div className="users mt-4 space-y-2 flex-1 overflow-y-auto min-h-0">
                  {users.length > 0 ? (
                    users.map((e) => (
                      <div
                        key={e._id}
                        onClick={() => createNewChat(e._id)}
                        className="bg-slate-50 hover:bg-teal-50 dark:bg-slate-900/40 dark:hover:bg-slate-900/70 text-slate-800 dark:text-slate-100 p-3 cursor-pointer flex items-center gap-3 rounded-lg border border-slate-200/80 dark:border-slate-700/60 transition-colors"
                      >
                        <img
                          src={
                            e.profilePic?.url ||
                            "https://ui-avatars.com/api/?name=" + encodeURIComponent(e.name)
                          }
                          className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700"
                          alt="Profile"
                        />
                        <span className="font-medium">{e.name}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-500 dark:text-slate-400 text-center py-4">No Users Found</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col mt-2 flex-1 overflow-y-auto min-h-0">
                {chats.length > 0 ? (
                  chats.map((chat) => {
                    const otherUser = chat.users.find((u) => u._id !== user._id);
                    const isOnline = onlineUsers.includes(otherUser?._id);
                    return (
                      <Chat
                        key={chat._id}
                        chat={chat}
                        setSelectedChat={setSelectedChat}
                        isOnline={isOnline}
                      />
                    );
                  })
                ) : (
                  <p className="text-slate-500 dark:text-slate-400 text-center py-8">No chats yet. Start a new conversation!</p>
                )}
              </div>
            )}
          </div>

          {selectedChat === null ? (
            <div className="flex-1 flex items-center justify-center rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 min-h-0">
              <div className="text-center">
                <div className="text-6xl mb-4">👋</div>
                <h2 className="text-slate-800 dark:text-slate-100 text-2xl font-bold mb-2">
                  Hello {user.name}!
                </h2>
                <p className="text-slate-500 dark:text-slate-400">Select a chat to start conversation</p>
              </div>
            </div>
          ) : (
            <div className="flex-1 min-h-0">
              <MessageContainer selectedChat={selectedChat} setChats={setChats} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
