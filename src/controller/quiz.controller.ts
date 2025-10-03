import { quizPriceStaticContent } from "./../staticContent/quiz.static";

import { clientRequest, toStringParam } from "../middleware/jwtToken";
import { QuizService } from "../services/quiz.service";
import { Request, Response } from "express";
import { ResultService } from "../services/result.service";
import { QuizQuestionService } from "../services/quizQuestion.service";
import { StudentService } from "../services/student.service";
import mongoose from "mongoose";
import fs from "fs/promises";
import { uploadMediaFile } from "../aws/awsHelper";

export const CreateQuiz = async (req: Request, resp: Response) => {
  const {
    name,
    examId,
    totalTime,
    startAt,
    endAt,
    quizId,
    registerStartDate,
    registerEndDate,
    quizFees,
    winnerPrices,
  } = req.body;
  const quizService = new QuizService();
  let response;
  if (!quizId) {
    response = await quizService.createQuiz({
      name,
      examId,
      totalTime,
      startAt,
      registerStartDate,
      registerEndDate,
      quizFees,
    });
  } else {
    response = await quizService.updateQuizById(quizId, {
      name,
      examId,
      totalTime,
      startAt,
      endAt,
      quizFees,
      registerStartDate,
      registerEndDate,
    });
  }

  if (response["status"] === 200) {
    // add or update winner prize if quiz created
    const newResp = await quizService.addWinnerPrizeInQuizById(
      response["quiz"]._id,
      {
        winnerPrices,
        priceStaticContent: quizPriceStaticContent,
      }
    );

    if (newResp["status"] === 200) {
      resp
        .status(newResp["status"])
        .json({ status: newResp["status"], data: newResp["quiz"] });
    } else {
      resp
        .status(newResp["status"])
        .json({ status: newResp["status"], message: newResp["message"] });
    }
  } else {
    resp
      .status(response["status"])
      .json({ status: response["status"], message: response["message"] });
  }
};

