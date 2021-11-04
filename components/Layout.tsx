import { FC, ReactNode, useEffect } from "react";
import { Box, Footer, Grid, NavBar } from "components";
import { useAppState } from "hooks/useAppState";
import axios from "axios";

type Props = {
  children?: ReactNode
}

const Layout: FC<Props> = ({ children }) => {
  const { dispatch } = useAppState();

  // Check for user and set if exists.
  useEffect(() => {
    (async () => {
      type Data = {
        avatar: string,
        email: string,
        username: string
      } | false;
      const { data } = await axios.get<Data>("/api/auth/session");
      if (!data) {
        dispatch("DELETE_USER");
        return;
      }
      dispatch("SET_USER", data);
    })().catch(console.log);
  }, []);

  return (
    <Box sx={{
      backgroundColor: theme => theme.palette.background.default,
      color: theme => theme.palette.getContrastText(theme.palette.background.default)
    }}>
      <Grid container >
        <Grid item xs={12}>
          <NavBar />
        </Grid>
        <Grid item xs={12}>
          <main>{children}</main>
        </Grid>
        <Grid item xs={12}>
          <Footer />
        </Grid>
      </Grid>
    </Box>
  );
};

export default Layout;