import React, { useState } from "react";
import ReactPlayer from "react-player";
import {
  HeroBg,
  HeroContainer,
  HeroContent,
  HeroOverlay,
  VideoBg
} from "./HeroElements";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import {
  Box,
  DiscordIcon,
  FacebookIcon,
  IconButton,
  NeonControllerIcon,
  TwitchIcon,
  TwitterIcon,
  Typography,
  YouTubeIcon
} from "..";

const CHEVCAST_DISCORD = process?.env.NEXT_PUBLIC_CHEVCAST_DISCORD?.toString() ?? "";
const CHEVCAST_TWITCH = process?.env.NEXT_PUBLIC_CHEVCAST_TWITCH?.toString() ?? "";
const CHEVCAST_YOUTUBE = process?.env.NEXT_PUBLIC_CHEVCAST_YOUTUBE?.toString() ?? "";
const CHEVCAST_FACEBOOK = process?.env.NEXT_PUBLIC_CHEVCAST_FACEBOOK?.toString() ?? "";
const CHEVCAST_TWITTER = process?.env.NEXT_PUBLIC_CHEVCAST_TWITTER?.toString() ?? "";

const HeroSection = () => {
  const theme = useTheme();
  const smallScreen = useMediaQuery(theme.breakpoints.down("lg"));
  const largeScreen = useMediaQuery(theme.breakpoints.up("xl"));
  const [showPlayer, setShowPlayer] = useState(false);
  const socialMediaIconStyles = {
    [theme.breakpoints.up("lg")]: {
      height: 150,
      width: 150
    },
    [theme.breakpoints.down("lg")]: {
      height: 75,
      width: 75
    },
    [theme.breakpoints.down("sm")]: {
      height: 50,
      width: 50
    }
  };
  const iconHover = {
    "&:hover": {
      animation: "1.5s infinite alternate scale ease-in-out"
    }
  };

  return (
    <HeroContainer sx={{
      height: "calc(100vh - 225px)"
    }}>
      <HeroBg>
        <VideoBg autoPlay loop muted playsInline src={"/video/home-bg2.mp4"} />
      </HeroBg>
      <HeroOverlay />
      <HeroContent sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-evenly",
        justifyItems: "center",
        flexDirection: "column",
        overflow: "hidden"
      }}>
        { !showPlayer && <Box sx={{
          animation: "1s winkOn, 5s infinite alternate wobble ease-in-out",
          // transformOrigin: "top center",
          // border: "solid 3px #80F982",
          // backgroundColor: "rgba(161, 244, 139, 0.1)",
          // borderRadius: "50rem",
          // padding: 3,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          [theme.breakpoints.up("md")]: {
            mt: 5
          },
          [theme.breakpoints.down("md")]: {
            mt: 3
          }
        }}>
          <Typography variant="h4" sx={{
            // animation: "2s infinite flicker",
            color: theme => theme.palette.success.light,
            fontFamily: "neon",
            textShadow: theme => `3px 3px 5px ${theme.palette.success.light}`
          }}>Welcome To</Typography>
          <Typography variant={smallScreen ? "h2" : "h1"} sx={{
            animation: "20s infinite flicker",
            color: "#CCFCD6",
            fontFamily: "neon",
            textShadow: theme => `3px 3px 7px ${theme.palette.success.light}`
          }}>ChevCast<span style={{animation: "5.9s infinite flicker"}}>.TV</span></Typography>
          <NeonControllerIcon backgroundOn sx={{
            // animation: "2s winkOn, 7.5s infinite flicker",
            [theme.breakpoints.up("lg")]: {
              mt: -30,
              mb: -25,
              height: 800,
              width: 800
            },
            [theme.breakpoints.down("lg")]: {
              mt: -15,
              mb: -15,
              height: 500,
              width: 500
            }
          }}/>
        </Box> }

        <Box sx={{
          display: showPlayer ? "block" : "none",
          position: "relative",
          width: smallScreen ? "100%" : largeScreen ? "45%" : "75%",
          borderRadius: 5,
          border: "solid 2px #A1F48B",
          overflow: "hidden",
          pt: `calc(1080 / 1920 * ${smallScreen ? "100%" : largeScreen ? "45%" : "75%"})`
        }}>
          <ReactPlayer
            style={{
              position: "absolute",
              top: 0,
              left: 0
            }}
            url="https://twitch.tv/ChevCast"
            playing={true}
            width="100%"
            height="100%"
            onStart={() => setShowPlayer(true)}
            onEnded={() => setShowPlayer(false)}
            config={{
              twitch: {
                options: {
                  parent: ["chevcast.tv"]
                }
              }
            }}
          />
        </Box>

        <Box>
          <IconButton sx={iconHover} href={CHEVCAST_TWITCH} size="large">
            <TwitchIcon color="#80F982" sx={socialMediaIconStyles} />
          </IconButton>
          <IconButton sx={iconHover} href={CHEVCAST_YOUTUBE} size="large">
            <YouTubeIcon color="#80F982" sx={socialMediaIconStyles} />
          </IconButton>
          <IconButton sx={iconHover} href={CHEVCAST_DISCORD} size="large">
            <DiscordIcon color="#80F982" sx={socialMediaIconStyles} />
          </IconButton>
          <IconButton sx={iconHover} href={CHEVCAST_TWITTER} size="large">
            <TwitterIcon color="#80F982" sx={socialMediaIconStyles} />
          </IconButton>
          <IconButton sx={iconHover} href={CHEVCAST_FACEBOOK} size="large">
            <FacebookIcon color="#80F982" sx={socialMediaIconStyles} />
          </IconButton>
        </Box>
      </HeroContent>
    </HeroContainer>
  );
};

export default HeroSection;