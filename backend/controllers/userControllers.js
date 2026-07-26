import TryCatch from "../utils/TryCatch.js";
import { User } from "../models/userModel.js";
import getDataUrl from "../utils/urlGenrator.js";
import cloudinary from "cloudinary";
import bcrypt from "bcrypt";


export const myProfile = TryCatch(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  res.json(user);
});


export const userProfile = TryCatch(async (req, res) => {
  const loggedInUser = await User.findById(req.user._id);
  const user = await User.findById(req.params.id).select("-password");

  if (!user) {
    return res.status(404).json({
      message: "No user found",
    });
  }


  if (loggedInUser.emailDomain !== user.emailDomain) {
    return res.status(403).json({ message: "Access denied - different domain" });
  }

  res.json(user);
});


export const followandUnfollowUser = TryCatch(async (req, res) => {
  const user = await User.findById(req.params.id);
  const loggedInUser = await User.findById(req.user._id);

  if (!user) return res.status(404).json({ message: "No User with this id" });
  if (user._id.toString() === loggedInUser._id.toString()) {
    return res.status(400).json({ message: "You can't follow yourself" });
  }

  if (user.emailDomain !== loggedInUser.emailDomain) {
    return res
      .status(403)
      .json({ message: "Cannot follow user from a different domain" });
  }

  if (user.followers.includes(loggedInUser._id)) {
    const indexFollowing = loggedInUser.followings.indexOf(user._id);
    const indexFollower = user.followers.indexOf(loggedInUser._id);

    loggedInUser.followings.splice(indexFollowing, 1);
    user.followers.splice(indexFollower, 1);

    await loggedInUser.save();
    await user.save();

    res.json({ message: "User Unfollowed" });
  } else {
    loggedInUser.followings.push(user._id);
    user.followers.push(loggedInUser._id);

    await loggedInUser.save();
    await user.save();

    res.json({ message: "User Followed" });
  }
});

export const userfollowerandFollowingData = TryCatch(async (req, res) => {
  const loggedInUser = await User.findById(req.user._id);
  const user = await User.findById(req.params.id)
    .select("-password")
    .populate("followers", "-password")
    .populate("followings", "-password");

  if (!user) return res.status(404).json({ message: "User not found" });

  const followers = user.followers.filter(
    (f) => f.emailDomain === loggedInUser.emailDomain
  );
  const followings = user.followings.filter(
    (f) => f.emailDomain === loggedInUser.emailDomain
  );

  res.json({ followers, followings });
});

export const updateProfile = TryCatch(async (req, res) => {
  const user = await User.findById(req.user._id);
  const { name } = req.body;

  if (name) {
    user.name = name;
  }

  const file = req.file;
  if (file) {
    const fileUrl = getDataUrl(file);
    await cloudinary.v2.uploader.destroy(user.profilePic.id);
    const myCloud = await cloudinary.v2.uploader.upload(fileUrl.content);

    user.profilePic.id = myCloud.public_id;
    user.profilePic.url = myCloud.secure_url;
  }

  await user.save();

  res.json({
    message: "Profile updated successfully",
  });
});

export const updatePassword = TryCatch(async (req, res) => {
  const user = await User.findById(req.user._id);
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return res
      .status(400)
      .json({ message: "Both old and new passwords are required." });
  }

  const comparePassword = await bcrypt.compare(oldPassword, user.password);
  if (!comparePassword) {
    return res.status(400).json({
      message: "Wrong old password",
    });
  }

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  res.json({
    message: "Password Updated",
  });
});

export const getAllUsers = TryCatch(async (req, res) => {
  const currentUser = await User.findById(req.user._id);

  if (!currentUser) {
    return res.status(404).json({ message: "User not found" });
  }

  const sameDomainUsers = await User.find({
    emailDomain: currentUser.emailDomain,
    _id: { $ne: currentUser._id },
  }).select("-password");

  res.status(200).json({
    success: true,
    users: sameDomainUsers,
  });
});
