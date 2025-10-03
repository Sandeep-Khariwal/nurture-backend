import mongoose, { Schema } from "mongoose";

export interface QuizModal {
  _id: string;
  name: string;
  examId: string;
  questions: string[];
  isRegistrationOpen: boolean;
  isQuizLive: boolean;

  questionAttempted: {
    studentId: string;
    questionId: string;
    attempted_at?: Date;
  }[];

  quizFees: number;
  totalTime: number;
  isCompleted: { studentId: string; isCompleted: boolean }[];
  registeredStudent: {
    studentId: string;
    paymentId: string;
    isEligible: boolean;
  }[];
  student_time: { studentId: string; totalTime: number }[];
  resultId: { id: string; studentId: string }[];

  startAt: Date;
  registerStartDate: Date;
  registerEndDate: Date;

  winnerPrices: {
    firstPrize: string;
    secondPrize: string;
    thirdPrize: string;
    images: string[];
  };
  priceStaticContent: string;
  miniTestInstructions: string;
  mockDrillInstructions: string;

  isDeleted: boolean;
}

const quizSchema = new Schema<QuizModal>(
  {
    _id: {
      type: String,
      default: "",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    examId: {
      type: String,
      ref: "exams",
    },
    questions: {
      type: [String],
      ref: "quizQuestion",
    },
    isRegistrationOpen: { type: Boolean, default: false },
    isQuizLive: { type: Boolean, default: false },
    totalTime: {
      type: Number,
      default: 0,
    },
    quizFees: {
      type: Number,
      default: 0,
    },
    questionAttempted: {
      type: [
        {
          _id: false,
          studentId: { type: String, ref: "student" },
          questionId: { type: String, ref: "quizQuestion" },
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
    registeredStudent: {
      type: [
        {
          studentId: {
            type: String,
            default: "",
            ref: "students",
          },
          paymentId: {
            type: String,
            default: "",
          },
          isEligible: {
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
    startAt: {
      type: Date,
      default: null,
    },
    registerStartDate: {
      type: Date,
      default: null,
    },
    registerEndDate: {
      type: Date,
      default: null,
    },

    isDeleted: { type: Boolean, default: false },
    winnerPrices: {
      type: {
        firstPrize: {
          type: String,
          default: "",
        },
        secondPrize: {
          type: String,
          default: "",
        },
        thirdPrize: {
          type: String,
          default: "",
        },
        images: {
          type: [String],
          default: [],
        },
      },
    },
    priceStaticContent: {
      type: String,
      default: "",
    },
    miniTestInstructions: {
      type: String,
      default: "",
    },
    mockDrillInstructions: {
      type: String,
      default: "",
    },
  },

  {
    timestamps: true,
  }
);

const Quiz = mongoose.model<QuizModal>("quiz", quizSchema);
export default Quiz;
