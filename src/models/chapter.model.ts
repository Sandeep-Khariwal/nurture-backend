import { model, Schema } from "mongoose";

interface ChapterModel {
  _id: string;
  name: string;
  modules: string[];
  iconImage: string;
  examId: string;
    isDeleted:boolean
}
const chapterSchema = new Schema<ChapterModel>({
  _id: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  modules: {
    type: [String],
    ref: "modules",
  },
  iconImage: {
    type: String,
    default: "",
  },
  examId: {
    type: String,
    default: "",
    ref: "exams",
  },
    isDeleted:{
    type:Boolean,
    default:false
  }
});

export default model<ChapterModel>("chapter", chapterSchema);