export const GetQuiz = async (req: clientRequest, res: Response) => {
  const { id } = req.params;

  const quizService = new QuizService();

  const response = await quizService.getQuizById(id);

  if (response["status"] === 200) {
    const { priceStaticContent, winnerPrices, ...rest } =
      response["quiz"].toObject();

    res.status(response["status"]).json({
      status: response["status"],
      data: { priceStaticContent, winnerPrices },
      message: response["message"],
    });
  } else {
    res
      .status(response["status"])
      .json({ status: response["status"], message: response["message"] });
  }
};
export const GetToQuiz = async (req: clientRequest, res: Response) => {
  const examId = toStringParam(req.query.examId);
  const studentId = req.user._id;

  const quizService = new QuizService();

  const response = await quizService.getQuiz(examId, studentId);

  if (response["status"] === 200) {
    const { priceStaticContent, winnerPrices, ...rest } = response["quiz"];

    res.status(response["status"]).json({
      status: response["status"],
      data: rest,
      message: response["message"],
    });
  } else {
    res
      .status(response["status"])
      .json({ status: response["status"], message: response["message"] });
  }
};
export const SetQuizLive = async (req: Request, res: Response) => {
  const quizId = toStringParam(req.query.quizId);

  const quizService = new QuizService();

  const response = await quizService.setQuizLive(quizId);

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
export const SetQuizClose = async (req: Request, res: Response) => {
  const quizId = toStringParam(req.query.quizId);

  const quizService = new QuizService();

  const response = await quizService.setQuizClose(quizId);

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
export const RegistrationOpen = async (req: Request, res: Response) => {
  const quizId = toStringParam(req.query.quizId);

  const quizService = new QuizService();

  const response = await quizService.setRegistrationOpen(quizId);

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
export const RegistrationClose = async (req: Request, res: Response) => {
  const quizId = toStringParam(req.query.quizId);

  const quizService = new QuizService();

  const response = await quizService.setRegistrationClose(quizId);

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
export const SetQuizCloseAuto = async (quizId: string) => {
  const quizService = new QuizService();
  await quizService.setQuizClose(quizId);
};

export const GetAllQuizes = async (req: clientRequest, res: Response) => {
  const examId = toStringParam(req.query.examId);
  const quizService = new QuizService();
  const response = await quizService.getAllQuizByExamId(examId);

  if (response["status"] === 200) {
    res.status(response["status"]).json({
      status: response["status"],
      data: response["quizes"],
    });
  } else {
    res
      .status(response["status"])
      .json({ status: response["status"], message: response["message"] });
  }
};
export const GetQuizForRegistration = async (
  req: clientRequest,
  res: Response
) => {
  const examId = toStringParam(req.query.examId);
  const quizService = new QuizService();

  const response = await quizService.getQuizForRegistration(examId);

  if (response["status"] === 200) {
    res.status(response["status"]).json({
      status: response["status"],
      data: { quiz: response["quiz"] },
    });
  } else {
    res
      .status(response["status"])
      .json({ status: response["status"], message: response["message"] });
  }
};
export const AddWinnerPrizeImage = async (req: Request, res: Response) => {
  const quizId = req.params.id;
  try {
    const files = req.files as {
      prizeImage?: Express.Multer.File[];
    };
    
    if (!files?.prizeImage) {
      res.status(400).json({ error: "prizeImage are required" });
    }

    const prizeImage = files.prizeImage[0];

    // Upload to S3
    const thumbnailS3Key = `thumbnails/${Date.now()}_${
      prizeImage.originalname
    }`;
    const prizeImageUrl = await uploadMediaFile(prizeImage, thumbnailS3Key);
    //update images in quiz
    const quizService = new QuizService();

    const response = await quizService.uploadPrizeImages(quizId, prizeImageUrl);
    if (response["status"] === 200) {
      res.status(200).json({
        status: 200,
        message: "Image uploaded successfully",
        data: response["images"],
      });
    } else {
      res
        .status(response["status"])
        .json({ status: response["status"], message: response["message"] });
    }
  } catch (error: any) {
    console.error("Error uploading logo:", error);
    res
      .status(500)
      .json({ status: 500, message: error.message || "Failed to upload logo" });
  }
};
export const RemoveQuiz = async (req: Request, res: Response) => {
  const quizId = req.body;
  const quizService = new QuizService();

  const response = await quizService.removeQuizById(quizId);

  if (response["status"] === 200) {
    res.status(response["status"]).json({
      status: response["status"],
      data: { quiz: response["quize"] },
      message: response["message"],
    });
  } else {
    res
      .status(response["status"])
      .json({ status: response["status"], message: response["message"] });
  }
};
export const RemovePrizeImage = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { imageUrl } = req.body;
  const quizService = new QuizService();

  const response = await quizService.removeImageUrlFromQuiz(id, imageUrl);

  if (response["status"] === 200) {
    res.status(response["status"]).json({
      status: response["status"],
      data: { quiz: response["quiz"] },
      message: response["message"],
    });
  } else {
    res
      .status(response["status"])
      .json({ status: response["status"], message: response["message"] });
  }
};
export const GetPostionsInQuiz = async (req: Request, res: Response) => {
  const quizId = req.params.id;
  const quizService = new QuizService();
  const resultService = new ResultService();

  const resultResponse = await resultService.getAllResultByQuizId(quizId);
  const quizResponse = await quizService.getQuizById(quizId);
  if (resultResponse["status"] === 200 && quizResponse["status"] === 200) {
    const results = resultResponse["results"];
    const quiz = quizResponse["quiz"];

    const timeMap = new Map();
    quiz.student_time.forEach(({ studentId, totalTime }) => {
      timeMap.set(studentId, totalTime);
    });

    const ranked = results
      .map((res: any) => ({
        studentId: res.studentId,
        correctAnswers: res.correctAnswers,
        totalMarks: res.totalMarks,
        obtainedMarks: res.obtainedMarks,
        timeTaken: res.totalTimeSpent,
        accuracy: res.accuracy,
      }))
      .sort((a, b) => {
        // Rank by marks or correct answers
        if (b.correctAnswers !== a.correctAnswers) {
          return b.correctAnswers - a.correctAnswers;
        }
        // Tie-breaker: who took less time
        return a.timeTaken - b.timeTaken;
      });

    ranked.forEach((student: any, index) => {
      student.rank = index + 1;
    });

    const top10 = ranked.slice(0, 10);

    res.status(200).json({
      status: 200,
      data: top10,
    });
  } else {
    res.status(resultResponse["status"]).json({
      status: resultResponse["status"],
      message: resultResponse["message"],
    });
  }
};

export const SubmitQuizResponse = async (req: clientRequest, res: Response) => {
  const { id } = req.params;
  const studentId = req.user._id;

  const quizService = new QuizService();

  const response = await quizService.submitQuizById(id, studentId);

  if (response["status"] === 200) {
    const resultService = new ResultService();
    const questionService = new QuizQuestionService();
    const studentService = new StudentService();

    const quiz = response["quiz"].toObject();

    // const totalTimeTakenByStudent = module.student_time
    //   .filter((s) => s.studentId === studentId)
    //   .map((st) => st.totalTime)[0];

    const attemptedQuestionIdsByStudent = quiz.questionAttempted
      .filter((q) => q.studentId === studentId)
      .map((q) => q.questionId);
    const totalAttemptedQuestions = attemptedQuestionIdsByStudent.length;

    const skippedQuestions = quiz.questions.filter(
      (q) => !attemptedQuestionIdsByStudent.includes(q)
    );

    let promises = [];
    attemptedQuestionIdsByStudent.forEach((id) => {
      const result = questionService.getQuestionById(id);
      promises.push(result);
    });

    const allQuestions = await Promise.all(promises);

    let totalCorrectAnswers;
    if (allQuestions.length > 0) {
      totalCorrectAnswers = allQuestions.reduce((acc, curr) => {
        const question = curr.question.toObject();

        // 1. Find the correct option ID
        const correctOption = question.options.find(
          (o: any) => o.answer === true
        );

        if (!correctOption) return acc;

        // 2. Find the student's attempt for this question
        const studentAttempt = question.attempt.find(
          (a: any) => a.studentId === studentId
        );

        if (!studentAttempt) return acc; // No attempt made by this student

        // 3. Convert studentAttempt.optionId and correctOption._id to the same type (ObjectId)
        const studentOptionId = new mongoose.Types.ObjectId(
          studentAttempt.optionId
        );
        const correctOptionId = correctOption._id;

        // 4. Compare the student's selected option ID with the correct option ID
        const isCorrect = studentOptionId.equals(correctOptionId);

        return isCorrect ? acc + 1 : acc;
      }, 0);
    }

    // const accuracy =
    //   totalAttemptedQuestions > 0
    //     ? (totalCorrectAnswers / totalAttemptedQuestions) * 100
    //     : 0;

    const result = {
      studentId: studentId,
      moduleId: quiz._id,
      examId: quiz.examId,
      totalQuestions: quiz.questions.length,
      attemptedQuestions: totalAttemptedQuestions,
      skippedQuestions: quiz.questions.length - totalAttemptedQuestions,
      correctAnswers: totalCorrectAnswers,
      isCompleted: quiz.questions.length === totalAttemptedQuestions,
      questionIds: [...attemptedQuestionIdsByStudent, ...skippedQuestions],
      totalMarks: quiz.questions.length,
      obtainedMarks: totalCorrectAnswers,
      totalTimeSpent:
        quiz.totalTime -
        quiz.student_time.filter((s) => s.studentId === studentId)[0].totalTime,
      accuracy: (totalCorrectAnswers / quiz.questions.length) * 100,
    };

    const resultResponse = await resultService.createResult(result);

    if (resultResponse["status"] === 200) {
      // update result in student profile
      await studentService.updateQuizResultInStudent(
        studentId,
        resultResponse["result"]._id
      );
      // update student result in module
      await quizService.updateResultIdInQuiz(id, {
        id: resultResponse["result"]._id,
        studentId,
      });
      res.status(response["status"]).json({
        status: 200,
        message: response["message"],
        data: { resultId: resultResponse["result"]._id },
      });
    } else {
      res.status(resultResponse["status"]).json(resultResponse["message"]);
    }
  } else {
    res.status(response["status"]).json(response["message"]);
  }
};
