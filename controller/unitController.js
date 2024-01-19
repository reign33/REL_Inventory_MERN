import Units from "../model/Unit.js";
import jwt from "jsonwebtoken";
import getTokenFrom from "../utils/getTokenFrom.js";
import config from "../utils/config.js";
import User from "../model/User.js";


async function getUnitInfo(_, res, next) {
  try {
    const unit = await Units.find({});
    const unitCount = unit.length;
    return res.send(`<p>Total Units: ${unitCount}</p>`);
  } catch (error) {
    next(error);
  }
}

async function getUnits(req, res, next) {
  try {
    const decodedToken = jwt.verify(getTokenFrom(req), config.JWT_SECRET);
    const unit = await Units.find({ userId: decodedToken.id }).populate(
      "userId",
      {
        username: 1,
      }
    );
    return res.json(unit);
  } catch (error) {
    next(error);
  }
}

async function getUnit(req, res, next) {
  const id = req.params.id;

  try {
    const unit = await Units.findById(id);
    if (!unit) return res.status(404).json({ message: "Unit not found!" });
    return res.json(unit);
  } catch (error) {
    next(error);
  }
}

async function deleteUnit(req, res, next) {
  const id = req.params.id;
  const decodedToken = jwt.verify(getTokenFrom(req), config.JWT_SECRET);

  try {
    const user = await User.findById(decodedToken.id);
    const unit = await Units.findByIdAndDelete(id);

    user.unit = user.unit.filter(
      (unitId) => unitId.toString() !== unit._id.toString()
    );
    await user.save();

    return res.status(204).end();
  } catch (error) {
    next(error);
  }
}

async function createUnit(req, res, next) {
  const body = req.body;

  try {
    const decodedToken = jwt.verify(getTokenFrom(req), config.JWT_SECRET);

    if (!decodedToken.id) {
      return res.status(401).json({ error: "token invalid" });
    }

    const user = await User.findById(decodedToken.id);

    if (!body.content) {
      return res.status(400).json({ error: "content missing" });
    }

    const unit = new Units({
      content: body.content.trim(),
      userId: user.id,
    });

    const savedUnit = await unit.save();

    user.unit = user.unit.concat(savedUnit._id); //sa schema di gumagana ung id kaya _id
    await user.save();

    return res.status(201).json(savedUnit);
  } catch (error) {
    next(error);
  }
}

async function updateUnit(req, res, next) {
  const id = req.params.id;
  const { content } = req.body;
  const unit = {
    content,
  };

  try {
    const updatedUnit = await Units.findByIdAndUpdate(id, unit, {
      new: true,
      runValidators: true,
      context: "query",
    });

    if (!updatedUnit) return res.status(404).send({ error: "Category not found!" });

    return res.status(200).json({updatedUnit});
  } catch (error) {
    next(error);
  }
}

export default {
  getUnitInfo,
  getUnits,
  getUnit,
  deleteUnit,
  createUnit,
  updateUnit,
};