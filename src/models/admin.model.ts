import { model, Schema } from "mongoose";

interface AdminModel {
  _id: string;
  name: string;
  email: string;
  phoneNumber: string;
  lastOtp: string;
  userType: string;
  token: string;
  password: string;
  countryCode: string;
  isLogedIn: boolean;
}
const adminSchema = new Schema<AdminModel>({
  _id: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    default: "",
  },
  email: {
    type: String,
    default: "",
  },
  phoneNumber: {
    type: String,
    default: "",
  },
  lastOtp: {
    type: String,
    default: "",
  },
  token: {
    type: String,
    default: "",
  },
  password: {
    type: String,
    default: "",
  },
  userType: {
    type: String,
    default: "",
  },
  countryCode: {
    type: String,
    default: "",
  },
  isLogedIn: {
    type: Boolean,
    default: false,
  },
});

export default model<AdminModel>("admins", adminSchema);
