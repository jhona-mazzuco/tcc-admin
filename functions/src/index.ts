import * as cors from "cors";
import * as express from "express";
import * as session from "express-session";
import admin from "firebase-admin";
import * as functions from "firebase-functions";
import * as firebase from "firebase/app";
import FieldController from "./controllers/FieldController";
import SchedulingController from "./controllers/SchedulingController";
import UserController from "./controllers/UserController";
import { adminLogged } from "./middlewares/admin-logged";
import { userLogged } from "./middlewares/user-logged";

const firebaseConfig = {
  apiKey: process.env.API_KEY,
  authDomain: process.env.AUTH_DOMAIN,
  projectId: process.env.PROJECT_ID,
  storageBucket: process.env.STORAGE_BUCKET,
  messagingSenderId: process.env.MESSAGING_SENDER_ID,
  appId: process.env.APP_ID,
};

firebase.initializeApp(firebaseConfig);
admin.initializeApp(functions.config().firebase);

const panelApp = express();

panelApp.use(cors({ origin: true }));

panelApp.post("/signin", UserController.signIn);
panelApp.post(
  "/recovery",
  UserController.sendEmailPasswordReset
);

panelApp.get("/users", adminLogged, UserController.fetch);
panelApp.put("/users/:uid/promote", adminLogged, UserController.promote);
panelApp.put("/users/:uid/demote", adminLogged, UserController.demote);

panelApp.post('/field', adminLogged, FieldController.create);
panelApp.put('/field/:id', adminLogged, FieldController.update);
panelApp.delete('/field/:id', adminLogged, FieldController.delete);
panelApp.get('/field', adminLogged, FieldController.findAll);
panelApp.get('/field/:id', adminLogged, FieldController.findById);

export const panel = functions.https.onRequest(panelApp);

const schedulingApp = express();

schedulingApp.use(cors({ origin: true }));
schedulingApp.use(session({
  secret: process.env.SESSION_SECRET as string,
  saveUninitialized: true,
  resave: true,
}));

schedulingApp.get('/', SchedulingController.fetch);
schedulingApp.post('/', userLogged, SchedulingController.schedule);

export const scheduling = functions.https.onRequest(schedulingApp);
