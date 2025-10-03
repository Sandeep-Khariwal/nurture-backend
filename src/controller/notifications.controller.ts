import { StudentService } from "../services/student.service";
import { sendPushNotification } from "../firebase/notification";
import { Request, Response } from "express";

export const SendNotification = async (req: Request, res: Response) => {
  const { title, message, pushType } = req.body;

  if (!title || !message) {
    res.status(400).json({ message: "Missing fields" });
  }

  const studentService = new StudentService();

  const response = await studentService.getAllStudent();
  if (response["status"] === 200) {
    const studentsFcmTokens = response["students"]
      .filter((stud: any) => stud.fcmToken)
      .map((stud: any) => stud.fcmToken);

    let allPromises = [];

    studentsFcmTokens.forEach((tkn) => {
      const resp = sendPushNotification(tkn, { title, message });

      allPromises.push(resp);
    });

    await Promise.all(allPromises);

    res
      .status(response["status"])
      .json({
        status: response["status"],
        message: "Notification sent successfully!!",
      });
  } else {
    res
      .status(response["status"])
      .json({ status: response["status"], message: response["message"] });
  }
  //   try {
  //     const result = await sendPushNotification(fcmToken, { title, message  });
  //     res.json({ success: true, result });
  //   } catch (err) {
  //     res.status(500).json({ success: false, error: err });
  //   }
};
