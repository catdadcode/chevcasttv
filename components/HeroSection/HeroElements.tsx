import React, { FC, ReactNode } from "react";
import { Box } from "components";
import { styled, Theme } from "@mui/material/styles";
import { SxProps } from "@mui/system";

export const HeroContainer: FC = ({children}) => <Box
  sx={{
    background: "#0c0c0c",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "0 30px",
    minHeight: "500px",
    position: "relative",
    zIndex: 1,
    overflow: "hidden"
  }}
>{children}</Box>;

type HeroContentProps = {
  children: React.ReactNode;
  sx?: SxProps<Theme>;
};

export const HeroContent: FC<HeroContentProps> = ({children, sx}) => <Box
  sx={Object.assign({
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
    overflow: "auto",
    display: "flex",
    justifyContent: "center"
  }, sx)}
>{children}</Box>;

export const HeroOverlay: FC = ({children}) => <Box sx={{
  position: "absolute",
  width: "100%",
  height: "100%",
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
  backgroundColor: "#000",
  opacity: 0.5
}}>{children}</Box>;

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