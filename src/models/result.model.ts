import mongoose, { Schema } from "mongoose";

export interface ResultModal {
    _id:string;
  studentId: string;
  examId: string;
  moduleId: string;
  quizId: string;
  chapterId: string;

  totalQuestions: number;
  totalMarks: number;
  attemptedQuestions: number;
  skippedQuestions: number;
  correctAnswers: number;
  obtainedMarks: number;
  wrongAnswers: number;
  accuracy: number;
  totalTimeSpent: number;
  isCompleted: boolean;
  Questions:string[]
  quizQuestions:string[]

  isDeleted:boolean;
  createdAt: Date;
  updatedAt: Date;

}

const ResultSchema = new Schema<ResultModal>(
  {
    _id:{
        type:String,
        default:"",
        required:true
    },
    studentId: { type: String, required: true },
    examId: { type: String, ref:"exams" },
    moduleId: { type: String, ref:"module" },
    quizId: { type: String, ref:"quiz" },
    chapterId: { type: String, default:"" , ref:"chapter" },
    Questions: { type: [String], default:[] , ref:"question" },
    quizQuestions: { type: [String], default:[] , ref:"quizQuestion" },

    totalQuestions: { type: Number, required: true },
    totalMarks: { type: Number,default:0 },
    obtainedMarks: { type: Number,default:0 },
    attemptedQuestions: { type: Number, required: true },
    skippedQuestions: { type: Number, required: true },
    correctAnswers: { type: Number, required: true },
    wrongAnswers: { type: Number, default:0},
    accuracy: { type: Number, default:0},
    totalTimeSpent: { type: Number, default:0 },
    isCompleted: { type: Boolean, required: true },
    isDeleted: { type: Boolean , default:false},
  },
  {
    timestamps: true,
  }
);

const ResultModel = mongoose.model<ResultModal>("result", ResultSchema);
export default ResultModel;
