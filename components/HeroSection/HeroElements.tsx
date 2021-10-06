import React, { FC } from "react";
import { Box } from "components";
import { styled } from "@mui/material/styles";

export const HeroContainer: FC = ({children}) => <Box
  sx={{
    background: "#0c0c0c",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "0 30px",
    height: "800px",
    position: "relative",
    zIndex: 1
  }}
>{children}</Box>;

export const HeroBg: FC = ({children}) => <Box
  sx={{
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    width: "100%",
    height: "100%",
    overflow: "hidden"
  }}
>{children}</Box>;

export const VideoBg = styled("video")({
  width: "100%",
  height: "100%",
  objectFit: "cover",
  background: "#232a34"
});