import React from "react";
import { useNavigate } from "react-router-dom";
import { HiOutlineHome, HiOutlineExclamationTriangle } from "react-icons/hi2";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      <div className="max-w-md w-full text-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
        
        {/* Glowing 404 / Icon Badge */}
        <div className="relative inline-flex items-center justify-center">
          <div className="absolute inset-0 bg-indigo-500/20 dark:bg-indigo-400/10 blur-xl rounded-full animate-pulse" />
          <div className="relative flex items-center justify-center w-20 h-20 bg-indigo-50 dark:bg-slate-800/80 border border-indigo-100 dark:border-slate-700/80 rounded-3xl shadow-sm text-indigo-600 dark:text-indigo-400">
            <HiOutlineExclamationTriangle className="text-4xl" />
          </div>
        </div>

        {/* Text Content */}
        <div className="space-y-2">
          <p className="text-xs font-semibold tracking-wider text-indigo-600 dark:text-indigo-400 uppercase">
            404 Error
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
            Page not found
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
            Sorry, we couldn&apos;t find the page you&apos;re looking for. It might have been removed, renamed, or doesn&apos;t exist.
          </p>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl shadow-sm hover:shadow-md hover:shadow-indigo-500/20 transition-all duration-200 active:scale-95 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
          >
            <HiOutlineHome className="text-lg" />
            <span>Return to Homepage</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default NotFound;