import axios from "axios";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { HiUsers, HiXMark } from "react-icons/hi2";
import { FiSearch } from "react-icons/fi";
import { LoadingAnimation } from "./Loading";

const UsersSideBar = () => {
  const [users, setUsers] = useState([]);
  const [showSidebar, setShowSidebar] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchAllUsers = async () => {
    if (showSidebar) {
      setShowSidebar(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await axios.get("/api/user/all", { withCredentials: true });
      const data = res.data;
      console.log("API Response:", data);
      setUsers(Array.isArray(data) ? data : []);
      setShowSidebar(true);
    } catch (err) {
      setError(err.response?.data?.message || "Server error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Filter users in real-time based on search query
  const filteredUsers = users.filter((user) =>
    user.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* Trigger Button */}
      <div className="relative inline-block">
        <button
          onClick={fetchAllUsers}
          disabled={loading}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white shadow-sm transition-all duration-200 disabled:opacity-60 whitespace-nowrap cursor-pointer"
          type="button"
        >
          {loading ? (
            <LoadingAnimation />
          ) : (
            <>
              <HiUsers className="text-base" />
              <span>{showSidebar ? "Hide Users" : "Show All Users"}</span>
            </>
          )}
        </button>

        {/* Error notification message */}
        {error && (
          <p className="mt-1 text-xs text-rose-500 font-medium px-1">
            {error}
          </p>
        )}
      </div>

      {/* Backdrop Overlay (closes sidebar when clicking outside) */}
      {showSidebar && (
        <div
          onClick={() => setShowSidebar(false)}
          className="fixed inset-0 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-xs z-40 transition-opacity duration-300"
          aria-hidden="true"
        />
      )}

      {/* Slide-over Drawer */}
      <aside
        className={`fixed top-0 right-0 z-50 h-full w-80 max-w-[85vw] bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-l border-slate-200/80 dark:border-slate-800/80 shadow-2xl transition-transform duration-300 ease-out flex flex-col ${
          showSidebar ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2">
            <HiUsers className="text-indigo-600 dark:text-indigo-400 text-lg" />
            <h2 className="text-slate-800 dark:text-slate-100 font-semibold text-sm">
              All Members
            </h2>
            <span className="text-[11px] font-medium bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full border border-indigo-100 dark:border-indigo-900/50">
              {users.length}
            </span>
          </div>

          <button
            onClick={() => setShowSidebar(false)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close sidebar"
            type="button"
          >
            <HiXMark className="text-lg" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-3.5 border-b border-slate-100 dark:border-slate-800/50">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search members..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-800/60 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 placeholder-slate-400 transition-all"
            />
          </div>
        </div>

        {/* Users List Container */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <Link
                key={user._id}
                to={`/user/${user._id}`}
                onClick={() => setShowSidebar(false)}
                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-100/80 dark:hover:bg-slate-800/60 transition-all duration-200 group"
              >
                <img
                  src={user.profilePic?.url || "/default-avatar.png"}
                  alt={user.name || "User avatar"}
                  className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700/80 group-hover:ring-indigo-500/50 transition-all"
                  onError={(e) => {
                    e.target.src = "/default-avatar.png";
                  }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                    {user.name || "Unnamed User"}
                  </p>
                  {user.email && (
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
                      {user.email}
                    </p>
                  )}
                </div>
              </Link>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-center px-4">
              <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                {searchQuery ? "No members match your search" : "No users found"}
              </p>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default UsersSideBar;