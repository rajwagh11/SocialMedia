import mongoose from "mongoose";

const moderationLogSchema = new mongoose.Schema(
  {
    contentType: {
      type: String,
      enum: ["post", "comment"],
      required: true,
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      default: null,
    },
    // Only set when contentType === "comment"
    commentId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    // Author of the content this log entry is about
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: {
      type: String,
      enum: [
        "auto_blocked",      
        "auto_flagged",      
        "admin_approved",     
        "admin_removed",      
        "admin_dismissed_report",
        "admin_warned_user",
        "admin_banned_user",
        "admin_unbanned_user",
      ],
      required: true,
    },
    source: {
      type: String,
      enum: ["ai_image", "ai_text", "ai_spam", "user_report", "admin"],
      required: true,
    },
    reasons: [String],
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    report: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Report",
      default: null,
    },
    emailDomain: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export const ModerationLog = mongoose.model("ModerationLog", moderationLogSchema);
