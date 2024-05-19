import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  uploadDeleteImgCloudinary,
  uploadOnCloudinary,
  uploadUpdateCloudinary,
} from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page, limit, search, sortBy, sortType } = req.query;

  // 1. Build the filter query
  let filter = {};
  if (search) {
    filter.title = { $regex: search, $options: "i" };
  }

  // 2. Build the sort options
  let sort = {};
  if (sortBy) {
    sort[sortBy] = sortType === "asc" ? 1 : -1;
  }

  // 3. Calculate pagination parameters

  const skip = (page - 1) * limit;

  // 4. Fetch data based on the filters, sort, and pagination
  const [data, totalRecord] = await Promise.all([
    Video.find(filter).sort(sort).skip(skip).limit(limit),
    Video.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(totalRecord / limit);

  // 5. Return the response
  return res
    .status(200)
    .json(
      new ApiResponse(200, { data, totalRecord, totalPages }, "Record Filter")
    );
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description, isPublished } = req.body;

  if (!title && !description) {
    throw new ApiError(400, "title & description Are Required");
  }

  const VideoFileLocalPath = req.files?.videoFile[0]?.path;
  const ThumbnailLocalPath = req.files?.thumbnail[0]?.path;

  if (!VideoFileLocalPath) {
    throw new ApiError(400, "Video Not UploadDed");
  }
  if (!ThumbnailLocalPath) {
    throw new ApiError(400, "Thumbnail Not UploadDed");
  }

  const VideoFilePath = await uploadOnCloudinary(VideoFileLocalPath);
  const ThumbnailPath = await uploadOnCloudinary(ThumbnailLocalPath);

  const video = await Video.create({
    videoFile: VideoFilePath.url,
    thumbnail: ThumbnailPath.url,
    title,
    description,
    duration: "",
    isPublished,
    owner: req.user?._id,
  });

  const createVideo = await Video.findById(video?._id);

  if (!createVideo) {
    throw new ApiError(400, "Something went wrong while Add Video ");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, createVideo, "Add Video SuccessFully"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) {
    throw new ApiError(400, "Video Not Found ");
  }
  const data = await Video.findByIdAndUpdate(
    videoId,
    {
      $inc: {
        views: 1,
      },
    },
    {
      new: true,
    }
  );
  return res
    .status(200)
    .json(new ApiResponse(200, data, " Video Find SuccessFully"));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { title, description } = req.body;
  //TODO: update video details like title, description, thumbnail
  if (!videoId) {
    throw new ApiError(400, "Video Not Found ");
  }
  console.log(req.file?.path);
  const thumbnailLocalPath = req.file?.path;

  if (!thumbnailLocalPath) {
    throw new ApiError(400, "Img Not Uploaded");
  }

  const OldCloud = await Video.findById(videoId);
  if (!OldCloud || !OldCloud.thumbnail) {
    return res.status(404).json(new ApiResponse(404, "Avatar not found"));
  }

  const avatarUrl = OldCloud.thumbnail;
  const matches = avatarUrl.match(/\/upload\/[^/]+\/([^/.]+)/);

  const deleteClod = await uploadUpdateCloudinary(matches && matches[1]);

  const thumbnailAdd = await uploadOnCloudinary(thumbnailLocalPath);

  const data = await Video.findByIdAndUpdate(videoId, {
    $set: {
      title,
      description,
      thumbnail: thumbnailAdd,
    },
  });

  return res.status(200).json(new ApiResponse(200, data, "Data is Updated "));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const GetVCloudPath = await Video.findById(videoId);
  console.log("GetVCloudPath", GetVCloudPath);
  if (!GetVCloudPath?.videoFile) {
    return res.status(404).json(new ApiResponse(404, "Video not found"));
  }
  if (!GetVCloudPath?.thumbnail) {
    return res.status(404).json(new ApiResponse(404, "ThumBNail not found"));
  }

  const VideoVFileUrl = GetVCloudPath.videoFile;
  const VideoTFileUrl = GetVCloudPath.thumbnail;

  const VMatches = VideoVFileUrl.match(/\/upload\/[^/]+\/([^/.]+)/);
  const TMatches = VideoTFileUrl.match(/\/upload\/[^/]+\/([^/.]+)/);

  const deleteClod = await uploadDeleteImgCloudinary(VMatches && VMatches[1]);
  const TDeleteClod = await uploadUpdateCloudinary(TMatches && TMatches[1]);

  const Delete = await Video.findByIdAndDelete(videoId);

  return res
    .status(200)
    .json(new ApiResponse(200, Delete, "Deleted SuccessFully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { isPublished } = req.body;
  if (!videoId) {
    throw new ApiError(400, "video Id not found");
  }
  await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        isPublished,
      },
    },
    {
      new: true,
    }
  );
  return res.status(200).json(new ApiResponse(200, "Data Updated"));
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
