import Profiles from "../model/Profile.js";
import jwt from "jsonwebtoken";
import getTokenFrom from "../utils/getTokenFrom.js";
import config from "../utils/config.js";
import User from "../model/User.js";
import uploadFile from "../utils/uploadFile.js";
import { deleteObject, ref } from "firebase/storage";
import storage from "../utils/firebaseConfig.js";


async function getProfileInfo(_, res, next) {
  try {
    const profile = await Profiles.find({});
    const profileCount = profile.length;
    return res.send(`<p>Total Units: ${profileCount}</p>`);
  } catch (error) {
    next(error);
  }
}

async function getProfiles(req, res, next) {
  try {
    const decodedToken = jwt.verify(getTokenFrom(req), config.JWT_SECRET);
    const profile = await Profiles.find({ userId: decodedToken.id }).populate(
      "userId",
      {
        username: 1,
      }
    );
    return res.json(profile);
  } catch (error) {
    next(error);
  }
}

async function getProfile(req, res, next) {
  const id = req.params.id;

  try {
    const profile = await Profiles.findById(id);
    if (!profile) return res.status(404).json({ message: "Profiles not found!" });
    return res.json(profile);
  } catch (error) {
    next(error);
  }
}

async function deleteProfile(req, res, next) {
  const id = req.params.id;
  const decodedToken = jwt.verify(getTokenFrom(req), config.JWT_SECRET);
  console.log("delete profileController", id);
  

  try {
    const user = await User.findById(decodedToken.id);
    const profile = await Profiles.findByIdAndDelete(id);
    console.log("decodedtoken.id profileController", user );

    // Delete photo from Firebase Storage
    const photoRef = ref(storage, profile.photoInfo.filename);
    await deleteObject(photoRef);


    user.profile = user.profile.filter(
      (profileId) => profileId.toString() !== profile._id.toString()
    );
    await user.save();

    return res.status(204).end();
  } catch (error) {
    next(error);
  }
}

async function createProfile(req, res, next) {
  const file =req.file;

  try {
    const decodedToken = jwt.verify(getTokenFrom(req), config.JWT_SECRET);

    if (!decodedToken.id) {
      return res.status(401).json({ error: "token invalid" });
    }

    const user = await User.findById(decodedToken.id);

    const photoInfo = await uploadFile(file);

    const profile = new Profiles({
      photoInfo,
      userId: user.id,
    });

    const savedProfile = await profile.save();

    user.profile = user.profile.concat(savedProfile._id); //sa schema di gumagana ung id kaya _id
    await user.save();

    return res.status(201).json(savedProfile);
  } catch (error) {
    next(error);
  }
}



export default {
  getProfileInfo,
  getProfiles,
  getProfile,
  deleteProfile,
  createProfile,
};