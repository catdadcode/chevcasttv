import { useState } from "react";
import type { NextPage } from 'next'
import ReactPlayer from "react-player";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { Box, HeroSection } from "components";

const Home: NextPage = () => {
  const theme = useTheme();
  const smallScreen = useMediaQuery(theme.breakpoints.down("lg"));
  const largeScreen = useMediaQuery(theme.breakpoints.up("xl"));
  const [showPlayer, setShowPlayer] = useState(false);

  return (
    <>
      { !showPlayer && <HeroSection /> }
      <Box sx={{
        display: showPlayer ? "box" : "none",
        position: "relative",
        width: smallScreen ? "100%" : largeScreen ? "50%" : "75%",
        pt: `calc(1080 / 1920 * ${smallScreen ? "100%" : largeScreen ? "50%" : "75%"})`,
        m: "auto"
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
    </>
  );
}

export default Home
