import express from "express";
import userController from "../controller/userController.js";

const userRouter = express.Router();

userRouter.get("/", userController.getUsers);
userRouter.post("/", userController.createUser);
userRouter.post("/login", userController.loginUser);
userRouter.delete("/:id", userController.deleteUser);
userRouter.put("/:id", userController.updateName);


export default userRouter;
