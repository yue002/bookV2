import {
  accountsTable,
  sessionsTable,
  UserData,
  usersTable,
  type ProviderType,
} from "@/db/schemas.js";
import { dbClient } from "@db/client.js";
import bcrypt from "bcrypt";
import { eq, like } from "drizzle-orm";

interface CheckUserOutput {
  user: typeof usersTable.$inferSelect | null;
  isProviderAccountExist: boolean;
  isUserExist: boolean;
  accountId: string | null;
  userId: string | null;
}

async function getUserFromId(id: string) {
  return dbClient.query.usersTable.findFirst({
    where: eq(usersTable.id, id),
  });
}

async function checkUser(email: string, provider: ProviderType) {
  const output: CheckUserOutput = {
    user: null,
    isProviderAccountExist: false,
    isUserExist: false,
    userId: null,
    accountId: null,
  };

  // Check user by email
  const userQuery = await dbClient.query.usersTable.findFirst({
    where: eq(usersTable.email, email),
    with: {
      accounts: true,
    },
  });
  if (userQuery) {
    output.user = userQuery;
    output.userId = userQuery.id;
    output.isUserExist = true;
    // Check if provider account exists
    const providerQuery = userQuery.accounts.find(
      (acc) => acc.provider === provider
    );
    if (providerQuery) {
      output.isProviderAccountExist = true;
      output.accountId = providerQuery.id;
    }
  }
  return output;
}

export async function handleUserData(uData: UserData) {
  const check = await checkUser(uData.email, uData.provider);

  if (!check.isUserExist) {
    // Create user
    const queryResult = await dbClient
      .insert(usersTable)
      .values({
        name: uData.name,
        email: uData.email,
        isAdmin: false,
        password: "",
        avatarURL: uData.avatarURL,
      })
      .returning({ id: usersTable.id });

    const userId = queryResult[0].id;
    await dbClient.insert(accountsTable).values({
      userId: userId,
      provider: uData.provider,
      providerAccountId: uData.providerAccountId,
      profile: uData.profile,
      accessToken: uData.accessToken,
      refreshToken: uData.refreshToken,
    });
    return getUserFromId(userId);
  } else {
    if (!check.isProviderAccountExist) {
      // Create provider account
      await dbClient.insert(accountsTable).values({
        userId: check.user?.id ?? "",
        provider: uData.provider,
        providerAccountId: uData.providerAccountId,
        profile: uData.profile,
        accessToken: uData.accessToken,
        refreshToken: uData.refreshToken,
      });
      // Update avatar
    } else {
      // If provider account exists, update information
      await dbClient
        .update(accountsTable)
        .set({
          profile: uData.profile,
          accessToken: uData.accessToken,
          refreshToken: uData.refreshToken,
        })
        .where(eq(accountsTable.id, check.accountId ?? ""));
    }
    // Update user avatar so that I know which provider I am using right now. In production, I should let user update own avatar.
    if (uData?.avatarURL) {
      await dbClient
        .update(usersTable)
        .set({ avatarURL: uData.avatarURL })
        .where(eq(usersTable.id, check.userId ?? ""));
    }
    // Returning user
    return getUserFromId(check.user?.id ?? "");
  }
}

export async function getAllUserSessions(userId: string) {
  if (!userId) return null;
  const likeString = `%${userId}%`;
  const results = await dbClient
    .select()
    .from(sessionsTable)
    .where(like(sessionsTable.sid, likeString));
  return results;
}

export async function deleteSession(sid: string) {
  return await dbClient
    .delete(sessionsTable)
    .where(eq(sessionsTable.sid, sid))
    .returning();
}

export async function createUser(
  name: string,
  email: string,
  password: string
) {
  const saltRounds = 10;
  let hashedPassword = "";
  hashedPassword = await new Promise((resolve, reject) => {
    bcrypt.hash(password, saltRounds, function (err, hash) {
      if (err) reject(err);
      resolve(hash);
    });
  });
  await dbClient
    .insert(usersTable)
    .values({
      name,
      email,
      isAdmin: false,
      password: hashedPassword,
      avatarURL: "logos/robot.png",
    })
    .returning({ id: usersTable.id });
}
