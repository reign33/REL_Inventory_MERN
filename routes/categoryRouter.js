import express from "express";
import categoryController from "../controller/categoryController.js";

const categoryRouter = express.Router();

categoryRouter.get("/info", categoryController.getCategoryInfo);
categoryRouter.get("/", categoryController.getCategories);
categoryRouter.get("/:id", categoryController.getCategory);
categoryRouter.delete("/:id", categoryController.deleteCategory);
categoryRouter.post("/", categoryController.createCategory);
categoryRouter.put("/:id", categoryController.updateCategory);

export default categoryRouter;