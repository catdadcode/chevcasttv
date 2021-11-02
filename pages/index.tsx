import type { NextPage } from 'next'
import { useTheme } from "@mui/material/styles";
import { HeroSection } from "components";

const Home: NextPage = () => {
  const theme = useTheme();

  return (
    <>
      <HeroSection />
    </>
  );
}

export default Home
