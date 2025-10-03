import { randomUUID } from "crypto";
import Subscription from "../models/subscription.model";

export class SubscriptionService {
  public async createSubscription(data: {
    name: string;
    examId: string;
    plans: {
      price: number;
      discountPrice: number;
      duration: string;
      subscriptionType: string;
    }[];
    planTag: string;
    includes: string[];
  }) {
    try {
      const subscription = new Subscription();
      subscription._id = `SUBS-${randomUUID()}`;
      subscription.name = data.name;
      subscription.examId = data.examId;
      subscription.plans = data.plans;
      subscription.planTag = data.planTag;
      subscription.includes = data.includes;

      const savedSubscription = await subscription.save();

      return {
        status: 200,
        subcription: savedSubscription,
        message: "Subscription created!!",
      };
    } catch (error) {
      return { status: 500, message: error.message };
    }
  }

  public async updateSubscriptionById(
    id: string,
    data: {
      name: string;
      examId: string;
      plan: { price: number; discountPrice: number; duration: string };
      planId: string;
    }
  ) {
    try {
      const updatedSubscription = await Subscription.findOneAndUpdate(
        { _id: id, "plans._id": data.planId },
        {
          $set: {
            name: data.name,
            examId: data.examId,
            "plans.$.price": data.plan.price,
            "plans.$.discountPrice": data.plan.discountPrice,
            "plans.$.duration": data.plan.duration,
          },
        },
        {
          new: true,
        }
      );

      return {
        status: 200,
        subcription: updatedSubscription,
        message: "Subscription updated!!",
      };
    } catch (error) {
      return { status: 500, message: error.message };
    }
  }

  public async getSubscriptionsByExamId(id: string) {
    try {
      const subscriptions = await Subscription.find({ examId: id });

      if (subscriptions && !subscriptions.length) {
        return {
          status: 200,
          subscriptions: [],
          message: "Subscriptions not found",
        };
      }

      return { status: 200, subscriptions };
    } catch (error) {
      return { status: 500, message: error.message };
    }
  }

  public async getSubscriptionsById(id: string) {
    try {
      const subscriptions = await Subscription.findById(id);
      if (!subscriptions) {
        return { status: 404, message: "Subsceription not found!!" };
      }

      return { status: 200, subscription: subscriptions };
    } catch (error) {
      return { status: 500, message: error.message };
    }
  }
}
