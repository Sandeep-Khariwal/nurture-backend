import { randomUUID } from "crypto";
import Result from "../models/result.model";
import { IsQuiz } from "../HelperFunction";

export class ResultService {
  public async createResult(data: {
    studentId: string;
    examId?: string;
    moduleId: string;
    chapterId?: string;

    totalQuestions: number;
    attemptedQuestions: number;
    skippedQuestions: number;
    correctAnswers: number;

    totalMarks?: number;
    obtainedMarks?: number;
    totalTimeTaken?: number;

    accuracy?: number;
    totalTimeSpent?: number;
    isCompleted: boolean;
    questionIds: string[];
  }) {
    try {
      const result = new Result();
      result._id = `RSLT-${randomUUID()}`;
      result.studentId = data.studentId;

      result.totalQuestions = data.totalQuestions;
      result.attemptedQuestions = data.attemptedQuestions;
      result.skippedQuestions = data.skippedQuestions;
      result.correctAnswers = data.correctAnswers;
      result.isDeleted = false;
      result.wrongAnswers =
        Number(data.attemptedQuestions) - Number(data.correctAnswers);
      if (IsQuiz(data.moduleId)) {
        result.quizQuestions = data.questionIds;
      } else {
        result.Questions = data.questionIds;
      }
      result.isCompleted = data.isCompleted;
      if (data.examId) {
        result.examId = data.examId;
      }
      if (IsQuiz(data.moduleId)) {
        result.quizId = data.moduleId;
      } else {
        result.moduleId = data.moduleId;
      }
      if (data.chapterId) {
        result.chapterId = data.chapterId;
      }
      if (data.accuracy) {
        result.accuracy = data.accuracy;
      }
      if (data.totalTimeSpent) {
        result.totalTimeSpent = data.totalTimeSpent;
      }
      if (data.totalMarks) {
        result.totalMarks = data.totalMarks;
      }
      if (data.obtainedMarks) {
        result.obtainedMarks = data.obtainedMarks;
      }

      const savedResult = await result.save();
      return { status: 200, result: savedResult, message: "Result created!!" };
    } catch (error) {
      return { status: 500, message: error.message };
    }
  }

  public async getResultByStudentAndModule(
    studentId: string,
    moduleId: string
  ) {
    try {
      const result = await Result.findOne({
        studentId: studentId,
        moduleId: moduleId,
        isDeleted: false,
      });
      if (!result) {
        return { status: 404, message: "Result not found!!" };
      }

      return { status: 200, resultId: result._id };
    } catch (error) {
      return { status: 500, message: error.message };
    }
  }
  public async getResultById(id: string, studentId: string) {
    try {
      const result = await Result.findById(id).populate([
        {
          path: "Questions",
          select: ["_id", "question", "options", "attempt", "explaination"],
        },
        {
          path: "quizQuestions",
          select: ["_id", "question", "options", "attempt", "explaination"],
        },
      ]);
      if (result && result.isDeleted) {
        return { status: 404, message: "Result not found!!" };
      }

      // Process each question to find correct and selected answer
      if(result.quizId){
      const processedQuestions = result.quizQuestions.map((q: any) => {
        const correctOption = q.options.find((opt: any) => opt.answer === true);

        // Assuming attempt is an array like: [{ optionId: '...' }]
        const attempted = q.attempt?.find((att) => att.studentId === studentId);

        const selectedOption = q.options.find(
          (opt: any) => String(opt._id) === String(attempted?.optionId)
        );
        const options = q.options.map((option) => {
          const opt = option.toObject();
          if (String(opt._id) === String(attempted?.optionId)) {
            return {
              ...opt,
              attempt: true,
            };
          } else {
            return {
              ...opt,
              attempt: false,
            };
          }
        });
        if (selectedOption) {
          const isSame = correctOption.answer && selectedOption.answer;
          return {
            _id: q._id,
            skip: false,
            question: q.question,
            options: options,
            explaination: q.explaination,
          };
        } else {
          return {
            _id: q._id,
            skip: true,
            question: q.question,
            options: q.options,
            explaination: q.explaination,
          };
        }
      });

      const newResult = result.toObject() as any;
      newResult.quizQuestions = processedQuestions;

      const { quizQuestions, ...rest } = newResult;

      return {
        status: 200,
        result: { ...rest, questions: quizQuestions.filter((q) => q) },
      };
      } else {
      const processedQuestions = result.Questions.map((q: any) => {
        const correctOption = q.options.find((opt: any) => opt.answer === true);

        // Assuming attempt is an array like: [{ optionId: '...' }]
        const attempted = q.attempt?.find((att) => att.studentId === studentId);

        const selectedOption = q.options.find(
          (opt: any) => String(opt._id) === String(attempted?.optionId)
        );

        const options = q.options.map((option) => {
          const opt = option.toObject();
          if (String(opt._id) === String(attempted?.optionId)) {
            return {
              ...opt,
              attempt: true,
            };
          } else {
            return {
              ...opt,
              attempt: false,
            };
          }
        });

        if (selectedOption) {
          const isSame = correctOption.answer && selectedOption.answer;
          return {
            _id: q._id,
            skip: false,
            question: q.question,
            options: options,
            explaination: q.explaination,
          };
        } else {
          return {
            _id: q._id,
            skip: true,
            question: q.question,
            options: q.options,
            explaination: q.explaination,
          };
        }
      });

      const newResult = result.toObject() as any;
      newResult.Questions = processedQuestions;

      const { Questions, ...rest } = newResult;

      return {
        status: 200,
        result: { ...rest, questions: Questions.filter((q) => q) },
      };
      }
    } catch (error) {
      return { status: 500, message: error.message };
    }
  }

  public async removeResult(id: string) {
    try {
      const result = await Result.findByIdAndUpdate(id, {
        $set: { isDeleted: true },
      });
      if (!result) {
        return { status: 404, message: "Result not found!!" };
      }
      return { status: 200, result };
    } catch (error) {
      return { status: 500, message: error.message };
    }
  }

  public async getAllResultByQuizId(quizId: string) {
    try {
      const results = await Result.find({
        quizId,
        isDeleted: false,
      });

      if (results && results.length === 0) {
        return { status: 404, message: "Result not found!!" };
      }

      return { status: 200, results };
    } catch (error) {
      return { status: 500, message: error.message };
    }
  }
}
