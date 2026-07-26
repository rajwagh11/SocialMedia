import React, { useState } from "react";
import { Link } from "react-router-dom";
import { AiOutlineHome, AiFillHome } from "react-icons/ai";
import { BsCameraReelsFill, BsCameraReels } from "react-icons/bs";
import { IoSearchCircleOutline, IoSearchCircle } from "react-icons/io5";
import {
  IoChatbubbleEllipses,
  IoChatbubbleEllipsesOutline,
} from "react-icons/io5";
import { RiAccountCircleFill, RiAccountCircleLine } from "react-icons/ri";

const NavigationBar = () => {
  const [tab, setTab] = useState(window.location.pathname);
  return (
    <div className="fixed bottom-0 w-full z-50">
      <div className="bg-gradient-to-t from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-xl border-t border-white/10 shadow-2xl">
        <div className="flex justify-around items-center py-3 px-2">
          <Link
            to={"/"}
            onClick={() => setTab("/")}
            className={`flex flex-col items-center text-2xl transition-all duration-200 ${
              tab === "/"
                ? "text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-400 scale-110"
                : "text-white/60 hover:text-white/90"
            }`}
          >
            <span>{tab === "/" ? <AiFillHome /> : <AiOutlineHome />}</span>
            {tab === "/" && <div className="w-1 h-1 rounded-full bg-gradient-to-r from-blue-500 to-indigo-400 mt-0.5" />}
          </Link>
          <Link
            to={"/reels"}
            onClick={() => setTab("/reels")}
            className={`flex flex-col items-center text-2xl transition-all duration-200 ${
              tab === "/reels"
                ? "text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-sky-300 scale-110"
                : "text-white/60 hover:text-white/90"
            }`}
          >
            <span>
              {tab === "/reels" ? <BsCameraReelsFill /> : <BsCameraReels />}
            </span>
            {tab === "/reels" && <div className="w-1 h-1 rounded-full bg-gradient-to-r from-indigo-400 to-sky-300 mt-0.5" />}
          </Link>
          <Link
            onClick={() => setTab("/search")}
            to={"/search"}
            className={`flex flex-col items-center text-2xl transition-all duration-200 ${
              tab === "/search"
                ? "text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300 scale-110"
                : "text-white/60 hover:text-white/90"
            }`}
          >
            <span>
              {tab === "/search" ? <IoSearchCircle /> : <IoSearchCircleOutline />}
            </span>
            {tab === "/search" && <div className="w-1 h-1 rounded-full bg-gradient-to-r from-emerald-400 to-teal-300 mt-0.5" />}
          </Link>
          <Link
            onClick={() => setTab("/chat")}
            to={"/chat"}
            className={`flex flex-col items-center text-2xl transition-all duration-200 ${
              tab === "/chat"
                ? "text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-400 scale-110"
                : "text-white/60 hover:text-white/90"
            }`}
          >
            <span>
              {tab === "/chat" ? (
                <IoChatbubbleEllipses />
              ) : (
                <IoChatbubbleEllipsesOutline />
              )}
            </span>
            {tab === "/chat" && <div className="w-1 h-1 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 mt-0.5" />}
          </Link>
          <Link
            onClick={() => setTab("/account")}
            to={"/account"}
            className={`flex flex-col items-center text-2xl transition-all duration-200 ${
              tab === "/account"
                ? "text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-300 scale-110"
                : "text-white/60 hover:text-white/90"
            }`}
          >
            <span>
              {tab === "/account" ? (
                <RiAccountCircleFill />
              ) : (
                <RiAccountCircleLine />
              )}
            </span>
            {tab === "/account" && <div className="w-1 h-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-300 mt-0.5" />}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NavigationBar;