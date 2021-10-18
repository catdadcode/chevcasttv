import type { NextPage } from 'next'
import { useSession } from "next-auth/react";
import { Error } from "components";

const Settings: NextPage = () => {
  const { data } = useSession();
  const user = data?.user;

  if (!user) return <Error type="NotAuthorized" />;

  return (
    <h1>Settings!</h1>
  );
}

export default Settings;