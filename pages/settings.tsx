import type { NextPage } from "next"
import { Error } from "components";
import { useAppState } from "hooks/useAppState";

const Settings: NextPage = () => {
  const { state: { user } } = useAppState();

  if (!user) return <Error type="NotAuthorized" />;

  return (
    <h1>Settings!</h1>
  );
}

export default Settings;