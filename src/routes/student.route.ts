import express  from "express";
import { authenticateToken } from "../middleware/jwtToken";
import { AddStudentFcmToken, GetStudent, UpdateStudent, UpdateStudentExam } from "../controller/student.controller";
const studentRouter = express.Router();

studentRouter.put("/selectExams",authenticateToken,UpdateStudentExam)
studentRouter.get("/get",authenticateToken,GetStudent)
studentRouter.put("/editProfile",authenticateToken,UpdateStudent)
studentRouter.put("/addFcmToken",authenticateToken,AddStudentFcmToken)

export default studentRouter