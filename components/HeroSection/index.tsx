import React from "react";
import {
  HeroBg,
  HeroContainer,
  HeroContent,
  HeroOverlay,
  VideoBg
} from "./HeroElements";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { NeonControllerIcon, Typography } from "..";

const HeroSection = () => {
  const theme = useTheme();
  const smDownBreakpoint = useMediaQuery(theme.breakpoints.down("sm"));
  return (
    <HeroContainer>
      <HeroBg>
        <VideoBg autoPlay loop muted src={"/video/home-bg2.mp4"} />
      </HeroBg>
      <HeroOverlay />
      <HeroContent sx={{
        animation: "5s infinite alternate wobble ease-in-out",
        textAlign: "center",
        flexDirection: "column",
      }}>
        <Typography variant="h4" sx={{
          color: theme => theme.palette.success.light,
          fontFamily: "neon",
          textShadow: theme => `3px 3px 5px ${theme.palette.success.light}`,
          mb: -15,
          mt: 10
        }}>Welcome To</Typography>
        <Typography variant={smDownBreakpoint ? "h2" : "h1"} sx={{
          color: "#CCFCD6",
          fontFamily: "neon",
          textShadow: theme => `3px 3px 7px ${theme.palette.success.light}`,
          mb: -10,
          mt: 15,
        }}>ChevCast.TV</Typography>
        <NeonControllerIcon backgroundOn />
      </HeroContent>
    </HeroContainer>
  );
};

export default HeroSection;