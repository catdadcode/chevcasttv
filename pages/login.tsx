import { NextPage } from "next";
import { Avatar, Button, LoginIcon, LogoutIcon } from "components";
import styles from "../styles/Home.module.css";
import { useSession, signIn, signOut } from "next-auth/react";

const Login: NextPage = () => {
  const { data } = useSession();
  const user = data?.user;
  const authClick = () => user ? signOut() : signIn("discord");

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        { user && user.image && <Avatar variant="rounded" src={user.image} sx={{ height: "100px", width: "100px" }} />}
        <br />
        <Button
          variant="contained"
          size="large"
          startIcon={
            user && <LogoutIcon />
          }
          endIcon={
            !user && <LoginIcon />
          }
          onClick={authClick}
        >
          { user ? "Sign Out" : "Sign In" }
        </Button>
      </main>
    </div>
  );
};

export default Login;