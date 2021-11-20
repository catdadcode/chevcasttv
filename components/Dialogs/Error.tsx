import React, { ReactNode, FC } from "react";
import {
  Box,
  Button,
  Card,
  Dialog,
  DialogTitle,
  DiscordIcon,
  Typography 
} from "components";
import { useAppState } from "hooks/useAppState";

type Props = {
  type: "Custom",
  title: string,
  description: string,
  children?: ReactNode
} | {
  type: "NotAuthorized",
  title?: string,
  description?: string,
  children?: ReactNode
}

const ErrorDialog = () => {
  const { state, dispatch } = useAppState();
  if (!state.dialogs.error) return null;

  let {
    type,
    title,
    description,
    content
  } = state.dialogs.error;

  switch (type) {
    case "NotAuthorized":
      title = title ?? "Not Authorized";
      description = description ?? "You must sign in first."
      content = content ?? (
        <Button
          variant="contained"
          size="large"
          startIcon={<DiscordIcon color="#333" sx={{ width: 35, height: 35 }} />}
          onClick={() => {
            dispatch("CLOSE_ERROR");
            dispatch("OPEN_LOGIN");
          }}
          sx={{
            width: 200
          }}
        >Sign In</Button>
      );
      break;
    case "Custom":
      content = content ?? (
        <Button
          variant="contained"
          size="large"
          onClick={() => dispatch("CLOSE_ERROR")}
          sx={{
            width: 150
          }}
        >OK</Button>
      )
      break;
    default:
      throw new Error("Unrecognized error type");
  }

  return (
    <Dialog onClose={() => dispatch("CLOSE_ERROR")} open={true}>
      <Box sx={{
        display: "flex",
        flexDirection: "column",
        p: 1,
        mb: 3,
        alignItems: "center",
        justifyContent: "center"
      }}>
        <DialogTitle>
          <Typography
            variant="h4"
            sx={{
              color: theme => theme.palette.error.dark,
              mb: 2
            }}
          >
            {title}
          </Typography>
        </DialogTitle>
        <Card sx={{
          p: 2,
          mb: 2
        }}>
          <Typography
            variant="h6"
            sx={{
              color: theme => theme.palette.text.secondary,
              mb: 3,
              textAlign: "center"
            }}
          >
            {description}
          </Typography>
        </Card>
        {content}
      </Box>
    </Dialog>
  );
};

export default ErrorDialog;