import express from 'express';
import UserRoutes from './user.routes';

const Routes = express.Router();

Routes.use('/users', UserRoutes);

export default Routes;
