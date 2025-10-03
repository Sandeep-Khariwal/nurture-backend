import express from "express";
import { CreateNewExam, GetAllExams, RemoveExam } from "../controller/exam.controller";
import { authenticateToken } from "../middleware/jwtToken";

const examRouter = express.Router();

// all post routes
examRouter.post("/create",authenticateToken, CreateNewExam);

// all get routes
examRouter.get("/", authenticateToken ,GetAllExams);
examRouter.put("/removeExam/:id",authenticateToken, RemoveExam);

export default examRouter;
