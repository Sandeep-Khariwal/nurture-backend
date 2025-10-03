import { NurtureService } from "../services/nurture.service";
import { Request, Response } from "express";

export const CreateNurture = async (req: Request, res: Response) => {
  const payload = req.body;

  const nurtureService = new NurtureService();

  const response = await nurtureService.createInfo(payload);

  if (response["status"] === 200) {
    res.status(200).json({ status: 200, message: response["message"] });
  } else {
    res
      .status(response["status"])
      .json({ status: response["status"], message: response["message"] });
  }
};
export const GetNurture = async (req: Request, res: Response) => {
  const nurtureService = new NurtureService();

  const response = await nurtureService.getNurtureInfo();

  if (response["status"] === 200) {
    res
      .status(200)
      .json({
        status: 200,
        data: response["nurture"]
      });
  } else {
    res
      .status(response["status"])
      .json({ status: response["status"], message: response["message"] });
  }
};
