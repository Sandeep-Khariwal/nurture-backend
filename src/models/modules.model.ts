import { model, Schema } from "mongoose";
interface ModulesModel {
  _id: string;
  name: string;
  examId: string;
  chapterId: string;
  questions: string[];
  iconImage: string;
  videos: {
    videoUrl: string;
    thumbnailUrl: string;
    title: string;
  }[];
  isPro: boolean;

  questionAttempted: {
    studentId: string;
    questionId: string;
    attempted_at?: Date;
  }[];
  totalTime: number;
  isDeleted: boolean;
  isCompleted: { studentId: string; isCompleted: boolean }[];
  student_time: { studentId: string; totalTime: number }[];
  resultId: { id: string; studentId: string }[];
}

const moduleSchema = new Schema<ModulesModel>({
  _id: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  examId: {
    type: String,
    ref: "exams",
  },
  chapterId: {
    type: String,
    ref: "chapter",
  },
  questions: {
    type: [String],
    ref: "question",
  },
  videos: {
    type: [
      {
        videoUrl: {
          type: String,
          default: "",
        },
        thumbnailUrl: {
          type: String,
          default: "",
        },
        title: {
          type: String,
          default: "",
        },
      },
    ],
    default: [],
  },
  iconImage: {
    type: String,
  },
  isPro: {
    type: Boolean,
    default: false,
  },
  totalTime: {
    type: Number,
    default: 0,
  },
  questionAttempted: {
    type: [
      {
        _id: false,
        studentId: { type: String, ref: "student" },
        questionId: { type: String, ref: "question" },
        attempted_at: { type: Date, default: Date.now },
      },
    ],
    default: [],
  },
  isCompleted: {
    type: [
      {
        studentId: {
          type: String,
          default: "",
          ref: "students",
        },
        isCompleted: {
          type: Boolean,
          default: false,
        },
      },
    ],
    default: [],
  },
  student_time: {
    type: [
      {
        studentId: {
          type: String,
          default: "",
          ref: "students",
        },
        totalTime: {
          type: Number,
          default: 0,
        },
      },
    ],
    default: [],
  },
  resultId: {
    type: [
      {
        id: {
          type: String,
          default: "",
          ref: "result",
        },
        studentId: {
          type: String,
          default: "",
          ref: "students",
        },
      },
    ],
    default: [],
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
});
export default model<ModulesModel>("module", moduleSchema);
