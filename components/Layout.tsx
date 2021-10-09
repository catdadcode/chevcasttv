import { FC, ReactNode } from "react";
import { Box, Footer, Grid, NavBar } from "components";

type props = {
  children?: ReactNode
}

const Layout: FC<props> = ({ children }) => (
  <Box sx={{
    backgroundColor: t => t.palette.background.default,
    color: t => t.palette.getContrastText(t.palette.background.default)
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

export default Layout;