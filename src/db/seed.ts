import { usersTable } from "@/db/schemas.js";
import { dbClient, dbConn } from "@db/client.js";
import bcrypt from "bcrypt";

const saltRounds = 10;
const password = "1234";

async function insertData() {
  bcrypt.hash(password, saltRounds, async function (err, hash) {
    const results = await dbClient
      .insert(usersTable)
      .values([
        {
          name: "Admin User",
          email: "admin@cmu.com",
          isAdmin: true,
          password: hash,
          avatarURL: "logos/robot.png",
        },
        {
          name: "Regular User",
          email: "user@cmu.com",
          isAdmin: false,
          password: hash,
          avatarURL: "logos/robot.png",
        },
        {
          name: "pattarapon wongsin",
          email: "honamiyue@gmail.com",
          isAdmin: true,
          password: hash,
          avatarURL: "logos/robot.png",
        },
      ])
      .returning({ id: usersTable.id });

    // console.log(results);

    dbConn.close();
  });
}

insertData();
