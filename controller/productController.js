import Products from "../model/Product.js";
import jwt from "jsonwebtoken";
import getTokenFrom from "../utils/getTokenFrom.js";
import config from "../utils/config.js";
import User from "../model/User.js";


async function getProductInfo(_, res, next) {
  try {
    const product = await Products.find({});
    const productCount = product.length;
    return res.send(`<p>Total Units: ${productCount}</p>`);
  } catch (error) {
    next(error);
  }
}

async function getProducts(req, res, next) {
  try {
    const decodedToken = jwt.verify(getTokenFrom(req), config.JWT_SECRET);
    const product = await Products.find({ userId: decodedToken.id }).populate(
      "userId",
      {
        username: 1,
      }
    );
    return res.json(product);
  } catch (error) {
    next(error);
  }
}

async function getProduct(req, res, next) {
  const id = req.params.id;

  try {
    const product = await Products.findById(id);
    if (!product) return res.status(404).json({ message: "Unit not found!" });
    return res.json(product);
  } catch (error) {
    next(error);
  }
}

async function deleteProduct(req, res, next) {
  const id = req.params.id;
  const decodedToken = jwt.verify(getTokenFrom(req), config.JWT_SECRET);

  try {
    const user = await User.findById(decodedToken.id);
    const product = await Products.findByIdAndDelete(id);

    user.product = user.product.filter(
      (unitId) => unitId.toString() !== product._id.toString()
    );
    await user.save();

    return res.status(204).end();
  } catch (error) {
    next(error);
  }
}

async function createProduct(req, res, next) {
  const body = req.body;

  try {
    const decodedToken = jwt.verify(getTokenFrom(req), config.JWT_SECRET);

    if (!decodedToken.id) {
      return res.status(401).json({ error: "token invalid" });
    }

    const user = await User.findById(decodedToken.id);

    if (!body) {
      return res.status(400).json({ error: "content missing" });
    }

    const product = new Products({
      name: body.name.trim(),
      category: body.category.trim(),
      quantity: body.quantity.trim(),
      unit: body.unit.trim(),
      price: body.price.trim(),
      userId: user.id,
    });

    const savedProd = await product.save();

    user.product = user.product || [];

    user.product = user.product.concat(savedProd._id); //sa schema di gumagana ung id kaya _id
    await user.save();

    return res.status(201).json(savedProd);
  } catch (error) {
    next(error);
  }
}

async function updateProduct(req, res, next) {
  const id = req.params.id;
  const { name, category, quantity, unit, price } = req.body;
  const product = {
    name,
    category,
    quantity,
    unit,
    price,
  };

  try {
    const updatedProduct = await Products.findByIdAndUpdate(id, product, {
      new: true,
      runValidators: true,
      context: "query",
    });

    if (!updatedProduct) return res.status(404).send({ error: "Category not found!" });

    return res.status(200).json({updatedProduct});
  } catch (error) {
    next(error);
  }
}

export default {
  getProductInfo,
  getProducts,
  getProduct,
  deleteProduct,
  createProduct,
  updateProduct,
};