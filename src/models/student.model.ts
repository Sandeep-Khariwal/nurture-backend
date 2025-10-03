import { model, Schema } from "mongoose";

interface StudentModel {
  _id: string;
  name: string;
  phoneNumber: string;
  profilePic: string;
  exams: { _id: string; name: string; is_primary: boolean }[];
  parentNumber: string;
  email: string;
  fcmToken: string;
  dateOfBirth: Date;
  dateOfJoining: Date;
  address: string;
  isLogedIn: boolean;
  password: string;

  testAnswers: { testId: string; answerSheetId: string }[];
  studentResults: string[];
  createdAt: Date;
  isDeleted: boolean;
  paymentRecords: string[];
  collegeName: string;

  subscriptions: {
    examId: string;
    subscriptionId: string;
    planId: string;
    subscriptionStart: Date;
    subscriptionEnd: Date;
    featuresAccess: {
      accessProModules: boolean;
      accessJournerSoFar: boolean;
      accessAdFree: boolean;
      accessSupportAndNotifications: boolean;
      accessVideoLibrary: boolean;
      accessVideoCombo: boolean;
      accessPrioritySupport: boolean;
    };
  }[];

  lastOtp: string;
  gender: string;
  country: string;
  countryCode: string;
  state: string;
  city: string;
  subscriptionType: string;
  featureAccess: {
    pro: boolean;
  };
  token: string;
  results: string[];
  quizResults: string[];
  userType: String;
}

const studentSchema = new Schema<StudentModel>({
  _id: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    default: "",
  },
  profilePic: {
    type: String,
    default: "",
  },
  exams: {
    type: [
      {
        _id: {
          type: String,
          default: "",
          ref: "exams",
        },
        name: {
          type: String,
          default: "",
        },
        is_primary: {
          type: Boolean,
          default: false,
        },
      },
    ],
    required: false,
    default: [],
    ref: "exams",
  },
  parentNumber: {
    type: String,
    default: "",
  },
  dateOfBirth: {
    type: Date,
    default: new Date(),
  },
  collegeName: {
    type: String,
    default: "",
  },
  address: {
    type: String,
    default: "",
  },
  testAnswers: {
    type: [
      {
        testId: { type: String, ref: "Test", required: true },
        answerSheetId: { type: String, ref: "AnswerSheet", required: true },
      },
    ],
    default: [],
  },
  studentResults: {
    type: [String],
    default: [],
    ref: "StudentResult",
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  isLogedIn: {
    type: Boolean,
    default: false,
  },
  paymentRecords: {
    type: [String],
    default: [],
    ref: "StudentPaymentRecord",
  },
  lastOtp: {
    type: String,
    default: "",
  },
  gender: {
    type: String,
    default: "",
  },
  country: {
    type: String,
    default: "",
  },
  countryCode: {
    type: String,
    default: "",
  },
  password: {
    type: String,
    default: "",
  },
  state: {
    type: String,
    default: "",
  },
  city: {
    type: String,
  },
  email: {
    type: String,
    required: false,
  },
  fcmToken: {
    type: String,
    default:""
  },
  subscriptionType: {
    type: String,
    required: false,
  },
  token: {
    type: String,
    required: false,
  },
  userType: {
    type: String,
    required: false,
  },
  results: {
    type: [String],
    ref: "result",
    required: false,
  },
  quizResults: {
    type: [String],
    ref: "result",
    required: false,
  },
  dateOfJoining: {
    type: Date,
    default: Date.now(),
  },
  subscriptions: {
    type: [
      {
        examId: {
          type: String,
          ref: "exams",
          default: "",
        },
        subscriptionId: {
          type: String,
          ref: "subscription",
          default: "",
        },
        planId: {
          type: String,
          ref: "subscription",
          default: "",
        },
        subscriptionStart: {
          type: Date,
          default: new Date(),
        },
        subscriptionEnd: {
          type: Date,
          default: new Date(),
        },
        featuresAccess: {
          type: {
            accessProModules: {
              type: Boolean,
              default: false,
            },
            accessJournerSoFar: {
              type: Boolean,
              default: false,
            },
            accessAdFree: {
              type: Boolean,
              default: false,
            },
            accessSupportAndNotifications: {
              type: Boolean,
              default: false,
            },
            accessVideoLibrary: {
              type: Boolean,
              default: false,
            },
            accessVideoCombo: {
              type: Boolean,
              default: false,
            },
            accessPrioritySupport: {
              type: Boolean,
              default: false,
            },
          },
        },
      },
    ],
    default: [],
  },
});

export default model<StudentModel>("students", studentSchema);
