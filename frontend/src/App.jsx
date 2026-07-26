import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { UserData } from "./context/UserContext";
import { ThemeProvider } from "./context/ThemeContext";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Account from "./pages/Account";
import Reels from "./pages/Reels";
import UserAccount from "./pages/UserAccount";  
import NavigationBar from "./components/NavigationBar";
import NotFound from "./components/NotFound";
import { Loading } from "./components/Loading";
import Search from "./pages/Search";
import ChatPage from "./pages/ChatPage";
import { SocketData } from "./context/SocketContext";

const App = () => {
  const { loading, isAuth, user } = UserData();

  return (
    <ThemeProvider>
      {/* Outer master wrapper ensuring full-screen theme consistency */}
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 transition-colors duration-300 font-sans antialiased">
        {loading ? (
          <Loading />
        ) : (
          <BrowserRouter>
            {/* Content wrapper: pb-20 prevents bottom NavigationBar from covering feed items/chat */}
            <div className={isAuth ? "pb-20" : ""}>
              <Routes>
                <Route path="/" element={isAuth ? <Home /> : <Login />} />
                <Route path="/reels" element={isAuth ? <Reels /> : <Login />} />
                <Route
                  path="/account"
                  element={isAuth ? <Account user={user} /> : <Login />}
                />
                <Route
                  path="/user/:id"
                  element={isAuth ? <UserAccount /> : <Login />}
                />
                <Route path="/login" element={!isAuth ? <Login /> : <Home />} />
                <Route path="/register" element={<Register />} />
                <Route path="*" element={<NotFound />} />
                <Route
                  path="/search"
                  element={isAuth ? <Search /> : <Login />}
                />
                <Route
                  path="/chat"
                  element={isAuth ? <ChatPage /> : <Login />}
                />
              </Routes>
            </div>

            {/* Bottom navigation bar rendered only when logged in */}
            {isAuth && <NavigationBar />}
          </BrowserRouter>
        )}

        {/* Customized eye-soothing toast notifications */}
        <Toaster
          position="top-center"
          reverseOrder={false}
          toastOptions={{
            duration: 3000,
            style: {
              background: "rgba(15, 23, 42, 0.85)",
              color: "#f8fafc",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(51, 65, 85, 0.7)",
              borderRadius: "1rem",
              fontSize: "0.875rem",
              boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.15)",
            },
            success: {
              iconTheme: {
                primary: "#10b981",
                secondary: "#f8fafc",
              },
            },
            error: {
              iconTheme: {
                primary: "#ef4444",
                secondary: "#f8fafc",
              },
            },
          }}
        />
      </div>
    </ThemeProvider>
  );
};

export default App;