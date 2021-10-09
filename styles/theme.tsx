import React, { FC } from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useSettings } from "hooks/useSettings";

const Provider: FC = ({ children }) => {
  const { state: { darkMode } } = useSettings();

  const defaultTheme = createTheme();

  const theme = createTheme({
    palette: {
      mode: darkMode ? "dark" : "light"
    }
  });

  if (darkMode) {
    theme.palette.primary.main = defaultTheme.palette.success.light;
    theme.palette.success.main = defaultTheme.palette.primary.light;
  }

  return (
    <ThemeProvider theme={theme}>
      {children}
    </ThemeProvider>
  );
};

export default Provider;