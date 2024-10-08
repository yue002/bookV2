import { accountsTable, sessionsTable } from "@/db/schemas.js";
import { dbClient } from "@db/client.js";
import { eq, like } from "drizzle-orm";

async function testAddAccount() {
  const results = await dbClient.query.usersTable.findMany();
  await dbClient
    .insert(accountsTable)
    .values([
      { userId: results[0].id, provider: "GITHUB", providerAccountId: "1234" },
    ]);
}

async function testReadAccount() {
  const results = await dbClient.query.usersTable.findMany({
    with: {
      accounts: true,
    },
  });
  console.log({ results });
  console.log(JSON.stringify(results, null, 4));
}

async function testUpdateJsonColumn() {
  const results = await dbClient.query.accountsTable.findMany();
  await dbClient
    .update(accountsTable)
    .set({ profile: { test: "updated" } })
    .where(eq(accountsTable.id, results[0].id));
}

async function testGetAllUserSessions(userId: string) {
  const likeString = `%${userId}%`;
  const results = await dbClient
    .select()
    .from(sessionsTable)
    .where(like(sessionsTable.sid, likeString));
  console.log(results);
}

// testAddAccount();
// testReadAccount();
// testUpdateJsonColumn();
const userId = "dZTigGbTZXND2fGzNAfwB";
testGetAllUserSessions(userId);
