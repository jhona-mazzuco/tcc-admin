import admin from "firebase-admin";
import * as functions from "firebase-functions";
import * as firebase from "firebase/app";
import fieldRoutes from "./routes/field-routes";
import panelRoutes from "./routes/panel-routes";
import schedulingRoutes from "./routes/scheduling-routes";

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

export const panel = functions.https.onRequest(panelRoutes);
export const scheduling = functions.https.onRequest(schedulingRoutes);
export const field = functions.https.onRequest(fieldRoutes);
