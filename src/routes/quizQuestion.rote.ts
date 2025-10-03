import express from "express";
import { authenticateToken } from "../middleware/jwtToken";
import {
  CreateQuizQuestion,
  GetAllQuizQuestions,
  GetQuizQuestion,
  RemoveQuizQuestion,
  UpdateQuizStudentResponse,
} from "../controller/quizQuestion.controller";
const quizQuestionRouter = express.Router();

quizQuestionRouter.post("/create",authenticateToken, CreateQuizQuestion);
quizQuestionRouter.put(
  "/updateStudentResponse/:id",
  authenticateToken,
  UpdateQuizStudentResponse
);
quizQuestionRouter.put(
  "/removeQuestion/:id",
  authenticateToken,
  RemoveQuizQuestion
);
quizQuestionRouter.get("/get/:id", authenticateToken, GetQuizQuestion);
quizQuestionRouter.get("/getAll/:id", authenticateToken, GetAllQuizQuestions);

export default quizQuestionRouter;
