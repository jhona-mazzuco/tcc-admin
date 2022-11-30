import * as cors from "cors";
import * as express from "express";
import DashboardController from "../controllers/DashboardController";
import FieldController from "../controllers/FieldController";
import UserController from "../controllers/UserController";
import { adminLogged } from "../middlewares/admin-logged";

const panelRoutes = express();

panelRoutes.use(cors({ origin: true }));

panelRoutes.post("/signin", UserController.signIn);
panelRoutes.post(
  "/recovery",
  UserController.sendEmailPasswordReset
);

panelRoutes.get("/users", adminLogged, UserController.fetch);
panelRoutes.put("/users/:uid/promote", adminLogged, UserController.promote);
panelRoutes.put("/users/:uid/demote", adminLogged, UserController.demote);

panelRoutes.post('/field', adminLogged, FieldController.create);
panelRoutes.put('/field/:id', adminLogged, FieldController.update);
panelRoutes.delete('/field/:id', adminLogged, FieldController.delete);
panelRoutes.get('/field', adminLogged, FieldController.findAll);
panelRoutes.get('/field/:id', adminLogged, FieldController.findById);

panelRoutes.get('/dashboard', adminLogged, DashboardController.fetch);
panelRoutes
  .get(
    '/scheduling/:id/food',
    adminLogged,
    DashboardController.getFoodInfo
  );
panelRoutes
  .delete(
    '/scheduling/:id/cancel',
    adminLogged,
    DashboardController.cancelSchedule
  );

export default panelRoutes;
