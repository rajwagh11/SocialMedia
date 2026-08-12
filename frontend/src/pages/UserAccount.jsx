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
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-900">
      <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8 pt-6 pb-12">
      {show && (
        <Modal value={followersData} title={"Followers"} setShow={setShow} />
      )}
      {show1 && (
        <Modal value={followingsData} title={"Followings"} setShow={setShow1} />
      )}

      <div className="rounded-2xl overflow-hidden border border-slate-200/80 dark:border-slate-700/80 shadow-sm bg-white dark:bg-slate-800/90">
        <div className="h-32 w-full bg-teal-600 dark:bg-teal-800" />
        <div className="px-6 md:px-10 pb-6 pt-0">
          <div className="flex flex-col md:flex-row md:items-end gap-6 -mt-14">
            <div className="shrink-0">
              <img
                src={user.profilePic?.url || "/default-avatar.png"}
                alt="Profile"
                className="w-[130px] h-[130px] md:w-[150px] md:h-[150px] rounded-full border-4 border-white dark:border-slate-800 object-cover shadow-sm"
              />
            </div>
            <div className="flex-1 text-slate-800 dark:text-slate-100">
              <h1 className="text-2xl md:text-3xl font-bold">{user.name}</h1>
              <p className="text-slate-500 dark:text-slate-400">{user.email}</p>
              <p className="text-slate-500 dark:text-slate-400 capitalize">{user.gender}</p>

              <div className="flex items-center gap-6 mt-4">
                <button onClick={() => setShow(true)} className="text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
                  <span className="font-semibold">{user.followers?.length || 0}</span> Followers
                </button>
                <button onClick={() => setShow1(true)} className="text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
                  <span className="font-semibold">{user.followings?.length || 0}</span> Following
                </button>
              </div>
            </div>
            {loggedInUser?._id !== user._id && (
              <div className="md:ml-auto">
                <button
                  onClick={followHandler}
                  className={`px-6 py-2 rounded-full text-white font-semibold shadow-sm transition-colors ${
                    followed
                      ? "bg-rose-500 hover:bg-rose-600"
                      : "bg-teal-600 hover:bg-teal-500"
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
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-full border border-slate-200/80 dark:border-slate-700/80">
          <button
            onClick={() => setType("post")}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors duration-200 ${
              type === "post"
                ? "bg-teal-600 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700"
            }`}
          >
            Posts
          </button>
          <button
            onClick={() => setType("reel")}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors duration-200 ${
              type === "reel"
                ? "bg-teal-600 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700"
            }`}
          >
            Reels
          </button>
        </div>

        {type === "post" && (
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-full border border-slate-200/80 dark:border-slate-700/80">
            <button
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors duration-200 ${
                viewMode === "grid"
                  ? "bg-teal-600 text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700"
              }`}
              onClick={() => setViewMode("grid")}
            >
              Grid
            </button>
            <button
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors duration-200 ${
                viewMode === "list"
                  ? "bg-teal-600 text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700"
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
          <p className="text-slate-500 dark:text-slate-400 mt-6">No post yet</p>
        ))}

      {type === "reel" &&
        (myReels.length > 0 ? (
          <div className="flex justify-center items-center gap-4 mt-6">
            {index > 0 && (
              <button
                className="bg-teal-600 hover:bg-teal-500 text-white py-5 px-5 rounded-full transition-colors"
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
                className="bg-teal-600 hover:bg-teal-500 text-white py-5 px-5 rounded-full transition-colors"
                onClick={nextReel}
              >
                <FaArrowDownLong />
              </button>
            )}
          </div>
        ) : (
          <p className="text-slate-500 dark:text-slate-400 mt-6">No Reel yet</p>
        ))}
      </div>
    </div>
  );
};

export default UserAccount;
