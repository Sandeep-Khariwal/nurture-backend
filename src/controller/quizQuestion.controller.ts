import { QuizService } from './../services/quiz.service';
import { clientRequest } from "../middleware/jwtToken";
import { Request, Response } from "express";
import { QuizQuestionService } from "../services/quizQuestion.service";

export const CreateQuizQuestion = async (req: Request, res: Response) => {
  const { question , questionId } = req.body;

  const questionService = new QuizQuestionService();
  const quizService = new QuizService()

  let response;
  if (questionId) {
    response = await questionService.updateById(questionId, question);
  } else {
    response = await questionService.createQuestion(question);
  }

  if (response["status"] === 200) {
    // update Question in module
    if (!questionId) {
      await quizService.addNewQuestionInQuiz(
        question.quizId,
        response["question"]._id
      );
    }
    res.status(response["status"]).json({
      status: 200,
      data: { question: response["question"] },
      message: response["message"],
    });
  } else {
    res
      .status(response["status"])
      .json({ status: response["status"], message: response["message"] });
  }
};
export const UpdateQuizStudentResponse = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { student, pendingTime } = req.body;

  const questionService = new QuizQuestionService();
  const quizService = new QuizService();
  const response = await questionService.updateStudentResponseById(id, student);

  if (response["status"] === 200) {
    const resp = {
      studentId: student.studentId,
      questionId: id,
    };
    
    await quizService.updateStudentResponse(
      response["question"].quizId,
      resp,
      pendingTime
    );
    
    res
      .status(response["status"])
      .json({ status: 200, data: { question: response["question"] } });

  } else {
    res
      .status(response["status"])
      .json({ status: response["status"], message: response["message"] });
  }
};
export const GetQuizQuestion = async (req: Request, res: Response) => {
  const { id } = req.params;

  const questionService = new QuizQuestionService();
  const response = await questionService.getQuestionById(id);

  if (response["status"] === 200) {
    res
      .status(response["status"])
      .json({ status: 200, data: { question: response["question"] } });
  } else {
    res
      .status(response["status"])
      .json({ status: response["status"], message: response["message"] });
  }
};

export const GetAllQuizQuestions = async (req: Request, res: Response) => {
  const { id } = req.params;

  const questionService = new QuizQuestionService();
  const response = await questionService.getAllQuestionById(id);

  if (response["status"] === 200) {
    const questions = response["questions"];
    const updatedQuestions = questions.map((q) => {
      const question = q.toObject ? q.toObject() : q;

      // Destructure to exclude 'attempt'
      const { attempt, ...rest } = question;
      return rest;
    });
    res
      .status(response["status"])
      .json({ status: 200, data: { questions: updatedQuestions } });
  } else {
    res
      .status(response["status"])
      .json({ status: response["status"], message: response["message"] });
  }
};

export const RemoveQuizQuestion = async (req: Request, res: Response) => {
  const { id } = req.params;

  const questionService = new QuizQuestionService();
  const response = await questionService.removeQuestionById(id);

  if (response["status"] === 200) {
    res
      .status(response["status"])
      .json({ status: 200, message: response["message"] });
  } else {
    res
      .status(response["status"])
      .json({ status: response["status"], message: response["message"] });
  }
};
