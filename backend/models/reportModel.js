import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    targetType: {
      type: String,
      enum: ["post", "comment"],
      required: true,
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    // Only set when targetType === "comment" (references the comment subdocument's _id)
    commentId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    // Denormalized so the dashboard can show/act on the content owner without an extra lookup
    targetOwner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reason: {
      type: String,
      enum: ["nudity", "harassment", "hate_speech", "violence", "spam", "misinformation", "other"],
      required: true,
    },
    details: {
      type: String,
      maxlength: 500,
    },
    status: {
      type: String,
      enum: ["pending", "dismissed", "action_taken"],
      default: "pending",
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    reviewNote: {
      type: String,
      maxlength: 500,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    emailDomain: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export const Report = mongoose.model("Report", reportSchema);
