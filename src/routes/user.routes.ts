import express from 'express';
import UserController from '../controller/user.controller';

const UserRoutes = express.Router();

UserRoutes.get('/', UserController.fetch);
UserRoutes.put('/:uid/admin', UserController.promote);
UserRoutes.delete('/:uid/admin', UserController.demote);

export default UserRoutes;
