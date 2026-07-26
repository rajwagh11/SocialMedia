import React, { useEffect, useState } from "react";
import { UserData } from "../context/UserContext";
import { PostData } from "../context/PostContext";
import PostCard from "../components/PostCard";
import { FaArrowUp, FaArrowDownLong } from "react-icons/fa6";
import axiosInstance from "../api/axiosInstance.js";
import { useParams } from "react-router-dom";
import Modal from "../components/Modal";

const UserAccount = () => {
  const { user: loggedInUser, followUser } = UserData();
  const { posts, reels } = PostData();
  const params = useParams();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState("post");
  const [viewMode, setViewMode] = useState("grid"); // 'grid' | 'list'
  const [index, setIndex] = useState(0);
  const [followed, setFollowed] = useState(false);

  const [show, setShow] = useState(false);
  const [show1, setShow1] = useState(false);

  const [followersData, setFollowersData] = useState([]);
  const [followingsData, setFollowingsData] = useState([]);

  const fetchUser = async () => {
    try {
      const { data } = await axiosInstance.get("/user/" + params.id);
      setUser(data);
    } catch (error) {
      console.error("Error fetching user:", error);
    } finally {
      setLoading(false);
    }
  };

  const followData = async () => {
    try {
      const { data } = await axiosInstance.get("/user/followdata/" + user._id);
      setFollowersData(data.followers);
      setFollowingsData(data.followings);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [params.id]);

  useEffect(() => {
    if (user && loggedInUser) {
      setFollowed(user.followers?.includes(loggedInUser._id));
    }
  }, [user, loggedInUser]);

  useEffect(() => {
    if (user) {
      followData();
    }
  }, [user]);

  const followHandler = () => {
    followUser(user._id, fetchUser);
  };

  const myPosts = posts?.filter((post) => post.owner?._id === user?._id) || [];
  const myReels = reels?.filter((reel) => reel.owner?._id === user?._id) || [];

  const nextReel = () => {
    if (index < myReels.length - 1) setIndex(index + 1);
  };

  const prevReel = () => {
    if (index > 0) setIndex(index - 1);
  };

  if (loading) return <p>Loading...</p>;
  if (!user) return <p>User not found</p>;

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-[#0f172a] to-[#0b1220]">
      <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8 pt-6 pb-12">
      {show && (
        <Modal value={followersData} title={"Followers"} setShow={setShow} />
      )}
      {show1 && (
        <Modal value={followingsData} title={"Followings"} setShow={setShow1} />
      )}

      <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
        <div className="h-40 w-full bg-gradient-to-r from-blue-600/70 via-indigo-500/70 to-cyan-500/70" />
        <div className="bg-white/5 backdrop-blur px-6 md:px-10 pb-6 pt-0">
          <div className="flex flex-col md:flex-row md:items-end gap-6 -mt-16">
            <div className="shrink-0">
              <div className="relative inline-block p-1 rounded-full bg-gradient-to-r from-blue-500 to-indigo-400">
                <img
                  src={user.profilePic?.url || "/default-avatar.png"}
                  alt="Profile"
                  className="w-[140px] h-[140px] md:w-[160px] md:h-[160px] rounded-full border-4 border-slate-900 object-cover"
                />
              </div>
            </div>
            <div className="flex-1 text-white">
              <h1 className="text-2xl md:text-3xl font-bold">{user.name}</h1>
              <p className="text-white/80">{user.email}</p>
              <p className="text-white/70 capitalize">{user.gender}</p>

              <div className="flex items-center gap-6 mt-4">
                <button onClick={() => setShow(true)} className="text-white/90 hover:text-white">
                  <span className="font-semibold">{user.followers?.length || 0}</span> Followers
                </button>
                <button onClick={() => setShow1(true)} className="text-white/90 hover:text-white">
                  <span className="font-semibold">{user.followings?.length || 0}</span> Following
                </button>
              </div>
            </div>
            {loggedInUser?._id !== user._id && (
              <div className="md:ml-auto">
                <button
                  onClick={followHandler}
                  className={`px-6 py-2 rounded-full text-white font-semibold shadow-md shadow-black/20 ${
                    followed
                      ? "bg-gradient-to-r from-red-500 to-red-600"
                      : "bg-gradient-to-r from-indigo-500 to-sky-400"
                  }`}
                >
                  {followed ? "Unfollow" : "Follow"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <div className="flex items-center gap-3 bg-white/10 backdrop-blur p-1 rounded-full border border-white/10">
          <button
            onClick={() => setType("post")}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
              type === "post"
                ? "bg-gradient-to-r from-blue-500 to-indigo-400 text-white shadow-md shadow-blue-200"
                : "bg-white/70 text-gray-700 hover:bg-white"
            }`}
          >
            Posts
          </button>
          <button
            onClick={() => setType("reel")}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
              type === "reel"
                ? "bg-gradient-to-r from-indigo-500 to-sky-400 text-white shadow-md shadow-sky-200"
                : "bg-white/70 text-gray-700 hover:bg-white"
            }`}
          >
            Reels
          </button>
        </div>

        {type === "post" && (
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur p-1 rounded-full border border-white/10">
            <button
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                viewMode === "grid"
                  ? "bg-gradient-to-r from-blue-500 to-indigo-400 text-white shadow-md shadow-blue-200"
                  : "bg-white/70 text-gray-700 hover:bg-white"
              }`}
              onClick={() => setViewMode("grid")}
            >
              Grid
            </button>
            <button
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                viewMode === "list"
                  ? "bg-gradient-to-r from-indigo-500 to-sky-400 text-white shadow-md shadow-sky-200"
                  : "bg-white/70 text-gray-700 hover:bg-white"
              }`}
              onClick={() => setViewMode("list")}
            >
              List
            </button>
          </div>
        )}
      </div>

      {type === "post" &&
        (myPosts.length > 0 ? (
          viewMode === "grid" ? (
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {myPosts.map((e) => (
                <PostCard type="post" value={e} key={e._id} layout="grid" />
              ))}
            </div>
          ) : (
            <div className="mt-6 space-y-6">
              {myPosts.map((e) => (
                <PostCard type="post" value={e} key={e._id} layout="list" />
              ))}
            </div>
          )
        ) : (
          <p className="text-white/80 mt-6">No post yet</p>
        ))}

      {type === "reel" &&
        (myReels.length > 0 ? (
          <div className="flex justify-center items-center gap-4 mt-6">
            {index > 0 && (
              <button
                className="bg-gradient-to-r from-indigo-500 to-sky-400 text-white py-5 px-5 rounded-full"
                onClick={prevReel}
              >
                <FaArrowUp />
              </button>
            )}
            <PostCard
              type="reel"
              value={myReels[index]}
              key={myReels[index]._id}
              layout="list"
            />
            {index < myReels.length - 1 && (
              <button
                className="bg-gradient-to-r from-indigo-500 to-sky-400 text-white py-5 px-5 rounded-full"
                onClick={nextReel}
              >
                <FaArrowDownLong />
              </button>
            )}
          </div>
        ) : (
          <p className="text-white/80 mt-6">No Reel yet</p>
        ))}
      </div>
    </div>
  );
};

export default UserAccount;
