import React, { useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useSettings } from "hooks/useSettings";
import {
  AppBar,
  Avatar,
  Box,
  Button,
  IconButton,
  LoginIcon,
  MenuIcon,
  TabNav,
  Toolbar,
  Typography,
  UserMenu
} from "components";

const NavBar = () => {
  const { data } = useSession();
  const theme = useTheme();
  const smDownBreakpoint = useMediaQuery(theme.breakpoints.down("sm"));
  const userMenuShowing = useState(false);
  const user = data?.user;

  return (
    <AppBar position="static">
      <Toolbar sx={{padding: 0}}>

        { smDownBreakpoint &&
          <IconButton size="large" color="success" >
            <MenuIcon sx={{
              color: theme => theme.palette.primary.main,
              fontSize: "2.5rem"
            }} />
          </IconButton>
        }

        { !smDownBreakpoint && <TabNav /> }

        <Box sx={{ flexGrow: 1 }} />

        <Box>
          { user &&
            <Button
              variant="outlined"
              color="primary"
              sx={{
                border: "none"
              }}
            >
              <Avatar
                sx={{
                  margin: "0 0.75rem 0 0",
                  height: "2.5rem",
                  width: "2.5rem",
                }}
                variant="circular"
                src={user.image!}
              />
              <Typography variant="h6">{ user.name }</Typography>
              {/* <UserMenu show={userMenuShowing} /> */}
            </Button>
          }
          { !user &&
            <Button
              variant="contained"
              size="large"
              startIcon={<LoginIcon />}
              onClick={() => signIn("discord")}
            >Sign In</Button>
          }
        </Box>

      </Toolbar>
    </AppBar>
  )
};

export default NavBar;