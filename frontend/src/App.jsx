import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { UserData } from "./context/UserContext";

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
    <>
      {loading ? (
        <Loading />
      ) : (
        <BrowserRouter>
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
            <Route path="/search" element={isAuth?<Search/>:<Login/>}></Route>
            <Route path="/chat" element={isAuth?<ChatPage/>:<Login/>}></Route>
          </Routes>

          {isAuth && <NavigationBar />}
        </BrowserRouter>
      )}

      <Toaster position="top-center" reverseOrder={false} />
    </>
  );
};

export default App;
