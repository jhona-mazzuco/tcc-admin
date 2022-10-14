import {NextFunction, Request, Response} from "express";
import * as firebaseAdmin from "firebase-admin";
import {verify} from "jsonwebtoken";
import {USER_RESPONSE_MESSAGE} from "../constants/user-response-message";
import {ResponseMessage} from "../models/ResponseMessage";
import {UserToken} from "../interfaces/UserToken";

export const adminLogged =
  async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (token) {
      try {
        const {uid} = verify(token, process.env.JWT_SECRET!) as UserToken;
        const user = await firebaseAdmin.auth().getUser(uid);
        if (!user.customClaims?.admin) {
          errorResponse(res);
          return;
        }

        next();
      } catch (e) {
        errorResponse(res);
      }
    } else {
      errorResponse(res);
    }
  };

const errorResponse = (res: Response): void => {
  res
      .status(401)
      .json(new ResponseMessage(USER_RESPONSE_MESSAGE.UNAUTHORIZED));
};
