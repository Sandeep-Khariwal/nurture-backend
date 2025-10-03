import { ChapterService } from "../services/chapter.services";
import { ExamService } from "../services/exam.service";
import { Request, Response } from "express";
import { ModuleService } from "../services/module.service";
import { QuestionService } from "../services/question.service";
import { clientRequest } from "../middleware/jwtToken";
import { StudentService } from "../services/student.service";

export const CreateNewExam = async (req: clientRequest, res: Response) => {
  const studentId = req.user._id
  const { name, examId } = req.body;

  const exam = new ExamService();
  const studentService = new StudentService()
  let response;

  if (examId) {
    response = await exam.updateExamById(examId, name);

    //update exam name in student selected exam
    await studentService.updateExamNameForAllStudents(examId , name)
  } else {
    response = await exam.createExam(name);
  }

  if (response["status"] === 200) {
    res.status(200).json({
      status: response["status"],
      data: response["exam"],
      message: response["message"],
    });
  } else {
    res
      .status(response["status"])
      .json({ status: response["status"], message: response["message"] });
  }
};

export const GetAllExams = async (req: Request, res: Response) => {
  const exam = new ExamService();
  const response = await exam.findAllExams();

  if (response["status"] === 200) {
    res
      .status(200)
      .json({ status: response["status"], data: response["exams"] });
  } else {
    res
      .status(response["status"])
      .json({ status: response["status"], message: response["message"] });
  }
};

export const RemoveExam = async (req: Request, res: Response) => {
  const { id } = req.params;

  const exam = new ExamService();
  const chapterService = new ChapterService();
  const moduleService = new ModuleService();
  const questionService = new QuestionService();

  const response = await exam.removeExamById(id);

  if (response["status"] === 200) {
    
    // remove all chapter by exam id
    await chapterService.removeManyChaptersByExamId(id);

    // remove all modules by chapterids
    const chapterIds = response["exam"].chapters;
    
    const chapterResp = await moduleService.removeManyModulesByChapterIds(
      chapterIds
    );

    if (chapterResp["status"] === 200) {
      // remove all the questions
      await questionService.removeManyQuestionByModuleId(
        chapterResp["moduleIds"]
      );
    }

    res
      .status(200)
      .json({ status: response["status"], message: response["message"] });
  } else {
    res
      .status(response["status"])
      .json({ status: response["status"], message: response["message"] });
  }
};
