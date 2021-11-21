import type { NextPage } from "next"
import { useRouter } from "next/router";
import { useTheme } from "@mui/material/styles";
import {
  Box,
  Button,
  Card,
  Divider,
  HeroSection,
  Typography
} from "components";

const Home: NextPage = () => {
  const theme = useTheme();
  const router = useRouter();

  return (
    <>
      <HeroSection />
      <Card sx={{
        p: 2,
        m: "auto",
        mt: 2,
        mb: 2,
        width: 500
      }}>
        <Typography variant="h3" sx={{
          textAlign: "center",
          fontFamily: "neon",
          color: "info.light"
        }}>Pass The Stream Event!</Typography>
        <Divider />
        <Typography variant="body1" sx={{
          m: 2
        }}>
          ChevCast is sponsoring a Pass The Stream event! We're blocking out a 24 hour period and allowing streamers of all stripes to register to participate. 
        </Typography>
        <Divider />
        <Box sx={{ textAlign: "center" }}>
          <Button
            variant="outlined"
            size="large"
            onClick={() => router.push("/pass-the-stream")}
            sx={{
              mt: 2
            }}
          >Register Now!</Button>
        </Box>
      </Card>
    </>
  );
}

export default Home
