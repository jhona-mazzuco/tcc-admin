import { NextFunction, Request, Response } from "express";
import { verify } from "jsonwebtoken";
import { USER_RESPONSE_MESSAGE } from "../constants/user-response-message";
import { UserToken } from "../interfaces/UserToken";
import { ResponseMessage } from "../models/ResponseMessage";
import { RequestSession } from "../types/RequestSession";

export const userLogged =
  async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (token) {
      const { uid } = verify(token, process.env.JWT_SECRET!) as UserToken;
      (req.session as RequestSession).userId = uid;
      next();
    } else {
      (req.session as RequestSession).userId = null;
      res
          .status(401)
          .json(new ResponseMessage(USER_RESPONSE_MESSAGE.UNAUTHORIZED));
    }
  };
