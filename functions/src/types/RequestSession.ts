import session from "express-session";

export type RequestSession =
  session.Session & Partial<session.SessionData> & { userId: string | null };
