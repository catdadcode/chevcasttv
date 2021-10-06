import React from "react";
import { HeroContainer, HeroBg, VideoBg } from "./HeroElements";

const HeroSection = () => (
  <HeroContainer>
    <HeroBg>
      <VideoBg autoPlay loop muted src={"/video/home-bg.mp4"} />
    </HeroBg>
  </HeroContainer>
);

export default HeroSection;