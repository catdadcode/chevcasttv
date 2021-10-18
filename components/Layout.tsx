import { FC, ReactNode } from "react";
import { Box, Footer, Grid, NavBar } from "components";

type Props = {
  children?: ReactNode
}

const Layout: FC<Props> = ({ children }) => {
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