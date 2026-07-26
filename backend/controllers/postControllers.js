import TryCatch  from "../utils/TryCatch.js"
import { Post } from"../models/postModel.js"
import { User } from "../models/userModel.js"
import getDataUrl from "../utils/urlGenrator.js"
import cloudinary from "cloudinary"
import { moderateMediaAndText } from "../utils/aiModeration.js";

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
  if (type !== "reel" && file.mimetype !== "application/pdf") {
    const moderation = await moderateMediaAndText({
      imageBytes: file.buffer,
      imageMimeType: file.mimetype,
      caption,
    });
    allowed = moderation.allowed;
    reasons = moderation.reasons;
  } else {
    const moderation = await moderateMediaAndText({
      imageBytes: undefined,
      imageMimeType: undefined,
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