import React, { useState } from "react";
import AddPost from "../components/AddPost";
import { PostData } from "../context/PostContext";
import PostCard from "../components/PostCard";
import { FaArrowUp, FaArrowDownLong } from "react-icons/fa6";
import { Loading } from "../components/Loading";

const Reels = () => {
  const { reels, loading } = PostData();
  const [index, setIndex] = useState(0);

  const prevReel = () => {
    if (index === 0) return null;
    setIndex(index - 1);
  };
  const nextReel = () => {
    if (index === reels.length - 1) return null;
    setIndex(index + 1);
  };
  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-[#0f172a] to-[#0b1220] pb-20">
          <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8 py-6">
            <h1 className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-sky-300 text-3xl font-bold mb-6">
              Reels
            </h1>
            
            <div className="rounded-2xl p-0.5 bg-gradient-to-r from-indigo-500/60 via-sky-400/60 to-cyan-400/60 mb-6">
              <div className="rounded-2xl bg-white/10 backdrop-blur-md">
                <AddPost type="reel" />
              </div>
            </div>

            {reels && reels.length > 0 ? (
              <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                <div className="flex-1 max-w-md">
                  <PostCard
                    key={reels[index]._id}
                    value={reels[index]}
                    type={"reel"}
                    layout="list"
                  />
                </div>
                <div className="flex md:flex-col justify-center items-center gap-6">
                  {index !== 0 && (
                    <button
                      className="bg-gradient-to-r from-indigo-500 to-sky-400 text-white py-4 px-4 rounded-full hover:shadow-lg hover:shadow-indigo-500/50 transition-all"
                      onClick={prevReel}
                    >
                      <FaArrowUp className="text-xl" />
                    </button>
                  )}
                  {index !== reels.length - 1 && (
                    <button
                      className="bg-gradient-to-r from-indigo-500 to-sky-400 text-white py-4 px-4 rounded-full hover:shadow-lg hover:shadow-indigo-500/50 transition-all"
                      onClick={nextReel}
                    >
                      <FaArrowDownLong className="text-xl" />
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-white/60 text-lg">No reels yet. Create your first reel!</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Reels;
