import express  from "express";
import { CreateChapter, GetAllChapter, RemoveChapter } from "../controller/chapter.controller";
import { authenticateToken } from "../middleware/jwtToken";

const chapterRouter = express.Router();

chapterRouter.post("/create", CreateChapter);
chapterRouter.get("/getAll", authenticateToken , GetAllChapter);
chapterRouter.put("/removeChapter/:id" ,authenticateToken, RemoveChapter );


export default chapterRouter