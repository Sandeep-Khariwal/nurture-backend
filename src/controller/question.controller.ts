import { QuizService } from "../services/quiz.service";
import { clientRequest } from "../middleware/jwtToken";
import { ModuleService } from "../services/module.service";
import { QuestionService } from "../services/question.service";
import { Request, Response } from "express";
import { uploadMediaFile } from "../aws/awsHelper";
import { QuizQuestionService } from "../services/quizQuestion.service";

export const CreateQuestion = async (req: Request, res: Response) => {
  const { question, questionId } = req.body;

  const questionService = new QuestionService();
  const moduleService = new ModuleService();
  const quizService = new QuizService();

  let response;
  if (questionId) {
    response = await questionService.updateById(questionId, question);
  } else {
    response = await questionService.createQuestion(question);
  }

  if (response["status"] === 200) {
    // update Question in module
    if (!questionId) {
      await moduleService.addNewQuestionInModal(
        question.moduleId,
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
export const UploadQuestioImage = async (req: Request, res: Response) => {
  try {
    const { questionId } = req.body;
    let normalQuestion = questionId.startsWith("QS");

    const questionService = new QuestionService();
    const quizService = new QuizQuestionService();
    const files = req.files as {
      questionImage?: Express.Multer.File[];
    };

    if (!files?.questionImage) {
      res.status(400).json({ error: "questionImage are required" });
    }

    const questionImage = files.questionImage[0];

    // Upload to S3
    const thumbnailS3Key = `questionImage/${Date.now()}_${
      questionImage.originalname
    }`;
    const questionImageUrl = await uploadMediaFile(
      questionImage,
      thumbnailS3Key
    );

    let response;
    if (questionImageUrl) {
      if (normalQuestion) {
        response = await questionService.addImageToQuestion(
          questionId,
          questionImageUrl
        );
      } else {
        response = await quizService.addImageToQuestion(
          questionId,
          questionImageUrl
        );
      }
    }

    if (response["status"] === 200) {
      res.status(response["status"]).json({
        status: 200,
        data: response["question"],
        message: response["message"],
      });
    } else {
      res
        .status(response["status"])
        .json({ status: response["status"], message: response["message"] });
    }
  } catch (error) {
    console.error("Error uploading logo:", error);
    res
      .status(500)
      .json({ status: 500, message: error.message || "Failed to upload logo" });
  }
};

export const RemoveImageFromQuestion = async (req: Request, res: Response) => {
  const { questionId } = req.body;
  let normalQuestion = questionId.startsWith("QS");

  const questionService = new QuestionService();
  const quizService = new QuizQuestionService();

  let response;
  if (normalQuestion) {
    response = await questionService.removeImageFromQuestion(questionId);
  } else {
    response = await quizService.removeImageFromQuestion(questionId);
  }
  if (response["status"] === 200) {
    res.status(response["status"]).json({
      status: 200,
      data: response["question"],
      message: response["message"],
    });
  } else {
    res
      .status(response["status"])
      .json({ status: response["status"], message: response["message"] });
  }
};

export const UpdateStudentResponse = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { student, pendingTime } = req.body;

  const questionService = new QuestionService();
  const moduleService = new ModuleService();
  const response = await questionService.updateStudentResponseById(id, student);

  if (response["status"] === 200) {
    const resp = {
      studentId: student.studentId,
      questionId: id,
    };

    await moduleService.updateStudentResponse(
      response["question"].moduleId,
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
export const GetQuestion = async (req: Request, res: Response) => {
  const { id } = req.params;

  const questionService = new QuestionService();
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

export const GetAllQuestions = async (req: Request, res: Response) => {
  const { id } = req.params;

  const questionService = new QuestionService();
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

export const GetWrongAttemptedQuestions = async (
  req: clientRequest,
  res: Response
) => {
  const { id } = req.params;
  const studentId = req.user._id;

  const moduleService = new ModuleService();
  const response = await moduleService.getAllWrongQuestionsByModuleId(
    id,
    studentId
  );

  if (response["status"] === 200) {
    const module = response["module"];

    // Destructure to exclude 'attempt'
    const { questionAttempted, ...rest } = module;

    res
      .status(response["status"])
      .json({ status: 200, data: { questions: module.questions } });
  } else {
    res
      .status(response["status"])
      .json({ status: response["status"], message: response["message"] });
  }
};

export const RemoveQuestion = async (req: Request, res: Response) => {
  const { id } = req.params;

  const questionService = new QuestionService();
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
