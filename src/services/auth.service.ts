import studentModel from "../models/student.model";
import { randomUUID } from "crypto";
import { sendMail } from "../email/CreateEmail";
import { CreateHtmlForOTP } from "../email/CreatehtmlForOTP";
import { generateAccessToken } from "../middleware/jwtToken";
import adminModel from "../models/admin.model";
import bcrypt from "bcryptjs";
import * as dotenv from 'dotenv';
dotenv.config();

export class AuthService {
  public async signup(
    name: string,
    email: string,
    phone: string,
    password: string,
    countryCode: string
  ) {
    try {
      const checkStudent = await studentModel.findOne({
        $or: [{ email: email }, { phoneNumber: phone }],
      });
      if (checkStudent) {
        return { status: 404, message: "User already exist!!" };
      }
      // let otp = "";
      // let isEmail = false;
      // const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      // const phonePattern = /^\+?[1-9]\d{1,14}$/;

      // if (emailPattern.test(emailOrPhone)) {
      //   isEmail = true;
      // } else if (phonePattern.test(emailOrPhone)) {
      //   isEmail = false;
      // }

      // if (isEmail) {
      //   const createOTP = Math.floor(Math.random() * 9000) + 1000;
      //   otp = createOTP.toString();
      // } else {
      //   otp = "1234";
      // }

      // if (isEmail) {
      //   sendMail(
      //     process.env.MAIL,
      //     emailOrPhone,
      //     "Email Varification OTP!",
      //     CreateHtmlForOTP(otp)
      //   );
      // } else {
      //   // write logic for send sms on mobile phone
      // }

      const student = new studentModel();
      student._id = `STUD-${randomUUID()}`;
      student.dateOfJoining = new Date();
      student.name = name;
      student.name = name;
      // student.lastOtp = otp;
      student.isLogedIn = false;
      student.token = "";
      student.email = email;

      student.phoneNumber = phone;
      student.password = password;
      student.countryCode = countryCode;
      student.isLogedIn = true;
      student.userType = "student";

      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      student.password = hashedPassword;

      const token = generateAccessToken({
        _id: student._id,
        email: student.email,
        name: student.name,
      });

      student.token = token;
      const savedStudent = await student.save();

      delete savedStudent.password;

      return {
        status: 200,
        student: savedStudent,
        message: "Signup successfully!!",
      };
    } catch (error) {
      const errorObj = { message: error.message, status: 500 };
      return errorObj;
    }
  }

  public async varifyOtp(emailOrPhone: string, otp: string) {
    try {
      let isStudent = true;
      //find user email is student or admin
      let user;
      user = await studentModel.findOne({ email: emailOrPhone });

      if (!user) {
        isStudent = false;
        user = await adminModel.findOne({ email: emailOrPhone });
      }

      const token = generateAccessToken({
        _id: user?._id,
        email: user?.email,
        name: user?.name,
      });

      //varify the otp
      if (user?.lastOtp === otp) {
        // set isLogedIn
        if (isStudent) {
          user = await studentModel.findByIdAndUpdate(
            user._id,
            {
              isLogedIn: true,
              token: token,
            },
            { new: true }
          );
        } else {
          user = await adminModel.findByIdAndUpdate(
            user._id,
            {
              isLogedIn: true,
              token: token,
            },
            { new: true }
          );
        }

        // initialize the empty object
        let newUser = user.toObject();

        if (!isStudent) {
          newUser.userType = "admin";
        } else {
          newUser.userType = "student";
        }

        return {
          status: 200,
          user: newUser,
          message: "OTP varified!!",
        };
      } else {
        return { status: 404, message: "OTP not varified!!" };
      }
    } catch (error) {
      const errorObj = { message: error.message, status: 500 };
      return errorObj;
    }
  }

