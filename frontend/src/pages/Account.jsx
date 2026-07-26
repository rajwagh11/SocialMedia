import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { UserData } from "../context/UserContext";
import { PostData } from "../context/PostContext";
import PostCard from "../components/PostCard";
import { FaArrowDownLong, FaArrowUp } from "react-icons/fa6";
import Modal from "../components/Modal";
import axiosInstance from "../api/axiosInstance.js";
import { Loading } from "../components/Loading";
import { CiEdit } from "react-icons/ci";
import toast from "react-hot-toast";

const Account = ({ user }) => {
  const navigate = useNavigate();
  const params = useParams();

  const { logoutUser, updateProfilePic, updateProfileName } = UserData();
  const { posts, reels } = PostData();

  const [User, setUser] = useState(user || null);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState("post");
  const [index, setIndex] = useState(0);
  const [show, setShow] = useState(false);
  const [show1, setShow1] = useState(false);
  const [followersData, setFollowersData] = useState([]);
  const [followingsData, setFollowingsData] = useState([]);
  const [file, setFile] = useState("");

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
      setFollowersData(data.followers);
      setFollowingsData(data.followings);
    } catch (error) {
      console.log(error);
    }
  };

  const changeFileHandler = (e) => {
    const file = e.target.files[0];
    setFile(file);
  };

  const changeImageHandler = () => {
    const formdata = new FormData();
    formdata.append("file", file);
    updateProfilePic(user._id, formdata, setFile);
    setFile("");
  };

  useEffect(() => {
    if (!user) fetchUser();
    else setLoading(false);
  }, [params.id, user]);

  useEffect(() => {
    if (User?._id) fetchFollowData();
  }, [User]);

  const logoutHandler = () => {
    logoutUser(navigate);
  };

  const myPosts = posts?.filter((post) => post.owner?._id === User._id) || [];
  const myReels = reels?.filter((reel) => reel.owner?._id === User._id) || [];

  const prevReel = () => {
    if (index > 0) setIndex((prev) => prev - 1);
  };

  const nextReel = () => {
    if (index < myReels.length - 1) setIndex((prev) => prev + 1);
  };

  const [showInput, setShowInput] = useState(false);
  const [name, setName] = useState(user?.name || "");

  const UpdateName = () => {
    updateProfileName(user._id, name, setShowInput);
    setUser((prevUser) => ({
      ...prevUser,
      name: name,
    }));
  };

  const [showUpdatePass, setShowUpdatePass] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  if (loading || !User) return <Loading />;

  async function updatePassword(e) {
    e.preventDefault();
    try {
      const { data } = await axiosInstance.post("/user/" + user._id, {
        oldPassword,
        newPassword,
      });

      toast.success(data.message);
      setOldPassword("");
      setNewPassword("");
      setShowUpdatePass(false);
    } catch (error) {
      toast.error(error.response.data.message);
    }
  }

  return (
    <>
      {show && <Modal value={followersData} title="Followers" setShow={setShow} />}
      {show1 && <Modal value={followingsData} title="Followings" setShow={setShow1} />}

      <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-[#0f172a] to-[#0b1220] pb-20">
        <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8 pt-6 pb-12">
          <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl mb-6">
            <div className="h-40 w-full bg-gradient-to-r from-amber-600/70 via-orange-500/70 to-red-500/70" />
            <div className="bg-white/5 backdrop-blur px-6 md:px-10 pb-6 pt-0">
              <div className="flex flex-col md:flex-row md:items-end gap-6 -mt-16">
                <div className="shrink-0">
                  <div className="relative inline-block p-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-400">
                    <img
                      src={User.profilePic?.url || "/default-avatar.png"}
                      alt="Profile"
                      className="w-[140px] h-[140px] md:w-[160px] md:h-[160px] rounded-full border-4 border-slate-900 object-cover"
                    />
                  </div>
                </div>
                <div className="flex-1 text-white">
                  {showInput ? (
                    <div className="flex items-center gap-2 mb-2">
                      <input
                        className="bg-white/10 backdrop-blur border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-amber-500"
                        style={{ width: "200px" }}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter Name"
                        required
                      />
                      <button 
                        onClick={UpdateName}
                        className="bg-gradient-to-r from-amber-500 to-orange-400 text-white px-4 py-2 rounded-lg"
                      >
                        Update
                      </button>
                      <button
                        className="bg-gradient-to-r from-red-500 to-red-600 text-white p-2 rounded-full"
                        onClick={() => setShowInput(false)}
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <h1 className="text-2xl md:text-3xl font-bold mb-2 flex items-center gap-2">
                      {User.name}{" "}
                      <button onClick={() => setShowInput(true)} className="text-amber-400 hover:text-amber-300">
                        <CiEdit />
                      </button>
                    </h1>
                  )}
                  <p className="text-white/80">{User.email}</p>
                  <p className="text-white/70 capitalize">{User.gender}</p>

                  <div className="flex items-center gap-6 mt-4">
                    <button onClick={() => setShow(true)} className="text-white/90 hover:text-white">
                      <span className="font-semibold">{User.followers?.length || 0}</span> Followers
                    </button>
                    <button onClick={() => setShow1(true)} className="text-white/90 hover:text-white">
                      <span className="font-semibold">{User.followings?.length || 0}</span> Following
                    </button>
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-2">
                    <input
                      type="file"
                      id="profileUpload"
                      className="hidden"
                      accept="image/*"
                      onChange={changeFileHandler}
                    />
                    <label
                      htmlFor="profileUpload"
                      className="cursor-pointer bg-white/10 backdrop-blur border border-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/20 transition text-center"
                    >
                      Choose File
                    </label>
                    <button
                      className="bg-gradient-to-r from-amber-500 to-orange-400 text-white px-4 py-2 rounded-lg hover:shadow-lg hover:shadow-amber-500/50 transition disabled:opacity-50"
                      onClick={changeImageHandler}
                      disabled={!file}
                    >
                      Update Profile
                    </button>
                  </div>
                  <button
                    onClick={logoutHandler}
                    className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg hover:shadow-lg hover:shadow-red-500/50 transition"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden bg-white/5 backdrop-blur border border-white/10 shadow-xl mb-6">
            <button
              onClick={() => setShowUpdatePass(!showUpdatePass)}
              className="w-full bg-gradient-to-r from-indigo-500/20 to-sky-500/20 hover:from-indigo-500/30 hover:to-sky-500/30 text-white px-6 py-3 rounded-t-2xl transition-all"
            >
              {showUpdatePass ? "✕ Close" : "🔒 Update Password"}
            </button>

            {showUpdatePass && (
              <form
                onSubmit={updatePassword}
                className="p-6 space-y-4"
              >
                <input
                  type="password"
                  className="w-full bg-white/10 backdrop-blur border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Old Password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  required
                />
                <input
                  type="password"
                  className="w-full bg-white/10 backdrop-blur border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-indigo-500 to-sky-400 text-white px-4 py-2 rounded-lg hover:shadow-lg hover:shadow-indigo-500/50 transition"
                >
                  Update Password
                </button>
              </form>
            )}
          </div>

          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur p-1 rounded-full border border-white/10">
              <button
                onClick={() => setType("post")}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                  type === "post"
                    ? "bg-gradient-to-r from-amber-500 to-orange-400 text-white shadow-md shadow-amber-200"
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
          </div>

          {type === "post" &&
            (myPosts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {myPosts.map((post) => (
                  <PostCard type="post" value={post} key={post._id} layout="grid" />
                ))}
              </div>
            ) : (
              <p className="text-white/80 text-center py-12">No post yet</p>
            ))}

          {type === "reel" &&
            (myReels.length > 0 ? (
              <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                {index > 0 && (
                  <button
                    className="bg-gradient-to-r from-indigo-500 to-sky-400 text-white py-4 px-4 rounded-full hover:shadow-lg hover:shadow-indigo-500/50 transition-all"
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
                    className="bg-gradient-to-r from-indigo-500 to-sky-400 text-white py-4 px-4 rounded-full hover:shadow-lg hover:shadow-indigo-500/50 transition-all"
                    onClick={nextReel}
                  >
                    <FaArrowDownLong />
                  </button>
                )}
              </div>
            ) : (
              <p className="text-white/80 text-center py-12">No Reel yet</p>
            ))}
        </div>
      </div>
    </>
  );
};

export default Account;
