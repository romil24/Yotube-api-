import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";

const getVideoComments = asyncHandler(async (req, res) => {
  //TODO: get all comments for a video
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;
  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Video Id Not Found");
  }
  const skip = (page - 1) * limit;
  const data = await Video.findById(videoId).skip(skip).limit(limit);
  return res.status(200).json(new ApiResponse(200, data, "Data Find"));
});

const addComment = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { content } = req.body;

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Video Id Not Found");
  }

  if (!content) {
    throw new ApiError(400, "Place Enter Content ");
  }
  const VideoExist = await Video.findById(videoId);
  if (!VideoExist) {
    throw new ApiError(400, "Video  Not Found");
  }
  const data = await Comment.create({
    content,
    video: VideoExist,
    owner: req.user?._id,
  });
  return res
    .status(200)
    .json(new ApiResponse(200, data, "Comment Added SuccessFully"));
});

const updateComment = asyncHandler(async (req, res) => {
  // TODO: update a comment
  const { CId } = req.params;
  const { content } = req.body;
  if (!mongoose.Types.ObjectId.isValid(CId)) {
    throw new ApiError(400, "Video Id Not Found");
  }
  await Comment.findByIdAndUpdate(
    userId,
    {
      $set: {
        content,
      },
    },
    {
      new: true,
    }
  );
  return res
    .status(200)
    .json(new ApiResponse(200, null, "Updated SuccessFully "));
});

const deleteComment = asyncHandler(async (req, res) => {
  // TODO: delete a comment
  const { CId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(CId)) {
    throw new ApiError(400, "Video Id Not Found");
  }
  await Comment.findByIdAndDelete(CId);

  return res
    .status(200)
    .json(new ApiResponse(200), null, "Deleted SuccessFully");
});

export { getVideoComments, addComment, updateComment, deleteComment };
