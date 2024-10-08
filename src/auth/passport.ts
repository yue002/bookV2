import passportIns from "passport";
import { dbClient } from "@db/client.js";
import { eq } from "drizzle-orm";
import { usersTable } from "@db/schemas.js";
import { local } from "./passportLocal.js";
import { github } from "./passportOauthGithub.js";
import { google } from "./passportOauthGoogle.js";

passportIns.use(local);
passportIns.use("github", github);
passportIns.use("google", google);

passportIns.serializeUser(function (user, done) {
  done(null, user.id);
});

passportIns.deserializeUser<string>(async function (id, done) {
  const query = await dbClient.query.usersTable.findFirst({
    where: eq(usersTable.id, id),
  });
  if (!query) {
    done(null, false);
  } else {
    done(null, query);
  }
});

export default passportIns;