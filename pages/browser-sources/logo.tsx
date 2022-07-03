import type { NextPage } from 'next';
import {
  Box,
  NeonControllerIcon,
  Typography
} from "components";

const Logo: NextPage = () => {
  return (
    <>
      <Box sx={{
        animation: "1s winkOn, 5s infinite alternate wobble ease-in-out",
        // transformOrigin: "top center",
        // border: "solid 3px #80F982",
        // backgroundColor: "rgba(161, 244, 139, 0.1)",
        // borderRadius: "50rem",
        padding: 3,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column"
      }}>
        <Typography variant="h4" sx={{
          // animation: "2s infinite flicker",
          color: theme => theme.palette.success.light,
          fontFamily: "neon",
          textShadow: theme => `3px 3px 5px ${theme.palette.success.light}`
        }}>Welcome To</Typography>
        <Typography variant="h1" sx={{
          animation: "20s infinite flicker",
          color: "#CCFCD6",
          fontFamily: "neon",
          textShadow: theme => `3px 3px 7px ${theme.palette.success.light}`
        }}>ChevCast<span style={{animation: "5.9s infinite flicker"}}>.TV</span></Typography>
        <NeonControllerIcon backgroundOn sx={{
          // animation: "2s winkOn, 7.5s infinite flicker",
          mt: -35,
          width: 1000,
          height: 1000
        }}/>
      </Box>
    </>
  );
}

export default Logo
