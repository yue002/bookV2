import { type ProviderType } from "@/db/schemas.js";
import { getAllUserSessions } from "@db/repositories.js";
import { NODE_ENV } from "@db/env.js";
import connect from "connect-sqlite3";
import dayjs from "dayjs";
import "dotenv/config";
import { type Request } from "express";
import session from "express-session";
import { type Details } from "express-useragent";
import { nanoid } from "nanoid";

const generateSessionKey = (req: Request) => {
  const userId = req.user?.id ?? nanoid();
  const randomId = nanoid();
  return `sid:${userId}:${randomId}`;
};

const SQLiteStore = connect(session);
const SQLiteStoreInstance = new SQLiteStore({
  db: "./db.sqlite",
  table: "sessions",
});

const sessionIns = session({
  secret: "My Super Secret",
  cookie: {
    path: "/",
    httpOnly: true,
    secure: NODE_ENV === "production" ? true : false,
    maxAge: 60 * 60 * 1000,
    sameSite: "lax",
  },
  saveUninitialized: false,
  resave: false,
  store: SQLiteStoreInstance as session.Store,
  genid: generateSessionKey,
});

export default sessionIns;

export type LoginType = ProviderType | "CREDENTIAL";

export function setSessionInfoAfterLogin(req: Request, loginType: LoginType) {
  if (req.user && req.useragent) {
    req.session.useragent = req.useragent;
    req.session.createdAt = new Date().getTime();
    req.session.loginType = loginType;
  }
}

export async function formatSession(req: Request) {
  const sessions = await getAllUserSessions(req?.user?.id ?? "");

  const sessionsMod = sessions?.map((session) => {
    const sess = session.sess as any;
    const createdAt = (sess?.createdAt ?? new Date().getTime()) as number;
    const dt = dayjs(createdAt);
    const useragent = (sess?.useragent ?? null) as Details | null;
    const useragentStr = useragent
      ? `${useragent.browser} - ${useragent.os}`
      : "Unknown Source";
    const loginType = (sess?.loginType ?? "") as LoginType | "";
    return {
      ...session,
      isOwnSession: session.sid === req.sessionID,
      createdAtStr: dt.format("DD/MM/YYYY HH:mm:ss"),
      createdAtDt: dt,
      useragentStr: useragentStr,
      loginType: loginType,
    };
  });

  return sessionsMod;
}
