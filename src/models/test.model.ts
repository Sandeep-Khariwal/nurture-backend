import { TestType } from "../enums/test.enum";
import { model, Schema } from "mongoose";

interface TestModel {
  _id: string;
  name: string;
  exam: string;
  type: TestType;
  questions: string[];
  timeDuration: string;
}
const testSchema = new Schema<TestModel>(
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
    exam: {
      type: String,
      required: true,
      ref: "exams",
    },
    type: {
      type: String,
      enum: Object.values(TestType),
      required: true,
    },
    questions: {
      type: [String],
      required: true,
      ref: "questions",
    },
    timeDuration: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default model<TestModel>("tests", testSchema);
