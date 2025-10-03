import express  from "express";
import { CreateSubscription, GetSubscription } from "../controller/subscription.controller";
const subscriptionRouter = express.Router();

subscriptionRouter.post("/create", CreateSubscription );
subscriptionRouter.get("/get/:id", GetSubscription );

export default subscriptionRouter