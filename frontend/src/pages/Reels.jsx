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
        <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-900 pb-20">
          <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8 py-6">
            <h1 className="text-slate-800 dark:text-slate-100 text-2xl font-bold mb-6">
              Reels
            </h1>

            <div className="mb-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-1 shadow-sm">
              <AddPost type="reel" />
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
                      className="bg-teal-600 hover:bg-teal-500 text-white py-4 px-4 rounded-full transition-colors"
                      onClick={prevReel}
                    >
                      <FaArrowUp className="text-xl" />
                    </button>
                  )}
                  {index !== reels.length - 1 && (
                    <button
                      className="bg-teal-600 hover:bg-teal-500 text-white py-4 px-4 rounded-full transition-colors"
                      onClick={nextReel}
                    >
                      <FaArrowDownLong className="text-xl" />
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-slate-500 dark:text-slate-400 text-lg">No reels yet. Create your first reel!</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Reels;
