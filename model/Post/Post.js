const express = require("express");
const storage = require("../../config/cloudinary");
const multer = require("multer");
const {
  postDetailsCtrl,
  createpostCtrl,
  deletepostCtrl,
  updatepostCtrl,
  fetchPostsCtrl,
  toggleLikesPostCtrl,
  toggleDisLikesPostCtrl,
} = require("../../controllers/posts/postCtrl");
const isLogin = require("../../middlewares/isLogin");

const postRouter = express.Router();

//file upload middleware
const upload = multer({ storage });const mongoose = require("mongoose");

//create schema
const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Post Title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Post description is required"],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Post category is required"],
    },
    numViews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    disLikes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Please Author is required"],
    },
    photo: {
      type: String,
      required: [true, "Post Image is required"],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

//Hook
postSchema.pre(/^find/, function (next) {
  //add views count as virtual field
  postSchema.virtual("viewsCount").get(function () {
    const post = this;
    return post.numViews.length;
  });
  //add likes count as virtual field
  postSchema.virtual("likesCount").get(function () {
    const post = this;
    return post.likes.length;
  });

  //add dislikes count as virtual field
  postSchema.virtual("disLikesCount").get(function () {
    const post = this;
    return post.disLikes.length;
  });
  //check the most liked post in percentage
  postSchema.virtual("likesPercentage").get(function () {
    const post = this;
    const total = +post.likes.length + +post.disLikes.length;
    const percentage = (post.likes.length / total) * 100;
    return `${percentage}%`;
  });

  //check the most disliked post in percentage
  postSchema.virtual("disLikesPercentage").get(function () {
    const post = this;
    const total = +post.disLikes.length + +post.disLikes.length;
    const percentage = (post.disLikes.length / total) * 100;
    return `${percentage}%`;
  });

  //if days is less is 0 return today if days is 1 return yesterday else return days ago
  postSchema.virtual("daysAgo").get(function () {
    const post = this;
    const date = new Date(post.createdAt);
    const daysAgo = Math.floor((Date.now() - date) / 86400000);
    return daysAgo === 0
      ? "Today"
      : daysAgo === 1
      ? "Yesterday"
      : `${daysAgo} days ago`;
  });
  next();
});

//Compile the post model
const Post = mongoose.model("Post", postSchema);

module.exports = Post;


//POST/api/v1/posts
postRouter.post("/", isLogin, upload.single("image"), createpostCtrl);

//GET/api/v1/posts/:id
postRouter.get("/:id", isLogin, postDetailsCtrl);

//GET/api/v1/posts/likes/:id
postRouter.get("/likes/:id", isLogin, toggleLikesPostCtrl);

//GET/api/v1/posts/dislikes:id
postRouter.get("/dislikes/:id", isLogin, toggleDisLikesPostCtrl);

//GET/api/v1/posts
postRouter.get("/", fetchPostsCtrl);

//DELETE/api/v1/posts/:id
postRouter.delete("/:id", isLogin, deletepostCtrl);

//PUT/api/v1/posts/:id
postRouter.put("/:id", isLogin, upload.single("image"), updatepostCtrl);

module.exports = postRouter;
