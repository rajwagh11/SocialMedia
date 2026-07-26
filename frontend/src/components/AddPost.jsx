import React, { useState } from "react";
import { PostData } from "../context/PostContext";
import { LoadingAnimation } from "./Loading";
import toast from "react-hot-toast";

const AddPost = ({ type }) => {
  const [caption, setCaption] = useState("");
  const [file, setFile] = useState("");
  const [filePrev, setFilePrev] = useState("");

  const { addPost, addLoading } = PostData();

  const changeFileHandler = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    const reader = new FileReader();
    reader.readAsDataURL(selectedFile);

    reader.onloadend = () => {
      setFilePrev(reader.result);
      setFile(selectedFile);
    };
  };

  const clearFileHandler = (e) => {
    e.preventDefault();
    setFile("");
    setFilePrev("");
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error("Please select a file to upload.");
      return;
    }

    const formdata = new FormData();
    formdata.append("caption", caption);
    formdata.append("file", file);

    try {
      await addPost(formdata, setFile, setCaption, setFilePrev, type);
      toast.success(`${type === "post" ? "Post" : "Reel"} created successfully!`);
    } catch (err) {
      if (err.response?.status === 403) {
        const reasons = err.response?.data?.reasons;
        const detail = Array.isArray(reasons) && reasons.length ? ` (${reasons.join(", ")})` : "";
        toast.error(`Upload blocked by AI moderation${detail}`, { duration: 5000 });
      } else {
        toast.error("Something went wrong while uploading the post.");
      }
    }
  };

  return (
    <div className="p-5 sm:p-6">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-700/50">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
          {type === "post" ? (
            <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          ) : (
            <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          )}
          Create New {type === "post" ? "Post" : "Reel"}
        </h3>
        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400">
          Public
        </span>
      </div>

      <form onSubmit={submitHandler} className="flex flex-col gap-4">
        {/* Caption Input */}
        <div>
          <input
            type="text"
            className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/60 rounded-xl px-4 py-2.5 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all duration-200"
            placeholder={`What's on your mind? Add a caption...`}
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
          />
        </div>

        {/* File Upload / Drop Zone */}
        {!filePrev ? (
          <label className="w-full flex flex-col items-center justify-center gap-2 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500/70 bg-slate-50/50 dark:bg-slate-900/30 rounded-xl p-6 cursor-pointer transition-all duration-200 group">
            <div className="p-3 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-500 dark:text-indigo-400 group-hover:scale-105 transition-transform duration-200">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Click to browse or drag & drop
              </p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                {type === "post" ? "PNG, JPG, WEBP up to 10MB" : "MP4, WEBM video files"}
              </p>
            </div>
            <input
              type="file"
              className="hidden"
              accept={type === "post" ? "image/*" : "video/*"}
              onChange={changeFileHandler}
              required
            />
          </label>
        ) : (
          /* Media Preview Area with Remove Button */
          <div className="relative w-full rounded-xl overflow-hidden bg-slate-900/5 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-700/60 p-1.5">
            <button
              onClick={clearFileHandler}
              type="button"
              className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-slate-900/70 text-white hover:bg-rose-600 transition-colors duration-200 shadow-md"
              title="Remove file"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {type === "post" ? (
              <img
                src={filePrev}
                alt="Upload Preview"
                className="w-full max-h-72 object-contain rounded-lg mx-auto"
              />
            ) : (
              <video
                controlsList="nodownload"
                controls
                src={filePrev}
                className="w-full max-h-72 rounded-lg mx-auto"
              />
            )}
            <div className="px-3 py-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200/50 dark:border-slate-700/50 mt-1">
              <span className="truncate max-w-[200px] sm:max-w-[300px] font-medium text-slate-700 dark:text-slate-300">
                {file?.name || "Selected Media"}
              </span>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                Ready to upload ✓
              </span>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={addLoading || !file}
          className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-sm px-6 py-2.5 rounded-xl shadow-sm hover:shadow-indigo-500/20 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-h-[42px]"
        >
          {addLoading ? (
            <LoadingAnimation />
          ) : type === "post" ? (
            "+ Share Post"
          ) : (
            "+ Share Reel"
          )}
        </button>
      </form>
    </div>
  );
};

export default AddPost;