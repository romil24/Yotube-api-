import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: toggle like on video
  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid Channel Id");
  }

  const ExistLink = await Like.findOne({
    video: videoId,
    likedBy: req.user?._id,
  });

  if (ExistLink) {
    await Like.findByIdAndDelete({ video: videoId, likedBy: userId });
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Like Removed Successfully"));
  } else {
    await Like.create({ video: videoId, likedBy: userId });
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Like Added Successfully"));
  }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  //TODO: toggle like on comment
  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid Channel Id");
  }

  const Comment = await Like.findOne({
    comment: commentId,
    likedBy: req.user?._id,
  });

  if (Comment) {
    await Like.findByIdAndDelete({ comment: commentId, likedBy: userId });
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "comment Like Removed Successfully"));
  } else {
    await Like.create({ comment: commentId, likedBy: userId });
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "comment Like  Added Successfully"));
  }
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  //TODO: toggle like on tweet
  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid Channel Id");
  }

  const commentLike = await Like.findOne({
    tweet: tweetId,
    likedBy: req.user?._id,
  });

  if (commentLike) {
    await Like.findByIdAndDelete({ tweet: tweetId, likedBy: userId });
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "tweet Like Removed Successfully"));
  } else {
    await Like.create({ video: videoId, likedBy: userId });
    return res
      .status(200)
      .json(new ApiResponse(200, {}, " tweet Like Added Successfully"));
  }
});

const getLikedVideos = asyncHandler(async (req, res) => {
  //TODO: get all liked videos
  const { videoId } = req.params;
  const commentLike = await Like.findOne({ video: videoId, likedBy: userId });
  return res
    .status(200)
    .json(new ApiResponse(200, commentLike, "Get Video Like"));
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
