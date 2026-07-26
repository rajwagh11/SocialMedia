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
  // 1. ALL HOOKS MUST COME FIRST (No early returns allowed above this line!)
  const [isLike, setIsLike] = useState(false);
  const [show, setShow] = useState(false);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [caption, setCaption] = useState(value?.caption || "");
  const [captionLoading, setCaptionLoading] = useState(false);
  const [showAllComments, setShowAllComments] = useState(false);

  const { user } = UserData();
  const { likePost, addComment, deletePost, fetchPosts } = PostData();

  useEffect(() => {
    if (!user?._id || !value?.likes) return;
    setIsLike(value.likes.includes(user._id));
  }, [value?.likes, user?._id]);

  // 2. NOW it is safe to do early returns or conditional checks!
  if (!value?.post?.url) return null;

  const formatDate = format(new Date(value.createdAt), "MMMM do");

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

  const cardWrapperClass =
    layout === "grid"
      ? "rounded-2xl overflow-hidden bg-white/90 dark:bg-slate-800/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-700/60 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between"
      : "rounded-2xl overflow-hidden bg-white/90 dark:bg-slate-800/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-700/60 shadow-sm transition-all duration-300 w-full max-w-2xl mx-auto";

  return (
    <div className={layout === "grid" ? "h-full flex flex-col" : "w-full py-2"}>
      <SimpleModal isOpen={showModal} onClose={() => setShowModal(false)}>
        <div className="flex flex-col gap-2.5 p-2 min-w-[180px]">
          <button
            onClick={editHandler}
            className="w-full text-center text-sm font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 py-2 px-4 rounded-xl transition-colors"
          >
            Edit Post
          </button>
          <button
            onClick={deleteHandler}
            disabled={loading}
            className="w-full text-center text-sm font-medium bg-rose-500 hover:bg-rose-600 text-white py-2 px-4 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center"
          >
            {loading ? <LoadingAnimation /> : "Delete Post"}
          </button>
        </div>
      </SimpleModal>

      <div className={cardWrapperClass}>
        <div>
          {/* Card Header */}
          <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 border-b border-slate-100 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/40">
            {value.owner ? (
              <Link to={`/user/${value.owner._id}`} className="flex items-center space-x-3 group">
                <img
                  src={value.owner?.profilePic?.url || "/default-avatar.png"}
                  alt="profile"
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-indigo-500/20 group-hover:ring-indigo-500/50 transition-all"
                />
                <div>
                  <p className="text-slate-800 dark:text-slate-100 font-semibold text-sm group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {value.owner?.name}
                  </p>
                  <p className="text-slate-400 dark:text-slate-500 text-[11px] font-medium">{formatDate}</p>
                </div>
              </Link>
            ) : (
              <div className="flex items-center space-x-3">
                <img src="/default-avatar.png" alt="profile" className="w-9 h-9 rounded-full object-cover grayscale opacity-70" />
                <div>
                  <p className="text-slate-600 dark:text-slate-400 font-semibold text-sm">Deleted User</p>
                  <p className="text-slate-400 dark:text-slate-500 text-[11px] font-medium">{formatDate}</p>
                </div>
              </div>
            )}

            {user?._id && value?.owner?._id === user._id && (
              <button
                onClick={() => setShowModal(true)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-colors"
                aria-label="Post options"
              >
                <BsThreeDotsVertical className="text-lg" />
              </button>
            )}
          </div>

          {/* Caption & Inline Edit Area */}
          <div className="px-4 sm:px-5 py-3">
            {showInput ? (
              <div className="flex items-center gap-2 my-1">
                <input
                  className="flex-1 bg-slate-100 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-1.5 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  type="text"
                  placeholder="Enter Caption"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                />
                <button
                  onClick={updateCaption}
                  disabled={captionLoading}
                  className="text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-2 rounded-xl transition-all shadow-sm active:scale-95 disabled:opacity-50"
                >
                  {captionLoading ? "..." : "Save"}
                </button>
                <button
                  onClick={() => setShowInput(false)}
                  className="text-xs font-semibold bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 px-2.5 py-2 rounded-xl transition-all active:scale-95"
                >
                  ✕
                </button>
              </div>
            ) : (
              value.caption && (
                <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed break-words">
                  {value.caption}
                </p>
              )
            )}
          </div>

          {/* Media Rendering */}
          <div className="w-full bg-slate-950/5 dark:bg-slate-950/40 overflow-hidden">
            {type === "post" ? (
              <img
                src={value.post?.url}
                alt="post media"
                className={`w-full object-cover ${layout === "grid" ? "h-64 sm:h-72" : "max-h-[550px]"}`}
                onError={(e) => (e.target.src = "/default-post.png")}
              />
            ) : (
              <video
                src={value.post?.url}
                className={`w-full object-cover ${layout === "grid" ? "h-64 sm:h-72" : "max-h-[550px]"}`}
                autoPlay
                muted
                controls
              />
            )}
          </div>
        </div>

        <div>
          {/* Actions Bar (Likes & Comments Count) */}
          <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-t border-slate-100 dark:border-slate-700/50 bg-slate-50/30 dark:bg-slate-800/20 text-slate-600 dark:text-slate-400 text-xs font-medium">
            <div className="flex items-center space-x-3">
              <button
                onClick={handleLike}
                className="flex items-center gap-1.5 hover:text-rose-500 dark:hover:text-rose-400 transition-colors group active:scale-95"
                type="button"
                aria-label="Like post"
              >
                <span className="text-xl">
                  {isLike ? (
                    <IoHeartSharp className="text-rose-500 dark:text-rose-400 scale-110 transition-transform" />
                  ) : (
                    <IoHeartOutline className="group-hover:scale-110 transition-transform" />
                  )}
                </span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {value.likes?.length || 0}
                </span>
              </button>
            </div>

            <button
              className="flex items-center gap-1.5 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors active:scale-95"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShow(!show);
              }}
              type="button"
            >
              <BsChatFill className="text-sm opacity-80" />
              <span>{value.comments?.length || 0} comments</span>
            </button>
          </div>

          {/* Comment Input Section */}
          {show && (
            <div className="px-4 sm:px-5 pt-3 pb-4 border-t border-slate-100 dark:border-slate-700/50 bg-slate-50/60 dark:bg-slate-900/30">
              <form className="flex gap-2 items-center" onSubmit={handleCommentSubmit}>
                <input
                  type="text"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="flex-1 px-3.5 py-2 border border-slate-200 dark:border-slate-700/60 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none text-xs sm:text-sm text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800 placeholder-slate-400"
                  placeholder="Write a comment..."
                  required
                />
                <button
                  className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl px-4 py-2 text-xs font-semibold shadow-sm transition-all active:scale-95 whitespace-nowrap flex-shrink-0"
                  type="submit"
                >
                  Post
                </button>
              </form>
            </div>
          )}

          {/* Comments List Section */}
          {(show || (value.comments && value.comments.length > 0)) && (
            <div className="px-4 sm:px-5 py-3 border-t border-slate-100 dark:border-slate-700/50 bg-slate-50/30 dark:bg-slate-900/20">
              <div className="max-h-[220px] overflow-y-auto space-y-3 pr-1 custom-scrollbar">
                {value.comments && value.comments.length > 0 ? (
                  <>
                    {(showAllComments ? value.comments : value.comments.slice(0, 2)).map((comment) => (
                      <Comment key={comment._id} value={comment} user={user} owner={value.owner._id} id={value._id} />
                    ))}

                    {value.comments.length > 2 && (
                      <button
                        onClick={() => setShowAllComments(!showAllComments)}
                        className="w-full text-left mt-2 text-indigo-600 dark:text-indigo-400 hover:underline text-xs font-medium transition-colors py-1"
                      >
                        {showAllComments
                          ? "Show less comments"
                          : `View all ${value.comments.length} comments`}
                      </button>
                    )}
                  </>
                ) : (
                  <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-2">No comments yet. Start the conversation!</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostCard;

export const Comment = ({ value, user, owner, id }) => {
  const { deleteComment } = PostData();

  const deleteCommentHandler = () => {
    deleteComment(id, value._id);
  };

  const canDelete = owner === user._id || value?.user?._id === user._id;

  return (
    <div className="flex items-start justify-between gap-2.5 text-xs group">
      <div className="flex items-start gap-2.5 flex-1 min-w-0">
        <img
          src={value?.user?.profilePic?.url || "/default-avatar.png"}
          className="w-6 h-6 rounded-full object-cover mt-0.5 flex-shrink-0 ring-1 ring-slate-200 dark:ring-slate-700"
          alt="commenter avatar"
        />
        <div className="flex-1 bg-white dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/50 rounded-xl px-3 py-2 shadow-2xs">
          <p className="text-slate-800 dark:text-slate-200 font-semibold text-[11px]">
            {value?.user?.name || "Deleted User"}
          </p>
          <p className="text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed break-words">
            {value?.comment || ""}
          </p>
        </div>
      </div>

      {canDelete && (
        <button
          onClick={deleteCommentHandler}
          className="text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 flex-shrink-0"
          title="Delete comment"
          type="button"
        >
          <MdDelete className="text-sm" />
        </button>
      )}
    </div>
  );
};