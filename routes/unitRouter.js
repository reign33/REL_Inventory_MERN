import express from "express";
import unitController from "../controller/unitController.js";

const unitRouter = express.Router();

unitRouter.get("/info", unitController.getUnitInfo);
unitRouter.get("/", unitController.getUnits);
unitRouter.get("/:id", unitController.getUnit);
unitRouter.delete("/:id", unitController.deleteUnit);
unitRouter.post("/", unitController.createUnit);
unitRouter.put("/:id", unitController.updateUnit);

export default unitRouter;