import { Db, ObjectId } from "mongodb";

export type Account = {
  _id: ObjectId;
  provider: "discord";
  type: "oauth";
  providerAccountId: string;
  access_token: string;
  expires_at: number;
  refresh_token: string;
  scope: string;
  token_type: "Bearer";
  restream: {
    accessToken: string;
    refreshToken: string;
    expiresAt: string;
  };
  userId: ObjectId;
};

export type AccountRepository = {
  getAccountByUserId: (userId: ObjectId) => Promise<Account | null>;
  updateAccount: (account: Account) => Promise<void>;
}

const initialize = (db: Db): AccountRepository => ({

  getAccountByUserId: async (userId: ObjectId) => {
    const account = await db.collection("accounts").findOne({ userId: new ObjectId(userId) });
    return account as Account;
  },

  updateAccount: async (account: Account) => {
    await db.collection("accounts").updateOne({ _id: new ObjectId(account._id) }, account);
  }

});

export default initialize;