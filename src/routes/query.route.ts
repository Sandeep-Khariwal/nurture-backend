import express  from "express";
import { authenticateToken } from "../middleware/jwtToken";
import { CreateQuery, GetAllQuery, PostReply } from "../controller/query.controller";
const queryRouter = express.Router();

queryRouter.post("/create", authenticateToken , CreateQuery);

queryRouter.get("/getAll", authenticateToken , GetAllQuery);
queryRouter.put("/postReply", authenticateToken , PostReply);

export default queryRouter