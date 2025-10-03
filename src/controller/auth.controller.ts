import { StudentService } from "../services/student.service";
import { clientRequest } from "../middleware/jwtToken";
import { AuthService } from "../services/auth.service";
import { Request, Response } from "express";

export const Signup = async (req: Request, res: Response) => {
  const { firstName, lastName, email, phone, password, countryCode } = req.body;
  const name = firstName + " " + lastName;
  const authService = new AuthService();

  const response = await authService.signup(
    name,
    email,
    phone,
    password,
    countryCode
  );
  if (response["status"] == 200) {
    res.status(200).json({
      status: response["status"],
      data: response["student"],
      message: response["message"],
    });
  } else {
    res
      .status(response["status"])
      .json({ status: response["status"], message: response["message"] });
  }
};

export const OtpVarification = async (req: Request, res: Response) => {
  const { otp, email } = req.body;
  const authService = new AuthService();

  const response = await authService.varifyOtp(email, otp);
  if (response["status"] == 200) {
    res.status(200).json({
      status: response["status"],
      message: response["message"],
    });
  } else {
    res
      .status(response["status"])
      .json({ status: response["status"], message: response["message"] });
  }
};

export const ForgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;
  const authService = new AuthService();

  const response = await authService.forgotPassword(email);

  if (response["status"] === 200) {
    res
      .status(response["status"])
      .json({
        status: response["status"],
        data: { email: response["email"], otp: response["otp"] },
        message: response["message"],
      });
  } else {
    res
      .status(response["status"])
      .json({ status: response["status"], message: response["message"] });
  }
};

export const ResetPassword = async (req: Request, res: Response) => {
  const { password, email } = req.body;
  const authService = new AuthService();

  const response = await authService.resetPassword(password, email);

  if (response["status"] === 200) {
    res
      .status(response["status"])
      .json({ status: response["status"], message: response["message"] });
  } else {
    res
      .status(response["status"])
      .json({ status: response["status"], message: response["message"] });
  }
};

export const Login = async (req: Request, res: Response) => {
  const { phone, password, countryCode } = req.body;
  const authService = new AuthService();

  const response = await authService.login(phone, password, countryCode);

  if (response["status"] === 200) {
    res.status(200).json({
      status: response["status"],
      message: response["message"],
      data: response["user"],
    });
  } else if (response["status"] === 402) {
    res.status(response["status"]).json({
      status: response["status"],
      message: response["message"],
      token: response["token"],
    });
  } else {
    res.status(response["status"]).json({
      status: response["status"],
      message: response["message"],
    });
  }
};
export const LogOut = async (req: clientRequest, res: Response) => {
  const { _id } = req.user;
  const isStudent = _id.startsWith("STUD");
  const authService = new AuthService();

  const response = await authService.logout(_id, isStudent);

  if (response["status"] == 200) {
    res
      .status(200)
      .json({ status: response["status"], message: response["message"] });
  } else {
    res
      .status(response["status"])
      .json({ status: response["status"], message: response["message"] });
  }
};

export const DeleteAcount = async (req: clientRequest, res: Response) => {
  const { _id } = req.user;

  const studentService = new StudentService();

  const response = await studentService.deleteAccount(_id);

  if (response["status"] == 200) {
    res
      .status(200)
      .json({ status: response["status"], message: response["message"] });
  } else {
    res.status(response["status"]).json({ message: response["message"] });
  }
};
export const GetAcount = async (req: clientRequest, res: Response) => {
  res.status(200).json({ status: 200, message: "success" });
};
