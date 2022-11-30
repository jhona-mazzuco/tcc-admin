import * as cors from "cors";
import * as express from "express";
import * as session from "express-session";
import FieldController from "../controllers/FieldController";

const fieldRoutes = express();

fieldRoutes.use(cors({ origin: true }));
fieldRoutes.use(session({
  secret: process.env.SESSION_SECRET as string,
  saveUninitialized: true,
  resave: true,
}));
fieldRoutes.get('/', FieldController.findAll);
fieldRoutes.get('/:id', FieldController.findById);

export default fieldRoutes;
