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
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-[#0f172a] to-[#0b1220] pb-20">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6">
        <h1 className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-400 text-3xl font-bold mb-6">
          Messages
        </h1>
        <div className="flex gap-4 h-[calc(100vh-180px)]">
          <div className="w-full md:w-[35%] rounded-2xl overflow-hidden bg-white/5 backdrop-blur border border-white/10 shadow-xl">
            <div className="p-4 bg-gradient-to-r from-blue-500/20 via-indigo-500/20 to-cyan-500/20 border-b border-white/10">
              <button
                className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-2 rounded-full hover:shadow-lg hover:shadow-blue-500/50 transition-all"
                onClick={() => setSearch(!search)}
              >
                {search ? "✕ Close" : <><FaSearch className="inline mr-2" /> New Chat</>}
              </button>
            </div>

            {search ? (
              <div className="p-4">
                <input
                  type="text"
                  className="w-full bg-white/10 backdrop-blur border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Search users..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />

                <div className="users mt-4 space-y-2 max-h-[500px] overflow-y-auto">
                  {users.length > 0 ? (
                    users.map((e) => (
                      <div
                        key={e._id}
                        onClick={() => createNewChat(e._id)}
                        className="bg-gradient-to-r from-blue-500/20 to-indigo-500/20 hover:from-blue-500/30 hover:to-indigo-500/30 text-white p-3 cursor-pointer flex items-center gap-3 rounded-lg border border-white/10 transition-all"
                      >
                        <img
                          src={
                            e.profilePic?.url ||
                            "https://ui-avatars.com/api/?name=" + encodeURIComponent(e.name)
                          }
                          className="w-10 h-10 rounded-full border-2 border-white/20"
                          alt="Profile"
                        />
                        <span className="font-medium">{e.name}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-white/60 text-center py-4">No Users Found</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col mt-2 max-h-[600px] overflow-y-auto">
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
                  <p className="text-white/60 text-center py-8">No chats yet. Start a new conversation!</p>
                )}
              </div>
            )}
          </div>

          {selectedChat === null ? (
            <div className="flex-1 flex items-center justify-center rounded-2xl bg-white/5 backdrop-blur border border-white/10">
              <div className="text-center">
                <div className="text-6xl mb-4">👋</div>
                <h2 className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-400 text-2xl font-bold mb-2">
                  Hello {user.name}!
                </h2>
                <p className="text-white/70">Select a chat to start conversation</p>
              </div>
            </div>
          ) : (
            <div className="flex-1">
              <MessageContainer selectedChat={selectedChat} setChats={setChats} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
