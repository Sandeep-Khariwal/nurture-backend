import { model, Schema } from "mongoose";

interface DailyDose {
  _id: string;
  question: string;
  options: {
    name: string;
    answer: boolean;
  }[];
  attempt: {
    studentId: string;
    optionId: string;
  }[];
  correctAns: string;
  examId: string;
  dailyDoseWisdom: string;
  explaination: string;
  showAt: Date;
  isDeleted:boolean
}
const dailyDoseSchema = new Schema<DailyDose>({
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
  correctAns: {
    type: String,
    default: "",
  },
  dailyDoseWisdom: {
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
  examId: {
    type: String,
    ref: "exams",
  },
  showAt: {
    type: Date,
    required: true,
  },
});

export default model<DailyDose>("dailyDose", dailyDoseSchema);
