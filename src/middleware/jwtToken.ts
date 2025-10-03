// import jwt, { Secret } from "jsonwebtoken";

// export const generateAccessToken = (data: {
//     _id:string,
//     email:string,
//     phone:string,
// }): string => {
//     const payload = {
//       _id: data._id,
//       email: data.email,
//       phone: data.phone,
//     };
//     return jwt.sign(payload, process.env.TOKEN_SECRET as Secret, {
//       expiresIn: "365d",
//     });
//   };

import { NextFunction, Response, Request } from "express";
import jwt, { Secret } from "jsonwebtoken";
import { ParsedQs } from 'qs';

export const generateAccessToken = (data: {
  _id: string;
  email: string;
  name: string;
}): string => {
  const payload = {
    _id: data._id,
    email: data.email,
    name: data.name,
  };
  return jwt.sign(payload, process.env.TOKEN_SECRET as Secret, {
    expiresIn: "365d",
  });
};

export interface clientRequest extends Request {
  id: string;
  user: any;
}

export const blacklistedTokens = new Set();

export const authenticateToken = (
  req: clientRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const brearerToken = req.headers["authorization"];
        if(!brearerToken){
      res.status(401).json({ status: 401, message: "Token not found" });
      return;
    }
    const authHeader = brearerToken.split(" ")[1];

    if (!authHeader) {
      res.status(403).json("Token not found");
      return;
    }

    if (blacklistedTokens.has(authHeader)) {
      res.status(401).json({ status:401, message: "Token has been expired " });
      return;
    }

    jwt.verify(
      authHeader,
      process.env.TOKEN_SECRET as string,
      (err: any, user: any) => {
        if (err) {
          return res.status(403).json("Error occure in middleware");
        }
        const currentTime = Math.floor(Date.now() / 1000);
        if (user.exp < currentTime) {
          return res.status(401).json({ message: "Token expired" });
        }

        if (!user.active && new Date() > user.endDate) {
          return res.status(401).json({ message: "expired" });
        }
        req.user = user;
        next();
      }
    );
  } catch (error) {
       res.status(401).json({ message: "expired" });
  }
};
export const LogoutMiddleware = (
  req: clientRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const brearerToken = req.headers["authorization"];
    const authHeader = brearerToken.split(" ")[1];

    if (blacklistedTokens.has(authHeader)) {
      res.status(401).json({ status: 401, message: "user already logged out" });
      return;
    }
    if (!authHeader) {
      res.status(403).json("Token not found");
      return;
    }

    blacklistedTokens.add(authHeader);

    jwt.verify(
      authHeader,
      process.env.TOKEN_SECRET as string,
      (err: any, user: any) => {
        if (err) {
          return res.status(403).json("Error occure in middleware");
        }
        const currentTime = Math.floor(Date.now() / 1000);
        if (user.exp < currentTime) {
          return res.status(401).json({ message: "Token expired" });
        }

        if (!user.active && new Date() > user.endDate) {
          return res.status(401).json({ message: "expired" });
        }
        req.user = user;
        next();
      }
    );
  } catch (error) {
      res.status(401).json({ message: "expired" });
  }
};



export function toStringParam(
  param: string | ParsedQs | (string | ParsedQs)[]
): string | undefined {
  if (typeof param === 'string') return param;
  if (Array.isArray(param)) {
    const first = param[0];
    if (typeof first === 'string') return first;
    return undefined;
  }
  return undefined;
}