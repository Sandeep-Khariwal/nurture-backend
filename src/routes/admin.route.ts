import express  from "express";
import { CreateAdmin } from "../controller/admin.controller";
const adminRouter = express.Router();

adminRouter.post("/create", CreateAdmin);

export default adminRouter