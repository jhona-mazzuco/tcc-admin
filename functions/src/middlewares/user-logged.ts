import { NextFunction, Request, Response } from "express";
import { USER_RESPONSE_MESSAGE } from "../constants/user-response-message";
import { ResponseMessage } from "../models/ResponseMessage";
import { RequestSession } from "../types/RequestSession";

export const userLogged =
  async (req: Request, res: Response, next: NextFunction) => {
    const uid = req.headers.authorization?.split(" ")[1];
    if (uid) {
      (req.session as RequestSession).userId = uid!;
      next();
    } else {
      (req.session as RequestSession).userId = null;
      res
        .status(401)
        .json(new ResponseMessage(USER_RESPONSE_MESSAGE.UNAUTHORIZED));
    }
  };
