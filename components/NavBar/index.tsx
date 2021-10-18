import React, { useRef } from "react";
import { useSession, signIn } from "next-auth/react";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useAppState } from "hooks/useAppState";
import {
  AppBar,
  Avatar,
  Box,
  Button,
  DiscordIcon,
  DrawerNav,
  IconButton,
  // LoginIcon,
  MenuIcon,
  TabNav,
  Toolbar,
  Typography,
  UserMenu
} from "components";

const NavBar = () => {
  const { dispatch } = useAppState();
  const { data } = useSession();
  const theme = useTheme();
  const smDownBreakpoint = useMediaQuery(theme.breakpoints.down("sm"));
  const $userMenuAnchor = useRef<HTMLButtonElement>(null);

  const user = data?.user;

  return (
    <>
      <AppBar position="static">
        <Toolbar>

          { smDownBreakpoint &&
            <>
              <IconButton
                size="large"
                color="success"
                onClick={() => dispatch("OPEN_NAV_DRAWER")}
              >
                <MenuIcon sx={{
                  color: theme => theme.palette.primary.main,
                  fontSize: "2.5rem"
                }} />
              </IconButton>
              <DrawerNav />
            </>
          }

          { !smDownBreakpoint && <TabNav /> }

          <Box sx={{ flexGrow: 1 }} />

          <Box>
            { user &&
              <>
                <Button
                  variant="outlined"
                  color="primary"
                  sx={{
                    border: "none"
                  }}
                  ref={$userMenuAnchor}
                  onClick={() => dispatch("TOGGLE_USER_MENU")}
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
                </Button>
                <UserMenu $menuAnchor={$userMenuAnchor} />
              </>
            }
            { !user &&
              <Button
                variant="contained"
                size="large"
                startIcon={<DiscordIcon />}
                onClick={() => signIn("discord")}
              >Sign In</Button>
            }
          </Box>

        </Toolbar>
      </AppBar>
    </>
  )
};

export default NavBar;