import DailyDoseQuestion from "../models/dailyDoseQuestion";
import { randomUUID } from "crypto";

export class DailyDoseService {
  public async createDailyDoseQuestion(
    data: {
      question: string;
      options: {
        name: string;
        answer: boolean;
      }[];
      correctAns: string;
      showAt: string;
    },
    examId: string,
    dailyDoseWisdom: string,
    explaination: string
  ) {
    try {
      const dailyDose = new DailyDoseQuestion();
      dailyDose._id = `DDQP-${randomUUID()}`;
      dailyDose.question = data.question;
      dailyDose.options = data.options;
      dailyDose.correctAns = data.correctAns;
      dailyDose.showAt = new Date(data.showAt);
      dailyDose.examId = examId;
      dailyDose.dailyDoseWisdom = dailyDoseWisdom;
      dailyDose.explaination = explaination;
      dailyDose.isDeleted = false;

      const savedQuestion = await dailyDose.save();

      return {
        status: 200,
        question: savedQuestion,
        message: "question created",
      };
    } catch (error) {
      const errorObj = { message: error.message, status: 500 };
      return errorObj;
    }
  }
  public async getTodayQuestion(examId: string) {

    const today = new Date();
      const fiveAndHalfHoursInMs = 5.5 * 60 * 60 * 1000;
      const newDate = new Date(today.getTime() + fiveAndHalfHoursInMs);
    
    const startOfDay = new Date(newDate.setUTCHours(0, 0, 0, 0));
    const endOfDay = new Date(newDate.setUTCHours(23, 59, 59, 999));
    

    try {
      const question = await DailyDoseQuestion.findOne({
        examId: examId,
        isDeleted: false,
        showAt: {
          $gte: startOfDay,
          $lte: endOfDay,
        },
      });
      return { status: 200, question };
    } catch (error: any) {
      return { message: error.message, status: 500 };
    }
  }
  public async updateDailyDoseQuestion(
    questionId: string,
    data: {
      question: string;
      options: {
        name: string;
        answer: boolean;
      }[];
      correctAns: string;
      showAt: string;
    },
    examId: string,
    dailyDoseWisdom: string,
    explaination: string
  ) {
    try {
      const question = await DailyDoseQuestion.findByIdAndUpdate(
        questionId,
        {
          ...data,
          $set: { examId, dailyDoseWisdom , explaination },
        },
        { new: true }
      );

      return { status: 200, question, message: "Question updated!!" };
    } catch (error: any) {
      return { message: error.message, status: 500 };
    }
  }

  public async updateStudentResponse(
    id: string,
    student: { studentId: string; optionId: string }
  ) {
    try {
      const question = await DailyDoseQuestion.findById(id);

      if (!question) {
        return { status: 404, message: "Question not found!!" };
      }
      const alreadyAttempted = question.attempt.some(
        (attempt) => attempt.studentId === student.studentId
      );

      if (alreadyAttempted) {
        return { status: 400, message: "Already attempted." };
      }

      question.attempt.push(student);
      await question.save();

      return { status: 200, question };
    } catch (error) {
      return { message: error.message, status: 500 };
    }
  }

  public async getAllDailyDoseQuestion() {
    try {
      let questions = await DailyDoseQuestion.find({
        isDeleted: false,
      }).populate([
        {
          path: "examId",
          select: ["_id", "name"],
        },
      ]);

      questions = questions.filter((c: any) => !c?.isDeleted);
      if (questions.length === 0) {
        return { status: 404, message: "questions not found!!" };
      }

      const updatedQuestions = questions.map((chapter) => {
        const { examId, ...rest } = chapter.toObject
          ? chapter.toObject()
          : chapter;
        return {
          ...rest,
          exam: examId,
        };
      });

      return { status: 200, questions: updatedQuestions };
    } catch (error) {
      return { message: error.message, status: 500 };
    }
  }

  public async removeDailyDoseById(id: string) {
    try {
      const question = await DailyDoseQuestion.findByIdAndUpdate(id, {
        $set: { isDeleted: true },
      });

      if (!question) {
        return { status: 404, message: "Question not found!!" };
      }

      return { status: 200, message: "Question removed" };
    } catch (error) {
      return { message: error.message, status: 500 };
    }
  }
}
