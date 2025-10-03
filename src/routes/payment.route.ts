import express  from "express";
import { CreateOrder, GetRazorpayKeys, PurchaseSubscription, WebhookEvent } from "../controller/payment.controller";
const paymentRouter = express.Router();

paymentRouter.get("/getKeys", GetRazorpayKeys);

paymentRouter.post("/create-order", CreateOrder);
paymentRouter.post("/webhook", WebhookEvent);
paymentRouter.post("/getSubscription", PurchaseSubscription);

export default paymentRouter