import express from "express";
import profileController from "../controller/profileController.js";

const profileRouter = express.Router();

profileRouter.get("/info", profileController.getProfileInfo);
profileRouter.get("/", profileController.getProfiles);
profileRouter.get("/:id", profileController.getProfile);
profileRouter.delete("/:id", profileController.deleteProfile);
profileRouter.post("/", profileController.createProfile);

export default profileRouter;