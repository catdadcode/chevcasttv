import { FC, ReactNode } from "react";
import { Grid, Link } from "components";

type props = {
  children?: ReactNode
}

const Layout: FC<props> = ({ children }) => (
  <Grid container>
    <Grid item xs={12}>
      Toolbar
    </Grid>
    <Grid item xs={12}>
      <main>{children}</main>
    </Grid>
    <Grid item xs={12}>
      <footer style={{textAlign: "center"}}>
        Powered by <Link href="https://chevtek.io">Chevtek</Link>
      </footer>
    </Grid>
  </Grid>
);

export default Layout;