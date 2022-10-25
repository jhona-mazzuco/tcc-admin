import {Request, Response} from "express";
import admin from "firebase-admin";
import {getAuth, signInWithEmailAndPassword} from "firebase/auth";
import {sign} from "jsonwebtoken";
import {USER_RESPONSE_MESSAGE} from "../constants/user-response-message";
import {FetchUsersParams} from "../interfaces/FetchUsersParams";
import {ResponseError} from "../models/ResponseError";
import {ResponseMessage} from "../models/ResponseMessage";
import {User} from "../models/User";

class UserController {
  async signIn(request: Request, response: Response) {
    const {email, password} = request.body;
    try {
      const authenticated =
        await signInWithEmailAndPassword(
            getAuth(),
            email,
            password
        );
      const {customClaims} = await admin.auth().getUser(authenticated.user.uid);
      if (customClaims?.admin) {
        const token = sign(
            {uid: authenticated.user.uid},
          process.env.JWT_SECRET!
        );

        response.send({token, email: authenticated.user!.email});
      } else {
        response
            .status(401)
            .json(new ResponseError(USER_RESPONSE_MESSAGE.UNAUTHORIZED, 401));
      }
    } catch (e) {
      response.status(500).json(e);
    }
  }

  async fetch(request: Request, response: Response) {
    const {email} = request.query as unknown as FetchUsersParams;
    try {
      const {users} = email ? await admin
          .auth()
          .getUsers([{email}]) :
      await admin.auth().listUsers();
      response.json(users.map((user) => new User(user)));
    } catch (e) {
      response.status(500).send(e);
    }
  }

  async sendEmailPasswordReset(request: Request, response: Response) {
    const {email} = request.body;
    try {
      await admin
          .auth()
          .generatePasswordResetLink(email);
      response.json(new ResponseMessage('E-mail enviado com sucesso!'));
    } catch (e) {
      response.status(500).send(new ResponseError());
    }
  }

  promote(req: Request, res: Response): void {
    const {uid} = req.params;
    admin
        .auth()
        .setCustomUserClaims(uid, {admin: true})
        .then(() =>
          res.json(new ResponseMessage(USER_RESPONSE_MESSAGE.PROMOTE_SUCCESS)))
        .catch((e) => res.status(500).send(e));
  }

  demote(req: Request, res: Response): void {
    const {uid} = req.params;
    admin
        .auth()
        .setCustomUserClaims(uid, {admin: false})
        .then(() =>
          res.json(new ResponseMessage(USER_RESPONSE_MESSAGE.DEMOTE_SUCCESS)))
        .catch((e) => res.status(500).send(e));
  }
}

export default new UserController();
