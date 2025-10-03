import { StudentService } from "./../services/student.service";
import mongoose from "mongoose";
import { Request, Response } from "express";
import { clientRequest } from "../middleware/jwtToken";
import { ModuleService } from "../services/module.service";
import { ResultService } from "../services/result.service";
import { QuestionService } from "../services/question.service";
import {
  IsDashboardAccessible,
  IsSubscriptionExpired,
} from "../HelperFunction";

export const CreateResult = async (req: clientRequest, res: Response) => {
  const studentId = req.user._id;
  const { id } = req.params;

  const moduleService = new ModuleService();
  const resultService = new ResultService();
  const questionService = new QuestionService();
  const studentService = new StudentService();

  const response = await moduleService.getModuleById(id);

  if (response["status"] === 200) {
    const module = response["module"].toObject();

    // const totalTimeTakenByStudent = module.student_time
    //   .filter((s) => s.studentId === studentId)
    //   .map((st) => st.totalTime)[0];

    const attemptedQuestionIdsByStudent = module.questionAttempted
      .filter((q) => q.studentId === studentId)
      .map((q) => q.questionId);
    const totalAttemptedQuestions = attemptedQuestionIdsByStudent.length;
    const skippedQuestions = module.questions.filter(
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
      examId: module.examId,
      moduleId: module._id,
      chapterId: module.chapterId,

      totalQuestions: module.questions.length,
      attemptedQuestions: totalAttemptedQuestions,
      skippedQuestions: module.questions.length - totalAttemptedQuestions,
      correctAnswers: totalCorrectAnswers,
      //   accuracy: accuracy,
      //   totalTimeSpent: totalTimeTakenByStudent,
      isCompleted: module.questions.length === totalAttemptedQuestions,
      questionIds: [...attemptedQuestionIdsByStudent, ...skippedQuestions],
    };

    const resultResponse = await resultService.createResult(result);

    if (resultResponse["status"] === 200) {
      // update result in student profile
      await studentService.updateResultInStudent(
        studentId,
        resultResponse["result"]._id
      );
      // update student result in module
      await moduleService.updateResultIdInModule(id, {
        id: resultResponse["result"]._id,
        studentId,
      });
      res.status(response["status"]).json({
        status: 200,
        message: response["message"],
        data: { result_id: resultResponse["result"]._id },
      });
    } else {
      res.status(response["status"]).json(response["message"]);
    }
  } else {
    res.status(response["status"]).json(response["message"]);
  }
};

export const GetResult = async (req: clientRequest, res: Response) => {
  const { id } = req.params;
  const studentId = req.user._id;
  const resultService = new ResultService();

  const response = await resultService.getResultById(id, studentId);

  if (response["status"] === 200) {
    res
      .status(response["status"])
      .json({ status: 200, data: response["result"] });
  } else {
    res.status(response["status"]).json(response["message"]);
  }
};
export const GetAllResultsForExam = async (
  req: clientRequest,
  res: Response
) => {
  const examId = req.params.id;
  const studentId = req.user._id;
  const studentService = new StudentService();

  const response = await studentService.getResultsForExams(examId, studentId);

  // check subscription
  const studentSubscriptionResp = await studentService.getStudentById(
    studentId
  );
  let isDashboardAccessible = false;
  if (studentSubscriptionResp["status"] === 200) {
    //found subscription for current exam
    const currentSubscription = studentSubscriptionResp[
      "user"
    ]?.subscriptions.find((subs: any) => subs.examId === examId);
    //if subscription expired? then update in db
    const isSubscriptionExpired = IsSubscriptionExpired(currentSubscription);
    

    if (isSubscriptionExpired) {
      const examId = currentSubscription.examId;
      await studentService.expireStudentPlan(studentId, examId);
    } else {
      isDashboardAccessible = IsDashboardAccessible(
        studentSubscriptionResp["user"],
        examId
      );
    }
  }

  if (response["status"] === 200 && studentSubscriptionResp["status"]===200) {
    if (isDashboardAccessible) {
      res
        .status(response["status"])
        .json({ status: 200, data: response["results"] });
    } else {
      res.status(response["status"]).json({
        status: 405,
        data: studentSubscriptionResp["user"],
        message: "Please purchase a subscription to unlock this feature !!",
      });
    }
  } else {
    res.status(response["status"]).json(response["message"]);
  }
};
