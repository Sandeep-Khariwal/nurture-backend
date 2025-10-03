import { Request, Response } from "express";
import crypto from "crypto";
import { myRazorpayInstance } from "../app";
import { QuizService } from "../services/quiz.service";
import { StudentService } from "../services/student.service";
import { SubscriptionService } from "../services/subscription.service";
import { SubscriptionType } from "../enums/subscription";

export const GetRazorpayKeys = (req: Request, res: Response) => {
  res.status(200).json({
    status: 200,
    data: {
      RAZORPAY_API_KEY: "rzp_test_MnTn74lHc6ml0N",
      RAZORPAY_API_SECRET: "N5WC2lntxPHUxvdNxfSltzpA",
    },
  });
};

export const CreateOrder = async (req: Request, res: Response) => {
  const { amount } = await req.body;

  try {
    const options = {
      amount: Number(amount * 100),
      currency: "INR",
    };
    const order = await myRazorpayInstance.orders.create(options);
    res.status(200).json({
      status: 200,
      data: order,
    });
  } catch (error) {
    res.status(500).json({ status: 500, error: error });
  }
};

export const WebhookEvent = async (req: Request, res: Response) => {
  const secret = process.env.WEBHOOK_SECRET;
  const signature = req.headers["x-razorpay-signature"];
  const body = JSON.stringify(req.body);

  const expectedSignature = crypto
    .createHmac("sha256", secret || "")
    .update(body.toString())
    .digest("hex");

  if (signature === expectedSignature) {
    const event = req.body;
    // Handle event like payment.captured
    if (event.event === "payment.authorized") {
      const payment = req.body.payload.payment.entity;
      const notes = payment.notes;

      const user = {
        fullName: notes.fullName,
        email: notes.email,
        studentId: notes.studentId,
        countryCode: notes.countryCode,
        phone: notes.phone,
        address: notes.address,
        collegeName: notes.collegeName,
        quizId: notes.quizId,
        razorpayPaymentId: payment.id,
        amount: payment.amount,
        status: payment.status,
      };

      const quizService = new QuizService();
      const studentService = new StudentService();

      // register student in quiz
      await quizService.registerInQuiz({
        studentId: user.studentId,
        quizId: user.quizId,
        paymentId: user.razorpayPaymentId,
      });

      // update information in student modal
      await studentService.updateQuizStudentInfo(user.studentId, {
        email: user.email,
        collegeName: user.collegeName,
        address: user.address,
      });

      res.status(200).json({ status: 200, message: "payment is success!!" });
    } else {
      res.status(404).json({ status: 404, message: "payment failed" });
    }
  } else {
    res.status(500).json({ status: 500, error: "Invalid signature" });
  }
};
export const PurchaseSubscription = async (req: Request, res: Response) => {
  const secret = process.env.WEBHOOK_SECRET;
  const signature = req.headers["x-razorpay-signature"];
  const body = JSON.stringify(req.body);

  const expectedSignature = crypto
    .createHmac("sha256", secret || "")
    .update(body.toString())
    .digest("hex");

  if (signature === expectedSignature) {
    const event = req.body;
    // Handle event like payment.captured
    if (event.event === "payment.authorized") {
      const payment = req.body.payload.payment.entity;
      const notes = payment.notes;

      const user = {
        studentId: notes.studentId,
        examId: notes.examId,
        mainPlanId: notes.mainPlanId,
        planId: notes.planId,
      };

      const studentService = new StudentService();
      const subscriptionService = new SubscriptionService();

      const subscriptionResp = await subscriptionService.getSubscriptionsById(
        notes.mainPlanId
      );

      let newSubscription;
      if (subscriptionResp["status"] === 200) {
        const subscription = subscriptionResp["subscription"];
        const plan = subscription.plans.find(
          (plan: any) => plan._id.toString() === notes.planId.toString()
        );
        console.log("user  : ", user,plan);
        
        if (SubscriptionType.MONTHLY === plan.subscriptionType) {
          const totalMonths = plan.duration.split(" ")[0];
          const months = Number(totalMonths);

          const date = new Date();
          const fiveAndHalfHoursInMs = 5.5 * 60 * 60 * 1000;
          const now = new Date(date.getTime() + fiveAndHalfHoursInMs);
          // const subscriptionEnd = new Date(now.getTime() + 5 * 60 * 1000);
          const subscriptionEnd = new Date(now);
          subscriptionEnd.setMonth(subscriptionEnd.getMonth() + months);

          newSubscription = {
            examId: user.examId,
            subscriptionStart: now,
            subscriptionEnd: subscriptionEnd,
            subscriptionId: user.mainPlanId,
            planId: user.planId,
            featuresAccess: {
              accessProModules: true,
              accessJournerSoFar: true,
              accessAdFree: true,
              accessSupportAndNotifications: true,
              accessVideoLibrary: false,
              accessVideoCombo: false,
              accessPrioritySupport: false,
            },
          };
        } else {
          const years = plan.duration.split(" ")[0];
          const months = Number(years) * 12;

          const date = new Date();
          const fiveAndHalfHoursInMs = 5.5 * 60 * 60 * 1000;
          const now = new Date(date.getTime() + fiveAndHalfHoursInMs);
          const subscriptionEnd = new Date(now);
          subscriptionEnd.setMonth(subscriptionEnd.getMonth() + months);

          newSubscription = {
            examId: user.examId,
            subscriptionStart: now,
            subscriptionEnd: subscriptionEnd,
            subscriptionId: user.mainPlanId,
            planId: user.planId,
            featuresAccess: {
              accessProModules: true,
              accessJournerSoFar: true,
              accessAdFree: true,
              accessSupportAndNotifications: true,
              accessVideoLibrary: true,
              accessVideoCombo: true,
              accessPrioritySupport: true,
            },
          };
        }
      }
      await studentService.updateSubscriptionInStudent(
        user.studentId,
        newSubscription
      );

      res.status(200).json({ status: 200, message: "payment is success!!" });
    } else {
      res.status(404).json({ status: 404, message: "payment failed" });
    }
  } else {
    res.status(500).json({ status: 500, error: "Invalid signature" });
  }
};
