import { Request, Response } from 'express';
import { admin } from '../infra/firebase-admin';

class UserController {
  fetch(req: Request, res: Response): void {
    admin
      .auth()
      .listUsers(50)
      .then(({ users }) =>
        res.json(
          users.map(({ uid, email, customClaims, phoneNumber }) => ({
            uid,
            email,
            phoneNumber,
            admin: !!customClaims?.admin,
          })),
        ),
      );
  }

  promote(req: Request, res: Response): void {
    const { uid } = req.params;
    admin
      .auth()
      .setCustomUserClaims(uid, { admin: true })
      .then(() => res.send('Promovido para administrador com sucesso!'));
  }

  demote(req: Request, res: Response): void {
    const { uid } = req.params;
    admin
      .auth()
      .setCustomUserClaims(uid, { admin: false })
      .then(() => res.send('Promovido para administrador com sucesso!'));
  }
}

export default new UserController();
