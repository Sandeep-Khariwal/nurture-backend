import { model, Schema } from "mongoose";

interface ExamsModel {
  _id: string;
  name: string;
  students: string[];
  chapters: string[];
  mini_test_modules: string[];
  mock_drills_modules: string[];
  tests: string[];
  isDeleted: boolean;
  dailyDoses: string[];
  subscriptions: string[];
  roadmapToSuccess: string;
}

const examsSchema = new Schema<ExamsModel>({
  _id: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  students: {
    type: [String],
    ref: "students",
  },
  chapters: {
    type: [String],
    ref: "chapter",
  },
  tests: {
    type: [String],
    ref: "tests",
  },
  mini_test_modules: {
    type: [String],
    ref: "module",
  },
  mock_drills_modules: {
    type: [String],
    ref: "module",
  },
  dailyDoses: {
    type: [String],
    ref: "dailyDose",
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  subscriptions: {
    type: [String],
    ref: "subscription",
    default: [],
  },
  roadmapToSuccess: {
    type: String,
    default: "",
  },
});

export default model<ExamsModel>("exams", examsSchema);
