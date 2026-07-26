import React, { useState } from "react";
import { PostData } from "../context/PostContext";
import { LoadingAnimation } from "./Loading";

const AddPost = ({ type }) => {
  const [caption, setCaption] = useState("");
  const [file, setFile] = useState("");
  const [filePrev, setFilePrev] = useState("");

  const { addPost, addLoading } = PostData();

  const changeFileHandler = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.readAsDataURL(file);

    reader.onloadend = () => {
      setFilePrev(reader.result);
      setFile(file);
    };
  };

const submitHandler = async (e) => {
  e.preventDefault();
  const formdata = new FormData();

  formdata.append("caption", caption);
  formdata.append("file", file);

  try {
    await addPost(formdata, setFile, setCaption, setFilePrev, type);
    alert("Post created successfully!");
  } catch (err) {
    if (err.response?.status === 403) {
      const reasons = err.response?.data?.reasons;
      const detail = Array.isArray(reasons) && reasons.length ? `\nReasons: ${reasons.join(", ")}` : "";
      alert("Upload blocked by AI moderation." + detail);
    } else {
      alert("Something went wrong while uploading the post.");
    }
  }
};

  return (
    <div className="p-6">
      <form
        onSubmit={submitHandler}
        className="flex flex-col gap-4 items-center"
      >
        <input
          type="text"
          className="w-full bg-white/10 backdrop-blur border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          placeholder="Enter Caption"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
        />
        <label className="w-full bg-white/10 backdrop-blur border border-white/20 rounded-lg px-4 py-3 text-white/80 cursor-pointer hover:bg-white/20 transition text-center">
          {file ? "File Selected ✓" : "Choose File"}
          <input
            type="file"
            className="hidden"
            accept={type === "post" ? "image/*" : "video/*"}
            onChange={changeFileHandler}
            required
          />
        </label>
        {filePrev && (
          <div className="w-full rounded-lg overflow-hidden">
            {type === "post" ? (
              <img src={filePrev} alt="Preview" className="w-full h-auto rounded-lg" />
            ) : (
              <video
                controlsList="nodownload"
                controls
                src={filePrev}
                className="w-full h-auto rounded-lg"
              />
            )}
          </div>
        )}
        <button
          disabled={addLoading}
          className="w-full bg-gradient-to-r from-cyan-500 to-emerald-500 text-white px-6 py-3 rounded-lg hover:shadow-lg hover:shadow-cyan-500/50 transition-all font-semibold disabled:opacity-50"
        >
          {addLoading ? <LoadingAnimation /> : type === "post" ? "+ Add Post" : "+ Add Reel"}
        </button>
      </form>
    </div>
  );
};

export default AddPost;
