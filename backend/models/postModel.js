import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
    caption: String,

    post:{
        id:String,
        url:String,
    },

    type:{
        type:String,
        required:true,
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
    },
    createdAt:{
        type:Date,
        default:Date.now,
    },

    likes:[
        {
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
        },
    ],
    comments:[
    {
       user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
       },
       name:{
        type :"String",
        required: true,
       },
       comment:{
        type:"String",
        required: true,
       },
       moderation: {
        status: {
          type: String,
          enum: ["approved", "flagged", "removed"],
          default: "approved",
        },
        reasons: [String],
       },
       createdAt: {
        type: Date,
        default: Date.now,
       },
    },
  ],
  moderation: {
    status: {
      type: String,
      enum: ["approved", "flagged", "removed"],
      default: "approved",
    },
    reasons: [String],
  },
})


export const Post = mongoose.model("Post", postSchema);