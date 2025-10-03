import { model, Schema } from "mongoose";

interface NurtureModel {
  _id: string;
  aboutUs: string;
  termAndConditions: string;
  quizRuleAndRegulation: string;
  testInstructions: string;
  isDeleted: boolean;
}

const nurtureSchema = new Schema<NurtureModel>(
  {
    _id: {
      type: String,
      required: true,
      unique: true,
    },
    aboutUs: {
      type: String,
      default: "",
    },
    termAndConditions: {
      type: String,
      default: "",
    },
    quizRuleAndRegulation: {
      type: String,
      default: "",
    },

    testInstructions: {
      type: String,
      default: "",
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default model<NurtureModel>("nurture", nurtureSchema);
