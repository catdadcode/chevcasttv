import React, { FC } from "react";
import { useTheme, styled, Theme } from "@mui/material/styles";
import { SxProps } from "@mui/system";

type Props = {
  color?: string;
  sx?: SxProps<Theme>
};

const Facebook: FC<Props> = ({ color, sx = { height: 100, width: 100 } }) => { 
  const theme = useTheme();
  if (!color) color = theme.palette.text.primary;
  const Svg = styled("svg")(null);
  return (
    <Svg sx={sx} version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
      viewBox="0 0 512 512" xmlSpace="preserve">
    <g>
      <path fill={color} d="M360.7,284.1l12.5-81.4h-78.1v-52.8c0-22.3,10.9-44,45.9-44h35.5V36.5c0,0-32.2-5.5-63.1-5.5C249.1,31,207,70,207,140.6
        v62.1h-71.5v81.4H207V481h88V284.1H360.7z"/>
    </g>
    </Svg>
  );
};

export default Facebook;