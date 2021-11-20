
import React from "react";
import { useAppState } from "hooks/useAppState";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DiscordIcon,
  List,
  ListItem,
  TwitchIcon,
  Typography
} from "components";
import { useTheme } from "@mui/material/styles";

const Login = () => {
  const { state, dispatch } = useAppState();
  const { dialogs } = state;
  const theme = useTheme();

  return (
    <Dialog onClose={() => dispatch("CLOSE_LOGIN")} open={dialogs.login}>
      <DialogTitle sx={{textAlign: "center", color: "text.secondary"}}>Login With</DialogTitle>
      <List sx={{ pt: 0 }}>
        <ListItem>
          <Button
            variant="contained"
            startIcon={<DiscordIcon sx={{ width: 25, height: 25 }} color={theme.palette.text.primary} />}
            onClick={() => window.location.assign("/api/auth/discord-login")}
            sx={{
              width: 300,
              backgroundColor: "#5865F2",
              color: "text.primary",
              "&:hover": {
                backgroundColor: "#727df2"
              }
            }}
          >
            <Typography variant="h6" sx={{
            }}>Discord</Typography>
          </Button>
        </ListItem>
        <ListItem>
          <Button
            variant="contained"
            startIcon={<TwitchIcon sx={{ width: 25, height: 25 }} color={theme.palette.text.primary} />}
            onClick={() => window.location.assign("/api/auth/twitch-login")}
            sx={{
              width: 300,
              backgroundColor: "#6441a5",
              color: "text.primary",
              "&:hover": {
                backgroundColor: "#7b5fc2"
              }
            }}
          >
            <Typography variant="h6" sx={{
            }}>Twitch</Typography>
          </Button>
        </ListItem>
      </List>
    </Dialog>
  )
};

export default Login;