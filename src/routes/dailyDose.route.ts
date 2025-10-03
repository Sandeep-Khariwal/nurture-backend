
import express from "express";
import {
  AddStudentResponse,
  CreateDailyDoseQuestion,
  GetAllDailyDoseQuestion,
  GetTodayQuestion,
  RemoveDailyDose,
} from "../controller/dailyDoseQuestion.controller";
import { authenticateToken } from "../middleware/jwtToken";

const dailyDoseRouter = express.Router();

dailyDoseRouter.post("/create", CreateDailyDoseQuestion);
dailyDoseRouter.get("/todayQuestion/:id",authenticateToken, GetTodayQuestion);
dailyDoseRouter.get("/getAll",authenticateToken, GetAllDailyDoseQuestion);
dailyDoseRouter.put("/updateStudentResponse/:id",authenticateToken, AddStudentResponse);
dailyDoseRouter.put("/removeDailyDose/:id",authenticateToken, RemoveDailyDose);

export default dailyDoseRouter;
