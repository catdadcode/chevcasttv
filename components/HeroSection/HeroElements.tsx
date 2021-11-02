import React, { FC, ReactNode } from "react";
import { Box } from "components";
import { styled, Theme } from "@mui/material/styles";
import { SxProps } from "@mui/system";

type Props = {
  children: React.ReactNode;
  sx?: SxProps<Theme>;
}

export const HeroContainer: FC<Props> = ({children, sx}) => {
  return (<Box
    sx={Object.assign({
      background: "#0c0c0c",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      padding: "0 30px",
      position: "relative",
      zIndex: 1,
      overflow: "hidden"
    }, sx)}
  >{children}</Box>);
}

export const HeroContent: FC<Props> = ({children, sx}) => <Box
  sx={Object.assign({
    position: "absolute",
    width: "100%",
    height: "100%",
    overflow: "auto",
  }, sx)}
>{children}</Box>;

export const HeroOverlay: FC = ({children}) => <Box sx={{
  position: "absolute",
  width: "100%",
  height: "100%",
  backgroundColor: "#000",
  opacity: 0.5
}}>{children}</Box>;

export const HeroBg: FC = ({children}) => <Box
  sx={{
    position: "absolute",
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