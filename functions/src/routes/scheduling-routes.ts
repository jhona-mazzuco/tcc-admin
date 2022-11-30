import * as cors from "cors";
import * as express from "express";
import * as session from "express-session";
import SchedulingController from "../controllers/SchedulingController";
import { userLogged } from "../middlewares/user-logged";

const schedulingRoutes = express();

schedulingRoutes.use(cors({ origin: true }));
schedulingRoutes.use(session({
  secret: process.env.SESSION_SECRET as string,
  saveUninitialized: true,
  resave: true,
}));

schedulingRoutes.get('/', userLogged, SchedulingController.fetchUserScheduled);
schedulingRoutes.get('/:id', SchedulingController.fetch);
schedulingRoutes.post('/', userLogged, SchedulingController.schedule);

export default schedulingRoutes;
