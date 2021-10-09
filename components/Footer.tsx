import React from "react";
import { Box, Divider, Link } from "components";

const Footer = () => {
  return(<>
    <Divider />
    <footer>
      <Box sx={{
        textAlign: "center",
        padding: "3rem",
        color: theme => theme.palette.text.disabled
      }}>
        Powered by <Link href="https://chevtek.io">Chevtek</Link>
      </Box>
    </footer>
  </>);
};

export default Footer;