import Category from "../model/Category.js";
import jwt from "jsonwebtoken";
import getTokenFrom from "../utils/getTokenFrom.js";
import config from "../utils/config.js";
import User from "../model/User.js";
import uploadFile from "../utils/uploadFile.js";
import { deleteObject, ref } from "firebase/storage";
import storage from "../utils/firebaseConfig.js";

async function getCategoryInfo(_, res, next) {
  try {
    const category = await Category.find({});
    const categoryCount = category.length;
    return res.send(`<p>Total Category: ${categoryCount}</p>`);
  } catch (error) {
    next(error);
  }
}

async function getCategories(req, res, next) {
  try {
    const decodedToken = jwt.verify(getTokenFrom(req), config.JWT_SECRET);
    const category = await Category.find({ userId: decodedToken.id }).populate(
      "userId",
      {
        username: 1,
        name: 1,
      }
    );
    return res.json(category);
  } catch (error) {
    next(error);
  }
}

async function getCategory(req, res, next) {
  const id = req.params.id;

  try {
    const category = await Category.findById(id);
    if (!category) return res.status(404).json({ message: "Category not found!" });
    return res.json(category);
  } catch (error) {
    next(error);
  }
}

async function deleteCategory(req, res, next) {
  const id = req.params.id;
  const decodedToken = jwt.verify(getTokenFrom(req), config.JWT_SECRET);

  try {
    const user = await User.findById(decodedToken.id);
    const category = await Category.findByIdAndDelete(id);

    // Delete photo from Firebase Storage
    const photoRef = ref(storage, note.photoInfo.filename);
    await deleteObject(photoRef);

    user.category = user.category.filter(
      (categoryId) => categoryId.toString() !== category._id.toString()
    );
    await user.save();

    return res.status(204).end();
  } catch (error) {
    next(error);
  }
}

async function createCategory(req, res, next) {
  const body = req.body;
  const file = req.file;

  try {
    const decodedToken = jwt.verify(getTokenFrom(req), config.JWT_SECRET);

    if (!decodedToken.id) {
      return res.status(401).json({ error: "token invalid" });
    }

    const user = await User.findById(decodedToken.id);

    if (!body.content) {
      return res.status(400).json({ error: "content missing" });
    }

    const photoInfo = await uploadFile(file);

    const category = new Category({
      content: body.content.trim(),
      important: body.important || false,
      userId: user.id,
      photoInfo,
    });

    const savedCategory = await category.save().then((result) => result);

    user.category = user.category.concat(savedCategory._id); //sa schema di gumagana ung id kaya _id
    await user.save();

    return res.status(201).json(savedCategory);
  } catch (error) {
    next(error);
  }
}

async function updateCategory(req, res, next) {
  const id = req.params.id;
  const { content, important } = req.body;
  const category = {
    content,
    important,
  };

  try {
    const updatedCategory = await Category.findByIdAndUpdate(id, category, {
      new: true,
      runValidators: true,
      context: "query",
    });

    if (!updatedCategory) return res.status(404).send({ error: "Category not found!" });

    return res.status(200).json(updatedCategory);
  } catch (error) {
    next(error);
  }
}

export default {
  getCategoryInfo,
  getCategories,
  getCategory,
  deleteCategory,
  createCategory,
  updateCategory,
};