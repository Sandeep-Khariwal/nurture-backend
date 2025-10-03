import { Request, Response } from "express";
import { clientRequest } from "../middleware/jwtToken";
import { StudentService } from "../services/student.service";
import { ExamService } from "../services/exam.service";
import { IsStudent } from "../HelperFunction";
import { AdminService } from "../services/admin.service";

export const UpdateStudentExam = async (req: clientRequest, res: Response) => {
  const { _id } = req.user;
  const { exams } = req.body;
  const studentService = new StudentService();
  const examService = new ExamService();

  let examResponse = exams.map(async (id: any) => {
    return await examService.findNameById(id);
  });

  const allExamData = await Promise.all(examResponse);

  const newExamData = allExamData.map((e) => {
    return { _id: e._id, name: e.name };
  });

  const response = await studentService.updateStudentExamsById(
    _id,
    newExamData
  );
  if (response["status"] == 200) {
    res.status(200).json({
      status: response["status"],
      data: response["selectedExam"],
      message: response["message"],
    });
  } else {
    res
      .status(response["status"])
      .json({ status: response["status"], message: response["message"] });
  }
};

export const GetStudent = async (req: clientRequest, res: Response) => {
  const id = req.user._id;
  const studentService = new StudentService();
  const adminService = new AdminService();

  const isStudent = IsStudent(id);
  let response;
  if (isStudent) {
    response = await studentService.getStudentById(id);
  } else {
    response = await adminService.getAdminById(id);
  }

  if (response["status"] == 200) {
    res.status(200).json({
      status: response["status"],
      data: response["user"],
    });
  } else {
    res
      .status(response["status"])
      .json({ status: response["status"], message: response["message"] });
  }
};
export const UpdateStudent = async (req: clientRequest, res: Response) => {
  const { examId, firstName, lastName, email } = req.body;
  const studentId = req.user._id;
  const studentService = new StudentService();

  const response = await studentService.updateStudentExam(studentId, {
    examId,
    firstName,
    lastName,
    email,
  });
  if (response["status"] == 200) {
    res.status(200).json({
      status: response["status"],
      data: response["student"],
      message: response["message"],
    });
  } else {
    res
      .status(response["status"])
      .json({ status: response["status"], message: response["message"] });
  }
};
export const AddStudentFcmToken = async (req: clientRequest, res: Response) => {
  const studentId = req.user._id;
  const {fcmToken} = req.body;

  const studentService = new StudentService();

  const response = await studentService.addFcmToeknById(studentId, fcmToken);

  if (response["status"] === 200) {
    res
      .status(response["status"])
      .json({ status: response["status"], message: response["message"] });
  } else {
    res
      .status(response["status"])
      .json({ status: response["status"], message: response["message"] });
  }
};
