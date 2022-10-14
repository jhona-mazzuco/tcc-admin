import * as cors from "cors";
import * as express from "express";
import * as session from "express-session";
import admin from "firebase-admin";
import * as functions from "firebase-functions";
import * as firebase from "firebase/app";
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


const app = express();

app.use(cors({ origin: true }));
app.use(session({
  secret: process.env.SESSION_SECRET as string,
  saveUninitialized: true,
  resave: true,
}));

app.post("/signin", UserController.signIn);

app.get("/users", adminLogged, UserController.fetch);
app.put("/users/:uid/promote", adminLogged, UserController.promote);
app.put("/users/:uid/demote", adminLogged, UserController.demote);

app.post('/scheduling', userLogged, SchedulingController.schedule);

export const panel = functions.https.onRequest(app);
