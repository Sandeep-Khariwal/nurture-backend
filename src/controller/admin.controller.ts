import { AuthService } from "../services/auth.service";
import { AdminService } from "../services/admin.service";
import { Request, Response } from "express";

export const CreateAdmin = async (req: Request, res: Response) => {
  const { name, email, phone , password , countryCode } = req.body;
  const adminSerice = new AdminService()
   
  const response = await adminSerice.createAdmin({name,phone,email,password,countryCode})
  if(response["status"] ===200){
      res.status(200).json({status:200,message:"Admin created"})
  } else {
     res.status(response["status"]).json(response["message"])
  }
};
