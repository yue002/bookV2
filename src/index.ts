import "dotenv/config";
import Debug from "debug";
import express from "express";
import sessionIns, {
  setSessionInfoAfterLogin,
  formatSession,
} from "./auth/session.js";
import passportIns from "./auth/passport.js";
import setupCommonMiddleWares from "./middlewares.js";
import { deleteSession, createUser } from "@db/repositories.js";
import { PORT, NODE_ENV } from "@db/env.js";

const debug = Debug("fs-auth");
const app = express(); // Intializing the express app
setupCommonMiddleWares(app);

// * Session
if (NODE_ENV === "production") app.set("trust proxy", 1); // trust first proxy
app.use(sessionIns);

// * Passport
app.use(passportIns.initialize());
app.use(passportIns.session());

// * Endpoints
app.get("/", async (req, res, next) => {
  const sessions = await formatSession(req);
  res.render("pages/index", {
    title: "Home",
    user: req.user,
    sessions: sessions,
  });
});

app.get("/signup", function (req, res) {
  res.render("pages/signup", {
    title: "Signup",
  });
});

app.post("/signup", async function (req, res, next) {
  console.log(req.body);
  const name = req.body?.name ?? "";
  const email = req.body?.email ?? "";
  const password = req.body?.password ?? "";
  const passwordConfirm = req.body?.passwordConfirm ?? "";

  if (password !== passwordConfirm) {
    res.status(401).send("Passwords not matched.");
    return next(); // If I don't return, the function will continue executing.
  }

  try {
    await createUser(name, email, password);
    res.setHeader("HX-Redirect", "/login");
    res.send(`<div></div>`);
  } catch (err: any) {
    console.log(err);
    res.status(500).send(err?.message ?? "Something wrong");
    return next();
  }
});

app.get("/login", function (req, res) {
  res.render("pages/login", {
    title: "Login",
  });
});

app.post("/login", passportIns.authenticate("local"), function (req, res) {
  debug("@login handler");
  setSessionInfoAfterLogin(req, "CREDENTIAL");
  res.setHeader("HX-Redirect", "/");
  res.send(`<div></div>`);
});

app.get("/login/oauth/github", passportIns.authenticate("github"));

app.get(
  "/callback/github",
  passportIns.authenticate("github", { failureRedirect: "/login" }),
  function (req, res) {
    console.log("----------Callback--------------");
    setSessionInfoAfterLogin(req, "GITHUB");
    res.redirect("/");
  }
);

app.get("/login/oauth/google", passportIns.authenticate("google"));

app.get(
  "/callback/google",
  passportIns.authenticate("google", { failureRedirect: "/login" }),
  function (req, res) {
    console.log("----------Callback--------------");
    setSessionInfoAfterLogin(req, "GOOGLE");
    res.redirect("/");
  }
);

app.post("/logout", function (req, res, next) {
  // req.logout will not delete the session in db. It will generate new one for the already-logout user.
  // When the user login again, it will generate new session with the user id.
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    // If you want to delete the session in DB, you can use this function.
    req.session.destroy(function (err) {
      if (err) {
        return next(err);
      }
      res.setHeader("HX-Redirect", "/");
      res.send("<div></div>");
    });
  });
});

app.delete("/session", async function (req, res, next) {
  const sid = (req?.query?.sid ?? "") as string;
  const request = await deleteSession(sid);
  res.setHeader("HX-Redirect", "/");
  res.send(`<div></div>`);
});

// * Running app
app.listen(PORT, async () => {
  debug(`Listening on port ${PORT}: http://localhost:${PORT}`);
});