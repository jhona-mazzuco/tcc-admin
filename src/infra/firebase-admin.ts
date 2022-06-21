import { ServiceAccount } from 'firebase-admin';
import * as admin from 'firebase-admin';

const serviceAccount = {
  privateKey: process.env.ADMIN_PRIVATE_KEY,
  projectId: process.env.ADMIN_PROJECT_ID,
  clientEmail: process.env.ADMIN_CLIENT_EMAIL,
} as ServiceAccount;

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export { admin };
