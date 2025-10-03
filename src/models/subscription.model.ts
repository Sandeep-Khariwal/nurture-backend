import { model, Schema } from "mongoose";

interface Subscription {
  _id: string;
  name: string;
  examId: string;
  plans: { price: number; discountPrice: number; duration: string , subscriptionType:String }[];
  planTag: string;
  includes: string[];
}
const subscriptionSchema = new Schema<Subscription>(
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
    examId: {
      type: String,
      required: true,
      ref: "exam",
    },
    plans: {
      type: [
        {
          price: {
            type: Number,
            default: 0,
          },
          discountPrice: {
            type: Number,
            default: 0,
          },
          duration: {
            type: String,
            default: "",
          },
          subscriptionType: {
            type: String,
            default: "",
          },
        },
      ],
      default: [],
    },
    planTag: {
      type: String,
      default: "",
    },
    includes: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export default model<Subscription>("subscription", subscriptionSchema);
