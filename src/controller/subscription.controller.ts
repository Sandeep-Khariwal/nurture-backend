import { ExamService } from "../services/exam.service";
import { SubscriptionService } from "../services/subscription.service";
import { Request, Response } from "express";

export const CreateSubscription = async (req: Request, res: Response) => {
  const data = req.body;
  const subscriptionService = new SubscriptionService();
  const examService = new ExamService();

  let response;
  if (data.subscriptionId) {
    response = await subscriptionService.updateSubscriptionById(
      data.subscriptionId,
      data
    );
  } else {
    response = await subscriptionService.createSubscription(data);
  }
  if (response["status"] === 200) {
    // update subscription in exam if created
    if (!data.subscriptionId) {
      await examService.addSubscriptionInExam(
        data.examId,
        response["subcription"]._id
      );
    }

    res.status(200).json({
      status: 200,
      data: response["subcription"],
      message: response["message"],
    });
  } else {
    res.status(response["status"]).json(response["message"]);
  }
};

export const GetSubscription = async (req: Request, res: Response) => {
  const { id } = req.params;

  const subscriptionService = new SubscriptionService();

  const response = await subscriptionService.getSubscriptionsByExamId(id);

  if (response["status"] === 200) {
    res
      .status(response["status"])
      .json({ status: 200, data: response["subscriptions"].reverse() });
  } else {
    res.status(response["status"]).json(response["message"]);
  }
};
