import "dotenv/config";

export const NODE_ENV = (process.env.NODE_ENV ?? "") as
  | "production"
  | "development";

if (!["production", "development"].includes(NODE_ENV)) {
  throw new Error("Invalid NODE_ENV");
}

export const PORT = process.env.BACKEND_PORT ?? "5001";

const githubClientSecret = process.env.GITHUB_CLIENT_SECRET ?? "";
const githubClientID = process.env.GITHUB_CLIENT_ID ?? "";
const githubCallbackURL = process.env.GITHUB_CALLBACK_URL ?? "";
const githubTokenURL = process.env.GITHUB_TOKEN_URL ?? "";
const githubAuthorizationURL = process.env.GITHUB_AUTHORIZATION_URL ?? "";

if (
  !githubClientID ||
  !githubClientSecret ||
  !githubCallbackURL ||
  !githubTokenURL ||
  !githubAuthorizationURL
)
  throw new Error("Invalid ENV");

export const github = {
  githubClientID,
  githubClientSecret,
  githubCallbackURL,
  githubTokenURL,
  githubAuthorizationURL,
};

const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET ?? "";
const googleClientID = process.env.GOOGLE_CLIENT_ID ?? "";
const googleCallbackURL = process.env.GOOGLE_CALLBACK_URL ?? "";
const googleTokenURL = process.env.GOOGLE_TOKEN_URL ?? "";
const googleAuthorizationURL = process.env.GOOGLE_AUTHORIZATION_URL ?? "";

if (
  !googleClientID ||
  !googleClientSecret ||
  !googleCallbackURL ||
  !googleTokenURL ||
  !googleAuthorizationURL
)
  throw new Error("Invalid ENV");

export const google = {
  googleClientID,
  googleClientSecret,
  googleCallbackURL,
  googleTokenURL,
  googleAuthorizationURL,
};