  public async login(phone: string, password: string, countryCode: string) {
    try {
      // let isEmail = false;
      // const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      // const phonePattern = /^\+?[1-9]\d{1,14}$/;

      let isStudent = true;
      let user;
      user = await studentModel.findOne({
        phoneNumber: phone,
      });

      if (!user) {
        user = await adminModel.findOne({
          phoneNumber: phone,
        });
        if (user) {
          isStudent = false;
        }
      }

      // Check if not student was found
      if (!user) {
        return { status: 404, message: "User not registered!!" };
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return { status: 404, message: "Invalid phone or password" };
      }

      if (user.isLogedIn) {
        return {
          status: 402,
          message: "User already logedin another device!!",
          token: user.token,
        };
      } else {
        // check admin is or not
        // if (admin) {
        //   isStudent = false;
        // }

        // let otp = "";

        // if (emailPattern.test(emailOrPhone)) {
        //   isEmail = true;
        // } else if (phonePattern.test(emailOrPhone)) {
        //   isEmail = false;
        // }

        // if (isEmail) {
        //   const createOTP = Math.floor(Math.random() * 9000) + 1000;
        //   otp = createOTP.toString();
        // } else {
        //   otp = "1234";
        // }
        // if (isEmail) {
        //   sendMail(
        //     process.env.MAIL,
        //     emailOrPhone,
        //     "Email Varification OTP!",
        //     CreateHtmlForOTP(otp)
        //   );
        // } else {
        //   // write logic for send sms on mobile phone
        // }
        // let user

        const token = generateAccessToken({
          _id: user._id,
          email: user.email,
          name: user.name,
        });
        if (isStudent) {
          user = await studentModel.findByIdAndUpdate(
            user._id,
            {
              token,

              $set: { isLogedIn: true },
            },
            { new: true }
          );
        } else {
          user = await adminModel.findByIdAndUpdate(
            user._id,
            { token, $set: { isLogedIn: true } },
            { new: true }
          );
        }

        delete user.password;
        return { status: 200, message: "Login successfully!!", user };
      }
    } catch (error) {
      const errorObj = { message: error.message, status: 500 };
      return errorObj;
    }
  }
  public async forgotPassword(email: string) {
    try {
      const isStudentPresent = await studentModel.findOne({ email: email });
      const isAdminPresent = await adminModel.findOne({ email: email });
      if (!isStudentPresent && !isAdminPresent) {
        return { status: 404, message: "Email not registered!!" };
      }

      let otp = "";
      const createOTP = Math.floor(Math.random() * 9000) + 1000;
      otp = createOTP.toString();

      sendMail(
        process.env.MAIL,
        email,
        "Email Varification OTP!",
        CreateHtmlForOTP(otp)
      );
      let user;
      if (isStudentPresent) {
        user = await studentModel.findOneAndUpdate(
          {
            email: email,
          },
          { $set: { lastOtp: otp } },
          { new: true }
        );
      }

      if (!user) {
        await adminModel.findOneAndUpdate(
          {
            email: email,
          },
          { $set: { lastOtp: otp } },
          { new: true }
        );
      }

      return { status: 200, email, otp, message: "Otp sent!!" };
    } catch (error) {
      const errorObj = { message: error.message, status: 500 };
      return errorObj;
    }
  }

  public async resetPassword(password: string, email: string) {
    try {
      const isStudent = await studentModel.findOne({
        email: email,
      });
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      if (isStudent) {
        await studentModel.findOneAndUpdate(
          {
            email: email,
          },
          { $set: { password: hashedPassword } }
        );
      }
      await adminModel.findOneAndUpdate(
        {
          email: email,
        },
        { $set: { password: hashedPassword } }
      );

      return { status: 200, message: "Password updated!!" };
    } catch (error) {
      const errorObj = { message: error.message, status: 500 };
      return errorObj;
    }
  }
  public async logout(id: string, isStudent: boolean) {
    try {
      if (isStudent) {
        await studentModel.findByIdAndUpdate(id, { isLogedIn: false });
      } else {
        await adminModel.findByIdAndUpdate(id, { isLogedIn: false });
      }
      return { status: 200, message: "Logout successfully!!" };
    } catch (error) {
      const errorObj = { message: error.message, status: 500 };
      return errorObj;
    }
  }
}
