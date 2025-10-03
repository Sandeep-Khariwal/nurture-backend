import { ExamService } from "../services/exam.service";
import { DailyDoseService } from "./../services/dailyDoseQuestion";
import { Request, Response } from "express";

export const CreateDailyDoseQuestion = async (req: Request, res: Response) => {
  const { question, dailyDoseWisdom, questionId, explaination, examName } =
    req.body;

  let examId = req.body.examId;
  const dailyDoseService = new DailyDoseService();
  const examService = new ExamService();
  
  let examResp;
  if (examName && !examId) {
    examResp = await examService.getExamIdByName(examName);
  }
  if(examName){
    if(examResp["status"]===200){
      examId = examResp["exam"]._id
    }
  }

  
  let response;
  if (!questionId) {
    response = await dailyDoseService.createDailyDoseQuestion(
      question,
      examId,
      dailyDoseWisdom,
      explaination
    );

    // update daily dose in exam
    if (response["question"]._id) {
      await examService.updateDDQById(
        question.examId,
        response["question"]._id
      );
    }
  } else {
    response = await dailyDoseService.updateDailyDoseQuestion(
      questionId,
      question,
      examId,
      dailyDoseWisdom,
      explaination
    );
  }

  if (response["status"] === 200) {
    res.status(response["status"]).json({
      status: response["status"],
      data: { question: response["question"] },
      message: response["message"],
    });
  } else {
    res
      .status(response["status"])
      .json({ status: response["status"], message: response["message"] });
  }
};
export const GetTodayQuestion = async (req: Request, res: Response) => {
  const { id } = req.params;
  const dailyDoseService = new DailyDoseService();
  const examService = new ExamService();
  const response = await dailyDoseService.getTodayQuestion(id);
  const examResponse = await examService.getExamById(id);

  let roadmapToSuccess = "";
  if (examResponse["status"] === 200) {
    roadmapToSuccess = examResponse["exam"].roadmapToSuccess;
  }

  if (response["status"] === 200) {
    res.status(response["status"]).json({
      status: response["status"],
      data: {
        question: response["question"],
        roadmapToSuccess: roadmapToSuccess,
      },
    });
  } else {
    res
      .status(response["status"])
      .json({ status: response["status"], message: response["message"] });
  }
};
export const GetAllDailyDoseQuestion = async (req: Request, res: Response) => {
  const dailyDoseService = new DailyDoseService();

  const response = await dailyDoseService.getAllDailyDoseQuestion();

  if (response["status"] === 200) {
    res.status(response["status"]).json({
      status: response["status"],
      data: { questions: response["questions"] },
    });
  } else {
    res
      .status(response["status"])
      .json({ status: response["status"], message: response["message"] });
  }
};
export const AddStudentResponse = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { student } = req.body;

  const dailyDoseService = new DailyDoseService();
  const response = await dailyDoseService.updateStudentResponse(id, student);

  if (response["status"] === 200) {
    res.status(response["status"]).json({
      status: response["status"],
      data: { question: response["question"] },
    });
  } else {
    res
      .status(response["status"])
      .json({ status: response["status"], message: response["message"] });
  }
};
export const RemoveDailyDose = async (req: Request, res: Response) => {
  const { id } = req.params;

  const dailyDoseService = new DailyDoseService();
  const response = await dailyDoseService.removeDailyDoseById(id);

  if (response["status"] === 200) {
    res.status(response["status"]).json({
      status: response["status"],
      message: response["message"],
    });
  } else {
    res
      .status(response["status"])
      .json({ status: response["status"], message: response["message"] });
  }
};
