import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  // TODO: toggle subscription
  const { channelId } = req.params;
  const { userId } = req.body;

  if (!isValidObjectId(channelId) || !isValidObjectId(userId)) {
    throw new ApiError(400, "Id Not Get");
  }
  const channel = await User.findById(channelId);
  const user = await User.findById(channelId);

  if (!channel || !user) {
    throw new ApiError(404, "Channel or user not found");
  }

  const subscription = await Subscription.findOne({
    subscriber: userId,
    channel: channelId,
  });

  if (subscription) {
    await Subscription.remove();
    return res
      .status(200)
      .json(new ApiResponse(200, null, "Unsubscribed SuccessFully"));
  } else {
    const newSubscriber = new Subscription.create({
      subscription: userId,
      channel: channelId,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, newSubscriber, "Subscribed SuccessFully"));
  }
});

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid channel ID");
  }

  const subscribers = await Subscription.find({ channel: channelId }).populate(
    "subscriber",
    "name email"
  );

  if (!subscribers) {
    throw new ApiError(404, "No subscribers found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, subscribers, "Subscribers retrieved successfully")
    );
});

const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;

  if (!isValidObjectId(subscriberId)) {
    throw new ApiError(400, "Invalid subscriber ID");
  }

  const channels = await Subscription.find({
    subscriber: subscriberId,
  }).populate("channel", "name email");

  if (!channels) {
    throw new ApiError(404, "No subscribed channels found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        channels,
        "Subscribed channels retrieved successfully"
      )
    );
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
