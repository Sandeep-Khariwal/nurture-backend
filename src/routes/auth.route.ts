import { authenticateToken, LogoutMiddleware } from "../middleware/jwtToken";
import {  DeleteAcount, ForgotPassword, GetAcount, Login, LogOut, OtpVarification, ResetPassword, Signup, } from "../controller/auth.controller";
import express  from "express";
const authRouter = express.Router();

authRouter.post("/signup",Signup );
authRouter.post("/login",Login );
authRouter.post("/varification",OtpVarification);

authRouter.put("/forgot-password",ForgotPassword);
authRouter.put("/reset-password",ResetPassword );
authRouter.put("/logout",LogoutMiddleware,LogOut );
authRouter.put("/deleteAccount",authenticateToken, DeleteAcount );
authRouter.get("/get", GetAcount );



export default authRouter