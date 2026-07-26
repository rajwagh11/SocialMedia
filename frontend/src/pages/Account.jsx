import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { 
  HiOutlineCamera, 
  HiOutlineKey, 
  HiOutlineArrowRightOnRectangle, 
  HiOutlineCheck, 
  HiOutlineXMark,
  HiOutlineChevronLeft,
  HiOutlineChevronRight
} from "react-icons/hi2";
import { CiEdit } from "react-icons/ci";

import { UserData } from "../context/UserContext";
import { PostData } from "../context/PostContext";
import PostCard from "../components/PostCard";
import Modal from "../components/Modal";
import axiosInstance from "../api/axiosInstance.js";
import { Loading } from "../components/Loading";

const Account = ({ user }) => {
  const navigate = useNavigate();
  const params = useParams();

  const { logoutUser, updateProfilePic, updateProfileName } = UserData();
  const { posts, reels } = PostData();

  const [User, setUser] = useState(user || null);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState("post");
  const [index, setIndex] = useState(0);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowings, setShowFollowings] = useState(false);
  const [followersData, setFollowersData] = useState([]);
  const [followingsData, setFollowingsData] = useState([]);
  const [file, setFile] = useState("");

  // Inline Editing States
  const [showInput, setShowInput] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [showUpdatePass, setShowUpdatePass] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

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

  const fetchFollowData = async () => {
    try {
      const { data } = await axiosInstance.get("/user/followdata/" + User._id);
      setFollowersData(data.followers || []);
      setFollowingsData(data.followings || []);
    } catch (error) {
      console.error("Error fetching follow data:", error);
    }
  };

  useEffect(() => {
    if (!user) fetchUser();
    else setLoading(false);
  }, [params.id, user]);

  useEffect(() => {
    if (User?._id) {
      fetchFollowData();
      setName(User.name || "");
    }
  }, [User]);

  const changeFileHandler = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) setFile(selectedFile);
  };

  const changeImageHandler = () => {
    if (!file) return;
    const formdata = new FormData();
    formdata.append("file", file);
    updateProfilePic(User._id, formdata, setFile);
    setFile("");
  };

  const logoutHandler = () => {
    logoutUser(navigate);
  };

  const UpdateName = () => {
    if (!name.trim()) return;
    updateProfileName(User._id, name.trim(), setShowInput);
    setUser((prevUser) => ({
      ...prevUser,
      name: name.trim(),
    }));
  };

  async function updatePassword(e) {
    e.preventDefault();
    try {
      const { data } = await axiosInstance.post("/user/" + User._id, {
        oldPassword,
        newPassword,
      });

      toast.success(data.message || "Password updated successfully!");
      setOldPassword("");
      setNewPassword("");
      setShowUpdatePass(false);
    } catch (error) {
      const msg = error.response?.data?.message || "Failed to update password.";
      toast.error(msg);
    }
  }

  const myPosts = posts?.filter((post) => post.owner?._id === User?._id) || [];
  const myReels = reels?.filter((reel) => reel.owner?._id === User?._id) || [];

  const prevReel = () => {
    if (index > 0) setIndex((prev) => prev - 1);
  };

  const nextReel = () => {
    if (index < myReels.length - 1) setIndex((prev) => prev + 1);
  };

  if (loading || !User) return <Loading />;

  return (
    <>
      {showFollowers && (
        <Modal value={followersData} title="Followers" setShow={setShowFollowers} />
      )}
      {showFollowings && (
        <Modal value={followingsData} title="Followings" setShow={setShowFollowings} />
      )}

      <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 transition-colors duration-300 pb-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8">
          
          {/* --- PROFILE HEADER CARD --- */}
          <div className="bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 rounded-3xl overflow-hidden shadow-sm mb-8 transition-all">
            
            {/* Gradient Banner */}
            <div className="h-36 sm:h-48 w-full bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 dark:from-indigo-900 dark:via-slate-800 dark:to-purple-900 relative">
              <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]" />
            </div>

            {/* Profile Content Section */}
            <div className="px-6 sm:px-10 pb-8 pt-0 relative">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 -mt-16 sm:-mt-20 mb-6">
                
                {/* Avatar with Camera Overlay */}
                <div className="relative group self-center sm:self-auto shrink-0">
                  <div className="p-1.5 rounded-full bg-white dark:bg-slate-800 shadow-md">
                    <img
                      src={file ? URL.createObjectURL(file) : User.profilePic?.url || "/default-avatar.png"}
                      alt="Profile"
                      className="w-28 h-28 sm:w-36 sm:h-36 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                    />
                  </div>
                  
                  {/* Camera Upload Trigger */}
                  <input
                    type="file"
                    id="profileUpload"
                    className="hidden"
                    accept="image/*"
                    onChange={changeFileHandler}
                  />
                  <label
                    htmlFor="profileUpload"
                    className="absolute bottom-2 right-2 p-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full shadow-lg cursor-pointer transition-all active:scale-95 flex items-center justify-center"
                    title="Change profile picture"
                  >
                    <HiOutlineCamera className="text-lg" />
                  </label>
                </div>

                {/* Action Buttons Bar */}
                <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2.5">
                  {file && (
                    <button
                      onClick={changeImageHandler}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-sm transition-all animate-in fade-in"
                    >
                      <HiOutlineCheck className="text-base" />
                      <span>Save Avatar</span>
                    </button>
                  )}

                  <button
                    onClick={() => setShowUpdatePass(!showUpdatePass)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700/80 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer"
                  >
                    <HiOutlineKey className="text-base text-indigo-500 dark:text-indigo-400" />
                    <span>{showUpdatePass ? "Close Password" : "Password"}</span>
                  </button>

                  <button
                    onClick={logoutHandler}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer"
                  >
                    <HiOutlineArrowRightOnRectangle className="text-base" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>

              {/* User Info & Inline Name Editing */}
              <div className="text-center sm:text-left space-y-1.5">
                {showInput ? (
                  <div className="flex items-center justify-center sm:justify-start gap-2 max-w-xs mx-auto sm:mx-0 mb-2">
                    <input
                      type="text"
                      className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter Name"
                      autoFocus
                    />
                    <button
                      onClick={UpdateName}
                      className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all"
                      title="Save name"
                    >
                      <HiOutlineCheck className="text-base" />
                    </button>
                    <button
                      onClick={() => setShowInput(false)}
                      className="p-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-xl transition-all"
                      title="Cancel"
                    >
                      <HiOutlineXMark className="text-base" />
                    </button>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-2">
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                      {User.name}
                    </h1>
                    <button
                      onClick={() => setShowInput(true)}
                      className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer p-1"
                      title="Edit name"
                    >
                      <CiEdit className="text-xl stroke-1" />
                    </button>
                  </div>
                )}

                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{User.email}</p>
                <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                  {User.gender || "Not specified"}
                </p>

                {/* Followers / Following Badges */}
                <div className="flex items-center justify-center sm:justify-start gap-6 pt-4 border-t border-slate-100 dark:border-slate-700/60 mt-4">
                  <button
                    onClick={() => setShowFollowers(true)}
                    className="flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                  >
                    <span className="font-bold text-slate-900 dark:text-white text-base">
                      {User.followers?.length || 0}
                    </span>
                    <span>Followers</span>
                  </button>
                  <button
                    onClick={() => setShowFollowings(true)}
                    className="flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                  >
                    <span className="font-bold text-slate-900 dark:text-white text-base">
                      {User.followings?.length || 0}
                    </span>
                    <span>Following</span>
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* --- COLLAPSIBLE PASSWORD CARD --- */}
          {showUpdatePass && (
            <div className="max-w-md mx-auto bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-6 shadow-lg mb-8 animate-in fade-in zoom-in-95 duration-200">
              <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                <HiOutlineKey className="text-indigo-500 text-lg" />
                <span>Change Account Password</span>
              </h3>
              <form onSubmit={updatePassword} className="space-y-3.5">
                <input
                  type="password"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Current Password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  required
                />
                <input
                  type="password"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowUpdatePass(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-sm transition-all active:scale-95"
                  >
                    Update Password
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* --- CONTENT TABS SWITCHER --- */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex p-1 bg-slate-200/70 dark:bg-slate-800/80 border border-slate-300/50 dark:border-slate-700/60 rounded-2xl shadow-inner">
              <button
                onClick={() => setType("post")}
                className={`px-6 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                  type === "post"
                    ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                Posts ({myPosts.length})
              </button>
              <button
                onClick={() => setType("reel")}
                className={`px-6 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                  type === "reel"
                    ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                Reels ({myReels.length})
              </button>
            </div>
          </div>

          {/* --- CENTERED FEED AREA --- */}
          <div className="max-w-xl mx-auto w-full">
            
            {/* POSTS FEED */}
            {type === "post" && (
              myPosts.length > 0 ? (
                <div className="flex flex-col gap-6">
                  {myPosts.map((post) => (
                    <PostCard type="post" value={post} key={post._id} layout="list" />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-white dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 rounded-3xl">
                  <p className="text-sm font-medium text-slate-400">No posts published yet.</p>
                </div>
              )
            )}

            {/* REELS FEED */}
            {type === "reel" && (
              myReels.length > 0 ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="w-full">
                    <PostCard
                      type="reel"
                      value={myReels[index]}
                      key={myReels[index]._id}
                      layout="list"
                    />
                  </div>

                  {/* Centered Reel Navigation Controls */}
                  {myReels.length > 1 && (
                    <div className="flex items-center gap-4 mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2 rounded-2xl shadow-sm">
                      <button
                        onClick={prevReel}
                        disabled={index === 0}
                        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-500/20 hover:text-indigo-600 disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer"
                        title="Previous Reel"
                      >
                        <HiOutlineChevronLeft className="text-lg" />
                      </button>
                      
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        {index + 1} of {myReels.length}
                      </span>

                      <button
                        onClick={nextReel}
                        disabled={index === myReels.length - 1}
                        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-500/20 hover:text-indigo-600 disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer"
                        title="Next Reel"
                      >
                        <HiOutlineChevronRight className="text-lg" />
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-16 bg-white dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 rounded-3xl">
                  <p className="text-sm font-medium text-slate-400">No reels published yet.</p>
                </div>
              )
            )}

          </div>

        </div>
      </div>
    </>
  );
};

export default Account;