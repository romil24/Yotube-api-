import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(channelId)) {
    throw new ApiError(400, "Invalid Channel Id");
  }

  const totalVideoViews = await Video.aggregate([
    { $match: { channel: mongoose.Types.ObjectId(channelId) } },
    { $group: { _id: null, totalViews: { $sum: "$views" } } },
  ]);

  const totalSubscribers = await Subscription.countDocuments({
    channel: channelId,
  });

  const totalVideos = await Video.countDocuments({ channel: channelId });

  const totalLikes = await Like.countDocuments({
    video: { $in: await Video.find({ channel: channelId }).distinct("_id") },
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        totalVideoViews: totalVideoViews[0]?.totalViews || 0,
        totalSubscribers,
        totalVideos,
        totalLikes,
      },
      "Channel stats retrieved successfully"
    )
  );
});

const getChannelVideos = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(channelId)) {
    throw new ApiError(400, "Invalid Channel Id");
  }

  const videos = await Video.find({ channel: channelId });

  return res
    .status(200)
    .json(
      new ApiResponse(200, videos, "Channel videos retrieved successfully")
    );
});

export { getChannelStats, getChannelVideos };
