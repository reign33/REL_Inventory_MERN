import Categories from "../model/Category.js";
import jwt from "jsonwebtoken";
import getTokenFrom from "../utils/getTokenFrom.js";
import config from "../utils/config.js";
import User from "../model/User.js";


async function getCategoryInfo(_, res, next) {
  try {
    const category = await Categories.find({});
    const categoryCount = category.length;
    return res.send(`<p>Total Category: ${categoryCount}</p>`);
  } catch (error) {
    next(error);
  }
}

async function getCategories(req, res, next) {
  try {
    const decodedToken = jwt.verify(getTokenFrom(req), config.JWT_SECRET);
    const category = await Categories.find({ userId: decodedToken.id }).populate(
      "userId",
      {
        username: 1,
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
    const category = await Categories.findById(id);
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
    const category = await Categories.findByIdAndDelete(id);

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

  console.log('createCategory', body);

  try {
    const decodedToken = jwt.verify(getTokenFrom(req), config.JWT_SECRET);

    if (!decodedToken.id) {
      return res.status(401).json({ error: "token invalid" });
    }

    const user = await User.findById(decodedToken.id);

    if (!body.content) {
      return res.status(400).json({ error: "content missing" });
    }

    const category = new Categories({
      content: body.content.trim(),
      userId: user.id,
    });

    const savedCategory = await category.save();

    user.category = user.category.concat(savedCategory._id); //sa schema di gumagana ung id kaya _id
    await user.save();

    return res.status(201).json(savedCategory);
  } catch (error) {
    next(error);
  }
}

async function updateCategory(req, res, next) {
  const id = req.params.id;
  const { content } = req.body;
  const category = {
    content
  };

  try {
    const updatedCategory = await Categories.findByIdAndUpdate(id, category, {
      new: true,
      runValidators: true,
      context: "query",
    });

    if (!updatedCategory) return res.status(404).send({ error: "Category not found!" });

    return res.status(200).json({updatedCategory});
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