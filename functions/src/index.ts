import * as cors from "cors";
import * as express from "express";
import admin from "firebase-admin";
import * as functions from "firebase-functions";
import * as firebase from "firebase/app";
import UserController from "./controllers/UserController";
import {loggedAdmin} from "./middlewares/logged-admin";

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
app.use(cors({origin: true}));


app.post("/signin", UserController.signIn);
app.get("/users", loggedAdmin, UserController.fetch);
app.put("/users/:uid/promote", loggedAdmin, UserController.promote);
app.put("/users/:uid/demote", loggedAdmin, UserController.demote);

export const panel = functions.https.onRequest(app);
