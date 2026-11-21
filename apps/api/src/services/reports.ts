import mongoose from "mongoose";
import { Folder } from "../model/folder.js";
import { Snippet } from "../model/snippet.js";
import { logger } from "../config/logger.js";
export const getReportService = async (userId: string) => {
  const objectId = new mongoose.Types.ObjectId(userId);
  const getSnippetCount = await Snippet.countDocuments({
    author: objectId,
    isDeleted: false,
  });
  const getFolderCount = await Folder.countDocuments({
    userId: objectId,
    isDeleted: false,
  });
  const totalUniqueTags = await Snippet.aggregate([
    {
      $match: {
        author: objectId,
        isDeleted: false,
      },
    },
    { $unwind: "$tags" },
    { $group: { _id: "$tags" } },
    { $count: "totalUniqueTags" },
  ]);
  const getTotalTagsCount = totalUniqueTags[0]?.totalUniqueTags ?? 0;
  const getMUPLanguages = await Snippet.aggregate([
    {
      $match: {
        author: objectId,
        isDeleted: false,
      },
    },
    {
      $group: {
        _id: "$language",
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
    { $limit: 5 },
    {
      $project: {
        _id: 0,
        language: "$_id",
        count: 1,
      },
    },
  ]);

  logger.info(
    `${JSON.stringify(getSnippetCount)}, ${getFolderCount}, ${getTotalTagsCount}, ${getMUPLanguages} `,
  );
  return {
    getSnippetCount,
    getFolderCount,
    getTotalTagsCount,
    getMUPLanguages,
  };
};
export const getDailyWiseReportService = async (
  userId: string,
  startDate: string,
  endDate: string,
) => {
  const objectId = new mongoose.Types.ObjectId(userId);
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start >= end) {
    throw new Error("Invalid date range");
  }
  const reports = await Snippet.aggregate([
    {
      $match: {
        author: objectId,
        isDeleted: false,
        createdAt: {
          $gte: start,
          $lte: end,
        },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: {
            format: "%Y-%m-%d",
            date: "$createdAt",
            timezone: "Asia/Kolkata",
          },
        },
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        date: "$_id",
        count: 1,
      },
    },
    {
      $sort: {
        date: 1,
      },
    },
  ]);
  return reports;
};

export const getReportByLanguageService = async (userId: string) => {
  const objectId = new mongoose.Types.ObjectId(userId);
  const reports = await Snippet.aggregate([
    {
      $match: {
        author: objectId,
        isDeleted: false,
      },
    },
    {
      $group: {
        _id: "$language",
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
    { $limit: 5 },
    {
      $project: {
        _id: 0,
        language: "$_id",
        count: 1,
      },
    },
  ]);
  return reports;
};
