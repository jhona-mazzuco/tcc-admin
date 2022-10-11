import {UserRecord} from "firebase-admin/lib/auth";

export class User {
  uid: string;
  email?: string;
  displayName?: string;
  phoneNumber?: string;
  admin: boolean;

  constructor({
    uid,
    email,
    displayName,
    phoneNumber,
    customClaims,
  }: UserRecord) {
    this.uid = uid;
    this.email = email;
    this.displayName = displayName;
    this.phoneNumber = phoneNumber;
    this.admin = !!customClaims?.admin;
  }
}
