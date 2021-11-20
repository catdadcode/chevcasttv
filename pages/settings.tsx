import { useEffect } from "react";
import type { NextPage } from "next"
import { useAppState } from "hooks/useAppState";

const Settings: NextPage = () => {
  const { state: { user }, dispatch } = useAppState();

  useEffect(() => {
    if (!user) {
      dispatch("OPEN_ERROR", { type: "NotAuthorized" });
    }
  }, [user])

  return (
    <h1>Settings!</h1>
  );
}

export default Settings;