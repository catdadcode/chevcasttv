import React, { useRef } from "react";
import { useRouter } from "next/router";
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
  MenuIcon,
  NeonControllerIcon,
  TabNav,
  Toolbar,
  Typography,
  UserMenu
} from "components";

const NavBar = () => {
  const { state: { user }, dispatch } = useAppState();
  const theme = useTheme();
  const router = useRouter();
  const smDownBreakpoint = useMediaQuery(theme.breakpoints.down("sm"));
  const $userMenuAnchor = useRef<HTMLButtonElement>(null);

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

          <IconButton
            size="large"
            color="success"
            onClick={() => router.push("/")}
            sx={{
              width: 100,
              mr: 3
            }}
          >
            <NeonControllerIcon />
          </IconButton>

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
                    src={user.avatar!}
                  />
                  <Typography variant="h6">{ user.username }</Typography>
                </Button>
                <UserMenu $menuAnchor={$userMenuAnchor} />
              </>
            }
            { !user &&
              <Button
                variant="contained"
                size="large"
                // startIcon={<DiscordIcon sx={{ width: 25, height: 25 }} color="#333" />}
                onClick={() => window.location.assign("/api/auth/login")}
              >Sign In</Button>
            }
          </Box>

        </Toolbar>
      </AppBar>
    </>
  )
};

export default NavBar;