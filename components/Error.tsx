import React, { ReactNode, FC } from "react";
import { useRouter } from "next/router";
import {
  Box,
  Button,
  DiscordIcon,
  Typography 
} from "components";
import { useTheme } from "@mui/material/styles";

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

const Error: FC<Props> = (props) => {
  const router = useRouter();
  const { type } = props;

  let title, description, content;

  switch (type) {
    case "NotAuthorized":
      title = props.title ?? "Not Authorized";
      description = props.description ?? "You must sign in first."
      content = props.children ?? (
        <Button
          variant="contained"
          size="large"
          startIcon={<DiscordIcon color="#333" sx={{ width: 35, height: 35 }} />}
          onClick={() => window.location.assign("/api/auth/login")}
        >Sign In</Button>
      );
      break;
    case "Custom":
      title = props.title;
      description = props.description;
      content = props.children;
  }

  return (
    <Box sx={{
      display: "flex",
      flexDirection: "column",
      p: 1,
      mb: 3,
      alignItems: "center",
      justifyContent: "center"
    }}>
      <Typography
        variant="h3"
        sx={{
          color: theme => theme.palette.error.dark,
          mb: 2
        }}
      >
        {title}
      </Typography>
      <Typography
        variant="h6"
        sx={{
          color: theme => theme.palette.text.secondary,
          mb: 3
        }}
      >
        {description}
      </Typography>
      {content}
    </Box>
  );
};

export default Error;