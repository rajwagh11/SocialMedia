import React from "react";
import { Link, useLocation } from "react-router-dom"; // Switched useState for useLocation
import { AiOutlineHome, AiFillHome } from "react-icons/ai";
import { BsCameraReelsFill, BsCameraReels } from "react-icons/bs";
import { IoSearchCircleOutline, IoSearchCircle } from "react-icons/io5";
import {
  IoChatbubbleEllipses,
  IoChatbubbleEllipsesOutline,
} from "react-icons/io5";
import { RiAccountCircleFill, RiAccountCircleLine } from "react-icons/ri";

const NavigationBar = () => {
  // Fix: Reactively track the current URL path to highlight the correct icon automatically
  const location = useLocation();
  const currentPath = location.pathname;

  // Cleanly organizing your existing routes and icons for maintainability
  const navItems = [
    {
      path: "/",
      label: "Home",
      activeIcon: <AiFillHome />,
      inactiveIcon: <AiOutlineHome />,
      activeColor: "text-indigo-600 dark:text-indigo-400",
      dotColor: "bg-indigo-600 dark:bg-indigo-400",
    },
    {
      path: "/reels",
      label: "Reels",
      activeIcon: <BsCameraReelsFill />,
      inactiveIcon: <BsCameraReels />,
      activeColor: "text-sky-600 dark:text-sky-400",
      dotColor: "bg-sky-600 dark:bg-sky-400",
    },
    {
      path: "/search",
      label: "Search",
      activeIcon: <IoSearchCircle />,
      inactiveIcon: <IoSearchCircleOutline />,
      activeColor: "text-emerald-600 dark:text-emerald-400",
      dotColor: "bg-emerald-600 dark:bg-emerald-400",
    },
    {
      path: "/chat",
      label: "Chat",
      activeIcon: <IoChatbubbleEllipses />,
      inactiveIcon: <IoChatbubbleEllipsesOutline />,
      activeColor: "text-violet-600 dark:text-violet-400",
      dotColor: "bg-violet-600 dark:bg-violet-400",
    },
    {
      path: "/account",
      label: "Account",
      activeIcon: <RiAccountCircleFill />,
      inactiveIcon: <RiAccountCircleLine />,
      activeColor: "text-amber-600 dark:text-amber-400",
      dotColor: "bg-amber-600 dark:bg-amber-400",
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 ease-in-out">
      {/* Sleek, eye-soothing glassmorphic background that adapts to Light/Dark themes */}
      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-t border-slate-200/70 dark:border-slate-800/80 shadow-[0_-4px_12px_rgba(0,0,0,0.03)] dark:shadow-none transition-colors duration-300">
        
        <div className="max-w-lg mx-auto flex justify-around items-center h-16 px-4">
          {navItems.map((item) => {
            const isActive = currentPath === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`group relative flex flex-col items-center justify-center w-16 h-full transition-all duration-300 ease-in-out active:scale-95 ${
                  isActive
                    ? `${item.activeColor}`
                    : "text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                }`}
                aria-label={item.label}
              >
                {/* Visual feedback pill on hover */}
                <div className={`absolute inset-y-2 inset-x-1 rounded-2xl transition-colors duration-300 ${
                    isActive 
                    ? '' 
                    : 'group-hover:bg-slate-100 dark:group-hover:bg-slate-800/50'
                }`}/>

                {/* Icon wrapper with buttery-smooth scaling and slight lift on hover */}
                <span className={`relative z-10 text-2xl transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                    isActive ? 'scale-110 -translate-y-0.5' : 'group-hover:-translate-y-0.5'
                }`}>
                  {isActive ? item.activeIcon : item.inactiveIcon}
                </span>

                {/* Subtle active status indicator dot with slide-up animation */}
                <div
                  className={`absolute bottom-2.5 w-1.5 h-1.5 rounded-full transition-all duration-300 ease-out ${
                    isActive
                      ? `${item.dotColor} opacity-100 translate-y-0 scale-100 shadow-sm`
                      : "bg-transparent opacity-0 translate-y-1 scale-0"
                  }`}
                />
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default NavigationBar;