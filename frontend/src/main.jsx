import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { UserContextProvider } from "./context/UserContext";
import { PostContextProvider } from "./context/PostContext";
import { ChatContextProvider } from "./context/ChatContext.jsx";
import "./index.css";
import { SocketContextProvider } from "./context/SocketContext.jsx";
import axios from "axios";

// Configure axios to send cookies with requests
axios.defaults.withCredentials = true;

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <UserContextProvider>
      <PostContextProvider>
          <ChatContextProvider>
              <SocketContextProvider>
                 <App />
              </SocketContextProvider>
          </ChatContextProvider>
      </PostContextProvider>
    </UserContextProvider>
  </React.StrictMode>
);
