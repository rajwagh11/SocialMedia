import React, { useMemo, useState } from "react";
import AddPost from "../components/AddPost";
import PostCard from "../components/PostCard";
import { PostData } from "../context/PostContext";

const Home = () => {
  const { posts, loading } = PostData(); //Accesses all posts and a loading state from the PostContext.
  const [viewMode, setViewMode] = useState("grid"); // 'grid' | 'list'

  const toggleButtonBase = "px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200";
  const gridBtnClass = `${toggleButtonBase} ${viewMode === "grid" ? "bg-gradient-to-r from-blue-500 to-indigo-400 text-white shadow-md shadow-blue-200" : "bg-white/70 text-gray-700 hover:bg-white"}`;
  const listBtnClass = `${toggleButtonBase} ${viewMode === "list" ? "bg-gradient-to-r from-indigo-500 to-sky-400 text-white shadow-md shadow-sky-200" : "bg-white/70 text-gray-700 hover:bg-white"}`;

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-[#0f172a] to-[#0b1220]">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6">
        <div className="flex-1">
          <div className="rounded-2xl p-0.5 bg-gradient-to-r from-purple-500/60 via-cyan-400/60 to-emerald-400/60">
            <div className="rounded-2xl bg-white/10 backdrop-blur-md">
              <AddPost type="post" />
            </div>
          </div>

          <div className="flex items-center justify-between mt-6">
            <h2 className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-400 text-xl font-bold">
              Explore Posts
            </h2>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md p-1 rounded-full border border-white/10">
              <button className={gridBtnClass} onClick={() => setViewMode("grid")}>Grid</button>
              <button className={listBtnClass} onClick={() => setViewMode("list")}>List</button>
            </div>
          </div>

          {loading ? (
            <p className="text-white/80 mt-6">Loading...</p>
          ) : posts && posts.length > 0 ? (
            viewMode === "grid" ? (
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map((e) => (
                  <PostCard value={e} key={e._id} type="post" layout="grid" />
                ))}
              </div>
            ) : (
              <div className="mt-6 space-y-6">
                {posts.map((e) => (
                  <PostCard value={e} key={e._id} type="post" layout="list" />
                ))}
              </div>
            )
          ) : (
            <p className="text-white/80 mt-6">No Post Yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
