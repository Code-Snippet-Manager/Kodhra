const mongoose = require("mongoose");
const cardDB = require("../models/Card");
const folderDB = require("../models/folder");
const userDB = require("../models/User");
const notebookDB = require("../models/Notebook");

/**
 * @param {String} searchTerm
 * @param {String} user_Name
 * @param {String} Language
 * @param {Number} pageNum
 * @returns {Promise}
 */

async function searchAlgoritm(searchTerm, user_Name, Language, pageNum = 1) {
  let userId = null;
  const user = await userDB.findOne({ userName: user_Name }).select("_id");
  if (user) {
    userId = user._id;
  }
  // Search in cards
  let query = { isDeleted: false };
  if (searchTerm) {
    query.$text = { $search: searchTerm };
  }

  if (user_Name) {
    query.author = userId;
  }

  if (Language) {
    query.category = { $regex: Language, $options: "i" };
  }

  // Search in folders
  let folderQuery = { isDeleted: false };
  if (searchTerm) {
    folderQuery.$or = [{ folderName: { $regex: searchTerm, $options: "i" } }];
  }

  if (user_Name) {
    folderQuery.author = userId;
  }

  // Search In Notebooks
  let notebookQuery = { isDeleted: false };
  if (searchTerm) {
    notebookQuery.$or = [
      { notebookName: { $regex: searchTerm, $options: "i" } },
    ];
  }

  if (user_Name) {
    notebookQuery.author = userId;
  }

  // Search in users
  const useridQuery = {};
  if (user_Name) {
    useridQuery.$or = [{ userName: { $regex: user_Name, $options: "i" } }];
  }

  const page = parseInt(pageNum) || 1;
  const limit = 10;
  const skip = (page - 1) * limit;

  const users = await userDB.find(useridQuery);
  const notebooks = await notebookDB
    .find(notebookQuery)
    .populate("author")
    .skip(skip)
    .limit(limit);
  const folders = await folderDB.find(folderQuery).populate("author").limit(30);
  const cards = await cardDB
    .find(query, { score: { $meta: "textScore" } })
    .sort({ score: { $meta: "textScore" } })
    .populate("author")
    .skip(skip)
    .limit(limit);

  return {
    users,
    notebooks,
    folders,
    cards,
  };
}

module.exports = searchAlgoritm;
