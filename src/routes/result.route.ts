import express  from "express";
import { authenticateToken } from "../middleware/jwtToken";
import { CreateResult, GetAllResultsForExam, GetResult } from "../controller/result.controller";
const resultRouter = express.Router();

resultRouter.post("/create/:id", authenticateToken , CreateResult);
resultRouter.get("/getResult/:id", authenticateToken , GetResult);
resultRouter.get("/getAllResults/:id", authenticateToken , GetAllResultsForExam);

export default resultRouter