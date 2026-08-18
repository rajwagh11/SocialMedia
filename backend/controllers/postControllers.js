import TryCatch  from "../utils/TryCatch.js"
import { Post } from"../models/postModel.js"
import { User } from "../models/userModel.js"
import getDataUrl from "../utils/urlGenrator.js"
import cloudinary from "cloudinary"
import { moderateMediaAndText, generateCaption } from "../utils/aiModeration.js";

export const newPost = TryCatch(async (req, res) => {
  const { caption } = req.body;
  const ownerId = req.user._id;
  const file = req.file;

  if (!file) return res.status(400).json({ message: "No file uploaded" });

  const fileUrl = getDataUrl(file);
  let option;
  const type = req.query.type;

  if (type === "reel") {
    option = { resource_type: "video", access_mode: "public" };
  } else if (file.mimetype === "application/pdf") {
    option = { resource_type: "raw", access_mode: "public", type: "upload" };
  } else {
    option = { resource_type: "auto", access_mode: "public" };
  }

  const tempUpload = await cloudinary.v2.uploader.upload(fileUrl.content, { folder: "temp", ...option });
  const imageUrl = tempUpload.secure_url;

  let allowed = true;
  let reasons = [];

  // FIX: param key must be `imageBuffer` to match moderateMediaAndText's destructuring.
  // Previously this was `imageBytes` / `imageMimeType`, which meant `imageBuffer`
  // was always undefined inside the function -> moderation silently auto-passed
  // every single image (`if (!imageBuffer) return { allowed: true, reasons: [] }`).
  if (type !== "reel" && file.mimetype !== "application/pdf") {
    console.log("Moderation input:", {
      hasBuffer: !!file.buffer,
      bufferLen: file.buffer?.length,
      mimetype: file.mimetype,
      caption,
    });

    const moderation = await moderateMediaAndText({
      imageBuffer: file.buffer,
      caption,
    });

    console.log("Moderation result:", moderation);

    allowed = moderation.allowed;
    reasons = moderation.reasons;
  } else {
    const moderation = await moderateMediaAndText({
      imageBuffer: undefined,
      caption,
    });
    allowed = moderation.allowed;
    reasons = moderation.reasons;
  }

  if (!allowed) {
    await cloudinary.v2.uploader.destroy(tempUpload.public_id);
    return res.status(403).json({ message: "Content blocked by AI moderation", reasons });
  }

  const finalUpload = await cloudinary.v2.uploader.upload(fileUrl.content, { folder: "posts", ...option });

  const post = await Post.create({
    caption,
    post: { id: finalUpload.public_id, url: finalUpload.secure_url },
    owner: ownerId,
    type,
  });

  res.status(201).json({
    message: "Post created",
    post,
  });
});

// AI caption suggestion — pure analysis, no Cloudinary upload and no Post document.
// The user reviews/edits the suggestion before the actual /new upload happens.
const MAX_CAPTION_MEDIA_BYTES = 15 * 1024 * 1024; // 15MB, inline API request limit headroom

export const suggestCaption = TryCatch(async (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).json({ message: "No file uploaded" });

  console.log(`📸 Caption request received: ${(file.buffer.length / 1024).toFixed(0)}KB, ${file.mimetype}`);

  if (file.mimetype === "application/pdf") {
    return res.status(400).json({ message: "Captions can't be generated for documents" });
  }

  if (file.buffer.length > MAX_CAPTION_MEDIA_BYTES) {
    return res.status(400).json({ message: "File is too large for caption generation — try a smaller one, or write your own." });
  }

  const { caption, error } = await generateCaption(file.buffer, file.mimetype);

  if (!caption) {
    return res.status(422).json({ message: error || "Couldn't generate a caption for this." });
  }

  res.json({ caption });
});

export const deletePost = TryCatch(async (req, res) => {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "No post with this id" });
    }

    if (post.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await cloudinary.v2.uploader.destroy(post.post.id);

    await post.deleteOne();

    res.json({ message: "Post deleted" });
  });

  export const getAllPosts = TryCatch(async (req, res) => {
    const currentUser = await User.findById(req.user._id);

    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const allPosts = await Post.find({ type: "post" })
      .sort({ createdAt: -1 })
      .populate("owner","-password")
      .populate({
        path:"comments.user",
        select:"-password",
      })

    const allReels = await Post.find({ type: "reel" })
      .sort({ createdAt: -1 })
      .populate("owner","-password")
      .populate({
        path:"comments.user",
        select:"-password",
      })

    const posts = allPosts.filter(post => post.owner && post.owner.emailDomain === currentUser.emailDomain);
    const reels = allReels.filter(reel => reel.owner && reel.owner.emailDomain === currentUser.emailDomain);

    res.json({ posts, reels });
});


export const likeUnlikePost = TryCatch(async(req,res) => {
  const post = await Post.findById(req.params.id);

  if(!post)
    return res.status(404).json({
      message:"No post with this id",
    })

    if(post.likes.includes(req.user._id)){
      const index = post.likes.indexOf(req.user._id);

      post.likes.splice(index,1);

      await post.save();

      res.json({
        message: " Post Unlike ",
      });
    }else{
      post.likes.push(req.user._id)

      await post.save();

      res.json({
        message:"Post liked",
      })
    }
})

export const commentonPost = TryCatch(async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (!post)
    return res.status(404).json({
      message: "No post with this id",
    });

  post.comments.push({
    user: req.user._id,
    name: req.user.name,
    comment: req.body.comment,
  });

  await post.save();

  res.json({
    message: "Comment Added",
  });
});

export const deleteComment = TryCatch(async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    return res.status(404).json({
      message: "No post with this id",
    });
  }

  if (!req.query.commentId) {
    return res.status(404).json({
      message: "No commentId provided",
    });
  }

  const commentIndex = post.comments.findIndex(
    (item) => item._id.toString() === req.query.commentId.toString()
  );

  if (commentIndex === -1) {
    return res.status(400).json({
      message: "Comment not found",
    });
  }

  const comment = post.comments[commentIndex];

  if (post.owner.toString() === req.user._id.toString() || comment.user.toString() === req.user._id.toString()) {
    post.comments.splice(commentIndex, 1);

    await post.save();

    return res.json({
      message: "Comment deleted",
    });
  } else {
    return res.status(404).json({
      message: "You are not allowed to delete this comment",
    });
  }
});

export const editCaption = TryCatch(async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    return res.status(404).json({
      message: "No post with this id"
    });
  }

  if (post.owner.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      message: "You are not the owner of this post"
    });
  }

  post.caption = req.body.caption;

  await post.save();

  res.json({
    message: "Caption updated successfully"
  });
});
