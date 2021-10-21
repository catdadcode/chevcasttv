import client from "./client";
import config from "config";
import initAccounts, { AccountRepository } from "./repositories/accounts";

const { DATABASE_NAME } = config;

type Repositories = {
  accounts: AccountRepository;
};

const repositories: Partial<Repositories> = {};

export const initialize = async () => {
  await client.connect();
  const db = client.db(DATABASE_NAME);
  repositories.accounts = initAccounts(db);
};

export default repositories as Repositories;