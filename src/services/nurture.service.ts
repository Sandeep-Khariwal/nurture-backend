import { randomUUID } from "crypto";
import Nurture from "../models/nurture.model";

export class NurtureService {
  public async createInfo(data: {
    aboutUs: string;
    termAndConditions: string;
    quizRuleAndRegulation: string;
    testInstructions: string;
  }) {
    try {
      const nurture = new Nurture();
      nurture._id = `NRTR-${randomUUID()}`;
      nurture.aboutUs = data.aboutUs;
      nurture.termAndConditions = data.termAndConditions;
      nurture.quizRuleAndRegulation = data.quizRuleAndRegulation;
      nurture.testInstructions = data.testInstructions;

      await nurture.save();

      return { status: 200, message: "Info created!!" };
    } catch (error) {
      return { status: 500, message: error.message };
    }
  }

  public async getNurtureInfo() {
    try {
      const nurture = await Nurture.find({});

      if (nurture && !nurture.length) {
        return { status: 404, message: "Data not found!!" };
      }

      return { status: 200, nurture:nurture[0] };
    } catch (error) {
      return { status: 500, message: error.message };
    }
  }
}
