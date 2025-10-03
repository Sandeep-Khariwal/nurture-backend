import express from "express";
import { authenticateToken } from "../middleware/jwtToken";
import { AddVideoInModules, CreateModule, DeleteVideoFromModule, GetAllCompletedModules, GetAllModules, GetAllVideos, ReAppearModule, RemoveModule, RestoreModules, SubmitModuleResponse } from "../controller/module.controller";
import { upload } from "../aws/awsHelper";
// import upload from "../middleware/multer";
const moduleRouter = express.Router();

moduleRouter.post("/create",CreateModule)
moduleRouter.get("/getAll", authenticateToken , GetAllModules)
moduleRouter.get("/getCompletedModules/:id", authenticateToken , GetAllCompletedModules)
moduleRouter.get("/getVideos/:id", authenticateToken , GetAllVideos)
// moduleRouter.get("/getAll/:id", authenticateToken , GetAllQuetionFieldModules)
moduleRouter.put("/submit/:id", authenticateToken , SubmitModuleResponse);
moduleRouter.put("/removeModule/:id", authenticateToken , RemoveModule);
moduleRouter.put("/reappear/:id", authenticateToken , ReAppearModule);
moduleRouter.put("/restore/:id", authenticateToken , RestoreModules)
moduleRouter.put("/deleteVideo", authenticateToken , DeleteVideoFromModule)
moduleRouter.put(
  "/uploadVideo/:id",
  upload.fields([
    { name: "video" , maxCount:1},
    { name: "thumbnail",maxCount:1},
  ]),
  authenticateToken,
  AddVideoInModules
);


export default moduleRouter;