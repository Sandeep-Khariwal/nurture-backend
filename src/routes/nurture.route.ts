import express from "express";
import { CreateNurture, GetNurture } from "../controller/nurture.controller";
import { SendNotification } from "../controller/notifications.controller";
import { authenticateToken } from "../middleware/jwtToken";
const nurtureRouter = express.Router();

nurtureRouter.post("/create", CreateNurture);
nurtureRouter.get("/", GetNurture);
nurtureRouter.post("/sendNotification", authenticateToken , SendNotification);

export default nurtureRouter;
