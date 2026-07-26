import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { UserData } from "./UserContext";

const EndPoint = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'; 

const SocketContext = createContext(); 

export const SocketContextProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const { user } = UserData();

  useEffect(() => {
    if (!user) return;

    const socket = io(EndPoint, {
      query: {
        userId: user._id,
      },
    });

    setSocket(socket);

    socket.on("getOnlineUser", (users) => {
      setOnlineUsers(users);
    });

    return () => socket && socket.close();
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};

export const SocketData = () => useContext(SocketContext);
