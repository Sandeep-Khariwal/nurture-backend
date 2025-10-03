import { model, Schema } from "mongoose";
interface QuestionsModel {
  _id: string;
  question: string;
  moduleId: string;
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
const moduleSchema = new Schema<QuestionsModel>({
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
  moduleId: {
    type: String,
    ref: "modules",
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
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
});
export default model<QuestionsModel>("question", moduleSchema);
