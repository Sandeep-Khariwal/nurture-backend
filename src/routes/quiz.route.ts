import express from "express";
import {
  AddWinnerPrizeImage,
  CreateQuiz,
  GetAllQuizes,
  GetPostionsInQuiz,
  GetQuiz,
  GetQuizForRegistration,
  GetToQuiz,
  RegistrationClose,
  RegistrationOpen,
  RemovePrizeImage,
  RemoveQuiz,
  SetQuizClose,
  SetQuizLive,
  SubmitQuizResponse,
} from "../controller/quiz.controller";
import { authenticateToken } from "../middleware/jwtToken";
import { upload } from "../aws/awsHelper";
const quizRouter = express.Router();

quizRouter.post("/create", authenticateToken, CreateQuiz);

quizRouter.put("/live", authenticateToken, SetQuizLive);
quizRouter.put("/closeLive", authenticateToken, SetQuizClose);
quizRouter.put("/registrationOpen", authenticateToken, RegistrationOpen);
quizRouter.put("/registrationClose", authenticateToken, RegistrationClose);
quizRouter.put("/submit/:id", authenticateToken, SubmitQuizResponse);
quizRouter.put("/removeQuiz", authenticateToken, RemoveQuiz);
// quizRouter.put("/addWinnerPrize/:id" , authenticateToken , AddWinnerPrize);
quizRouter.put(
  "/uploadWinnerPrizeImage/:id",
    upload.fields([
      { name: "prizeImage", maxCount: 1 },
    ]),
  AddWinnerPrizeImage
);
quizRouter.put("/removePrizeImage/:id", authenticateToken, RemovePrizeImage);

quizRouter.get("/get/:id", authenticateToken, GetQuiz);
quizRouter.get("/getQuiz", authenticateToken, GetToQuiz);
quizRouter.get("/getAll", authenticateToken, GetAllQuizes);
quizRouter.get(
  "/getQuizForRegistration",
  authenticateToken,
  GetQuizForRegistration
);
quizRouter.get("/getPosition/:id", authenticateToken, GetPostionsInQuiz);

export default quizRouter;
