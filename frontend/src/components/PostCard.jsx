import axios from "axios";
import React, { useState, useEffect } from "react";
import { BsChatFill, BsThreeDotsVertical } from "react-icons/bs";
import { format } from "date-fns";
import { IoHeartOutline, IoHeartSharp } from "react-icons/io5";
import { MdDelete } from "react-icons/md";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

import { UserData } from "../context/UserContext";
import { PostData } from "../context/PostContext";
import SimpleModal from "./SimpleModal";
import { LoadingAnimation } from "./Loading";

const PostCard = ({ type, value, layout = "grid" }) => {
  if (!value?.post?.url) return null;

  const [isLike, setIsLike] = useState(false);
  const [show, setShow] = useState(false);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [caption, setCaption] = useState(value.caption || "");
  const [captionLoading, setCaptionLoading] = useState(false);
  const [showAllComments, setShowAllComments] = useState(false);

  const { user } = UserData();
  const { likePost, addComment, deletePost, fetchPosts } = PostData();

  const formatDate = format(new Date(value.createdAt), "MMMM do");

  useEffect(() => {
    if (!user?._id) return;
    setIsLike(value.likes.includes(user._id));
  }, [value.likes, user?._id]);

  const handleLike = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLike(!isLike);
    likePost?.(value._id);
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addComment(value._id, comment, setComment, setShow);
  };

  const deleteHandler = () => {
    setLoading(true);
    deletePost(value._id).finally(() => setLoading(false));
  };

  const editHandler = () => {
    setShowModal(false);
    setShowInput(true);
  };

  const updateCaption = async () => {
    setCaptionLoading(true);
    try {
      const { data } = await axios.put(`/api/post/${value._id}`, { caption });
      toast.success(data.message);
      fetchPosts();
      setShowInput(false);
    } catch (error) {
      const msg = error?.response?.data?.message || error.message || "Something went wrong";
      toast.error(msg);
    } finally {
      setCaptionLoading(false);
    }
  };

  const cardWrapperClass = layout === "grid"
    ? "rounded-2xl overflow-hidden bg-white/5 backdrop-blur border border-white/10 shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all"
    : "rounded-2xl overflow-hidden bg-white/5 backdrop-blur border border-white/10 shadow-xl";

  const headerBg = "bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-cyan-500/10";
  const actionBtn = "hover:bg-white/10 rounded-full p-1";

  return (
    <div className={layout === "grid" ? "pt-1" : "bg-transparent flex items-center justify-center pt-3 pb-14"}>
      <SimpleModal isOpen={showModal} onClose={() => setShowModal(false)}>
        <div className="flex flex-col items-center justify-center gap-3">
          <button onClick={editHandler} className="bg-gradient-to-r from-indigo-500 to-sky-400 text-white py-1 px-3 rounded-md">
            Edit
          </button>
          <button
            onClick={deleteHandler}
            className="bg-gradient-to-r from-red-500 to-red-600 text-white py-1 px-3 rounded-md"
            disabled={loading}
          >
            {loading ? <LoadingAnimation /> : "Delete"}
          </button>
        </div>
      </SimpleModal>

      <div className={`${cardWrapperClass} ${layout === "grid" ? "" : "max-w-2xl w-full"}`}>
        <div className={`flex items-center justify-between px-5 py-4 ${headerBg}`}>
          {value.owner ? (
            <Link to={`/user/${value.owner._id}`} className="flex items-center space-x-2">
              <img
                src={value.owner?.profilePic?.url || "/default-avatar.png"}
                alt="profile"
                className="w-8 h-8 rounded-full"
              />
              <div>
                <p className="text-white font-semibold">{value.owner?.name}</p>
                <p className="text-white/70 text-sm">{formatDate}</p>
              </div>
            </Link>
          ) : (
            <div className="flex items-center space-x-2">
              <img src="/default-avatar.png" alt="profile" className="w-8 h-8 rounded-full" />
              <div>
                <p className="text-white font-semibold">Deleted User</p>
                <p className="text-white/70 text-sm">{formatDate}</p>
              </div>
            </div>
          )}

          {user?._id && value?.owner?._id === user._id && (
            <div className="text-white/80 cursor-pointer">
              <button
                onClick={() => setShowModal(true)}
                className={`${actionBtn} text-2xl`}
              >
                <BsThreeDotsVertical />
              </button>
            </div>
          )}
        </div>

        <div className="px-5 pt-4">
          {showInput ? (
            <>
              <input
                className="custom-input"
                style={{ width: "150px" }}
                type="text"
                placeholder="Enter Caption"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
              />
              <button
                onClick={updateCaption}
                className="text-sm bg-gradient-to-r from-indigo-500 to-sky-400 text-white px-2 py-1 rounded-md ml-2"
                disabled={captionLoading}
              >
                {captionLoading ? <LoadingAnimation /> : "Update Caption"}
              </button>
              <button
                onClick={() => setShowInput(false)}
                className="text-sm bg-gradient-to-r from-red-500 to-red-600 text-white px-2 py-1 rounded-md ml-2"
              >
                X
              </button>
            </>
          ) : (
            <p className="text-white px-1">{value.caption}</p>
          )}
        </div>

        <div className="mt-2">
          {type === "post" ? (
            <img
              src={value.post?.url}
              alt="post"
              className={`object-cover ${layout === "grid" ? "w-full h-72" : "w-full"}`}
              onError={(e) => (e.target.src = "/default-post.png")}
            />
          ) : (
            <video src={value.post?.url} className={`object-cover ${layout === "grid" ? "w-full h-72" : "w-full"}`} autoPlay controls />
          )}
        </div>

        <div className="flex items-center justify-between text-white/80 px-5 py-4">
          <div className="flex items-center space-x-2">
            <button 
              onClick={handleLike} 
              className="text-2xl cursor-pointer bg-transparent border-none p-0 focus:outline-none"
              type="button"
              aria-label="Like post"
            >
              {isLike ? <IoHeartSharp className="text-blue-500" /> : <IoHeartOutline />}
            </button>
            <button className={actionBtn} type="button">
              {value.likes?.length || 0} likes
            </button>
          </div>
          <button
            className={`flex items-center gap-2 px-3 ${actionBtn}`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShow(!show);
            }}
            type="button"
          >
            <BsChatFill />
            <span>{value.comments?.length || 0} comments</span>
          </button>
        </div>

        {show && (
          <div className="px-5 pb-5">
            <form className="flex gap-2 items-center" onSubmit={handleCommentSubmit}>
              <input
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-cyan-400 focus:ring-2 focus:ring-cyan-200 transition-all duration-200 outline-none text-gray-700 bg-white"
                placeholder="Add a comment..."
                required
              />
              <button 
                className="bg-gradient-to-r from-cyan-400 to-emerald-400 text-white rounded-lg px-4 py-2.5 font-semibold hover:from-cyan-500 hover:to-emerald-500 transition-all whitespace-nowrap flex-shrink-0" 
                type="submit"
              >
                Add
              </button>
            </form>
          </div>
        )}

        <div className="px-5 pb-6">
          <hr className="my-2 border-white/10" />
          <p className="text-white font-semibold">Comments</p>
          <hr className="my-2 border-white/10" />
          <div className="mt-4">
            <div className="comments max-h-[200px] overflow-y-auto">
              {value.comments && value.comments?.length > 0 ? (
                <>
                  {/* Show first 2 comments or all based on state */}
                  {(showAllComments ? value.comments : value.comments.slice(0, 2)).map((comment) => (
                    <Comment key={comment._id} value={comment} user={user} owner={value.owner._id} id={value._id} />
                  ))}
                  
                  {/* Show "View All" or "Show Less" button if more than 2 comments */}
                  {value.comments.length > 2 && (
                    <button
                      onClick={() => setShowAllComments(!showAllComments)}
                      className="mt-3 text-blue-400 hover:text-blue-300 text-sm font-semibold transition-colors"
                    >
                      {showAllComments 
                        ? `Show Less` 
                        : `View all ${value.comments.length} comments`
                      }
                    </button>
                  )}
                </>
              ) : (
                <p className="text-white/70">No Comments</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostCard;

export const Comment = ({ value,user,owner,id }) => {
  const { deleteComment } = PostData();
  
  const deleteCommentHandler = () => {
    deleteComment(id, value._id);
  };

  return (
    <div className="mt-2 flex items-start justify-between gap-2">
      <div className="flex gap-2">
        <img
          src={value?.user?.profilePic?.url || "/default-avatar.png"}
          className="w-6 h-6 rounded-full"
          alt="comment user"
        />
        <div>
          <p className="text-gray-800 font-semibold">{value?.user?.name || "Deleted User"}</p>
          <p className="text-gray-500 text-sm">{value?.comment || ""}</p>
        </div>
      </div>

      {owner === user._id ? (
        ""
      ) : (
        <>
          {value.user._id === user._id && (
            <button onClick={deleteCommentHandler} className="text-red-500">
              <MdDelete />
            </button>
          )}
        </>
      )}
      
      {owner === user._id && (
        <button onClick={deleteCommentHandler} className="text-red-500">
          <MdDelete />
        </button>
      )}
    </div>
  );
};
























