import { model, Schema } from "mongoose";

interface TeacherModel {
  _id: string;
  name: string;
  assignedSubjects: string[];
  assignedExams: string[];
  featureAccess: {
    createTest: boolean;
    createDailyChallenges: boolean;
  };
}

const teacherSchema = new Schema<TeacherModel>(
  {
    _id: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      minlength: 3,
    },
    assignedSubjects: {
      type: [String],
      required: true,
      ref: "subjects",
    },
    assignedExams: {
      type: [String],
      required: true,
      ref: "exams",
    },
    featureAccess: {
      createTest: {
        type: Boolean,
        default: false,
      },
      createDailyChallenges: {
        type: Boolean,
        default: false,
      },
    },
  },
  {
    timestamps: true,
  }
);

export default model<TeacherModel>("teachers", teacherSchema);
