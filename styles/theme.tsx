import React, { FC } from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";

const Provider: FC = ({ children }) => {
  const defaultTheme = createTheme();

  const theme = createTheme({
    palette: {
      mode: "dark"//darkMode ? "dark" : "light"
    }
  });

  // if (darkMode) {
  //   theme.palette.primary.main = defaultTheme.palette.success.light;
  //   theme.palette.success.main = defaultTheme.palette.primary.light;
  // }

  return (
    <ThemeProvider theme={theme}>
      {children}
    </ThemeProvider>
  );
};

export default Provider;