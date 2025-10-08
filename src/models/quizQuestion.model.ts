import { model, Schema } from "mongoose";
interface QuizQuestionsModel {
  _id: string;
  question: string;
  quizId: string;
  options: {
    name: string;
    answer: boolean;
  }[];
  attempt: {
    studentId: string;
    optionId: string;
  }[];
  correctAns: string;
  imageUrl: string;
  explaination: string;
  isDeleted: boolean;
}

const quizQuestionSchema = new Schema<QuizQuestionsModel>({
  _id: {
    type: String,
    required: true,
    unique: true,
  },
  question: {
    type: String,
    required: true,
  },
  options: {
    type: [
      {
        name: {
          type: String,
          default: "",
        },
        answer: {
          type: Boolean,
          default: false,
        },
      },
    ],
  },
  attempt: {
    type: [
      {
        studentId: {
          type: String,
          default: "",
          ref: "student",
        },
        optionId: {
          type: String,
          default: "",
        },
      },
    ],
  },
  quizId: {
    type: String,
    ref: "quiz",
  },
  correctAns: {
    type: String,
    default: "",
  },
  imageUrl: {
    type: String,
    default: "",
  },
  explaination: {
    type: String,
    default: "",
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
});
export default model<QuizQuestionsModel>("quizQuestion", quizQuestionSchema);
