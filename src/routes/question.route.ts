import express from "express";
import { authenticateToken } from "../middleware/jwtToken";
import { CreateQuestion, GetAllQuestions, GetQuestion, GetWrongAttemptedQuestions, RemoveImageFromQuestion, RemoveQuestion, UpdateStudentResponse, UploadQuestioImage } from "../controller/question.controller";
import { upload } from "../aws/awsHelper";
const questionRouter = express.Router();

questionRouter.post("/create",CreateQuestion)
questionRouter.put("/updateStudentResponse/:id",authenticateToken,UpdateStudentResponse)
questionRouter.put("/removeQuestion/:id",authenticateToken,RemoveQuestion)
questionRouter.get("/get/:id", authenticateToken , GetQuestion)
questionRouter.get("/getAll/:id", authenticateToken , GetAllQuestions)
questionRouter.get("/getWrongAttempted/:id", authenticateToken , GetWrongAttemptedQuestions)


questionRouter.put("/removeQuestionImage", authenticateToken , RemoveImageFromQuestion)

questionRouter.put(
  "/uploadQuestionImage",
    upload.fields([
      { name: "questionImage", maxCount: 1 },
    ]),
  UploadQuestioImage
);

export default questionRouter;