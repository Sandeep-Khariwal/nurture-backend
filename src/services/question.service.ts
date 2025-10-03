import { randomUUID } from "crypto";
import Question from "../models/question.model";
import mongoose from "mongoose";

export class QuestionService {
  public async createQuestion(data: {
    question: string;
    moduleId: string;
    options: {
      name: string;
      answer: boolean;
    }[];
    correctAns: string;
    explaination: string;
  }) {
    try {
      const question = new Question();
      question._id = `QSTN-${randomUUID()}`;
      question.question = data.question;
      question.moduleId = data.moduleId;
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
      moduleId: string;
      options: {
        name: string;
        answer: boolean;
      }[];
      correctAns: string;
      explaination: string;
    }
  ) {
    try {
      const updatedQuestion = await Question.findByIdAndUpdate(id, question, {
        new: true,
      });
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
      const question = await Question.findById(id);

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
      await question.save();

      return { status: 200, question };
    } catch (error) {
      return { status: 200, message: error.message };
    }
  }
  public async getQuestionById(id: string) {
    try {
      const question = await Question.findById(id, { isDeleted: false });
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
      const questions = await Question.find({
        moduleId: id.trim(),
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
      const questions = await Question.find({ moduleId: moduleId });

      // Step 2: Remove student attempt from each question
      const updatePromises = questions.map((question) => {
        return Question.findByIdAndUpdate(
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
      const question = await Question.findByIdAndUpdate(id, {
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

  public async removeManyQuestionByModuleId(moduleIds: string[]) {
    try {
      await Question.updateMany(
        { moduleId: { $in: moduleIds } },
        { $set: { isDeleted: true } }
      );
      return { status: 200, message: "Question removed!!" };
    } catch (error) {
      return { status: 500, message: error.message };
    }
  }

  public async restoreManyQuestionByModuleId(moduleIds: string[]) {
    try {
      await Question.updateMany(
        { moduleId: { $in: moduleIds } },
        { $set: { isDeleted: false } }
      );
      return { status: 200, message: "Question Restored!!" };
    } catch (error) {
      return { status: 500, message: error.message };
    }
  }

  public async removeImageFromQuestion(id: string) {
    try {
      const question = await Question.findByIdAndUpdate(
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
  public async addImageToQuestion(id: string, imageUrl: string) {
    try {
      const question = await Question.findByIdAndUpdate(
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
}
