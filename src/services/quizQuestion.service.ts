import QuizQuestion from "../models/quizQuestion.model";
import { randomUUID } from "crypto";
import mongoose from "mongoose";

export class QuizQuestionService {
  public async createQuestion(data: {
    question: string;
    quizId: string;
    options: {
      name: string;
      answer: boolean;
    }[];
    correctAns: string;
    explaination: string;
  }) {
    try {
      const question = new QuizQuestion();
      question._id = `QQSN-${randomUUID()}`;
      question.question = data.question;
      question.quizId = data.quizId;
      question.options = data.options;
      question.correctAns = data.correctAns;
      question.explaination = data.explaination;
      question.isDeleted = false;

      const savedQuestion = await question.save();

      return {
        status: 200,
        question: savedQuestion,
        message: "Question created!!",
      };
    } catch (error) {
      return { status: 500, message: error.message };
    }
  }

  public async updateById(
    id: string,
    question: {
      question: string;
      quizId: string;
      options: {
        name: string;
        answer: boolean;
      }[];
      correctAns: string;
      explaination: string;
    }
  ) {
    try {
      const updatedQuestion = await QuizQuestion.findByIdAndUpdate(
        id,
        question,
        {
          new: true,
        }
      );
      return {
        status: 200,
        question: updatedQuestion,
        message: "Question updated!!",
      };
    } catch (error) {
      return { status: 200, message: error.message };
    }
  }

  public async updateStudentResponseById(
    id: string,
    student: {
      studentId: string;
      optionId: string;
    }
  ) {
    try {
      const question = await QuizQuestion.findById(id);

      if (!question) {
        return { status: 404, message: "Question not found!!" };
      }
      const alreadyAttempted = question.attempt.some(
        (attempt) => attempt.studentId === student.studentId
      );

      if (alreadyAttempted) {
        return { status: 400, message: "Already attempted!!" };
      }

      question.attempt.push(student);
      const updatedQuestion = await question.save();

      return { status: 200, question: updatedQuestion };
    } catch (error) {
      return { status: 200, message: error.message };
    }
  }
  public async getQuestionById(id: string) {
    try {
      const question = await QuizQuestion.findById(id, { isDeleted: false });
      if (!question) {
        return { status: 404, message: "Question not found" };
      }
      return { status: 200, question: question };
    } catch (error) {
      return { status: 200, message: error.message };
    }
  }

  public async getAllQuestionById(id: string) {
    try {
      const questions = await QuizQuestion.find({
        quizId: id.trim(),
        isDeleted: false,
      });
      return { status: 200, questions };
    } catch (error) {
      return { status: 200, message: error.message };
    }
  }
  public async removeStudentResponseFromQuestion(
    moduleId: string,
    studentId: string
  ) {
    try {
      // Step 1: Find all questions belonging to the module
      const questions = await QuizQuestion.find({ quizId: moduleId });

      // Step 2: Remove student attempt from each question
      const updatePromises = questions.map((question) => {
        return QuizQuestion.findByIdAndUpdate(
          question._id,
          {
            $pull: {
              attempt: { studentId: studentId },
            },
          },
          { new: true }
        );
      });

      const updatedQuestions = await Promise.all(updatePromises);

      return { status: 200, updatedQuestions };
    } catch (error) {
      return { status: 500, message: error.message };
    }
  }
  public async removeQuestionById(id: string) {
    try {
      const question = await QuizQuestion.findByIdAndUpdate(id, {
        $set: { isDeleted: true },
      });
      if (!question) {
        return { status: 404, message: "Question not found!!" };
      }
      return { status: 200, message: "Question removed!!" };
    } catch (error) {
      return { status: 500, message: error.message };
    }
  }

  public async removeManyQuestionByQuizId(moduleIds: string[]) {
    try {
      await QuizQuestion.updateMany(
        { quizId: { $in: moduleIds } },
        { $set: { isDeleted: true } }
      );
      return { status: 200, message: "Question removed!!" };
    } catch (error) {
      return { status: 500, message: error.message };
    }
  }

  public async addImageToQuestion(id: string, imageUrl: string) {
    try {
      const question = await QuizQuestion.findByIdAndUpdate(
        id,
        {
          $set: { imageUrl: imageUrl },
        },
        { new: true }
      );

      if (!question) {
        return { status: 404, message: "Question not found!!" };
      }
      return { status: 200, question, message: "Image Added!!" };
    } catch (error) {
      return { status: 500, message: error.message };
    }
  }
    public async removeImageFromQuestion(id: string) {
      try {
        const question = await QuizQuestion.findByIdAndUpdate(
          id,
          {
            $set: { imageUrl: "" },
          },
          { new: true }
        );
  
        if (!question) {
          return { status: 404, message: "Question not found!!" };
        }
        return { status: 200, question, message: "Image Removed!!" };
      } catch (error) {
        return { status: 500, message: error.message };
      }
    }
}
