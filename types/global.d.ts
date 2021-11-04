import { Mongoose, Model } from "mongoose";
declare global {
  var mongoose: Mongoose;
  var userModel: Model;
}

declare module '@mui/material/styles' {
  interface Theme {
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            // apply theme's border-radius instead of component's default
            backGroundColor: string
          },
        },
      },
    }
  }
  // allow configuration using `createTheme`
  interface ThemeOptions {
    components?: {
      MuiButton?: {
        styleOverrides?: {
          root?: {
            // apply theme's border-radius instead of component's default
            backGroundColor?: string
          },
        },
      },
    }
  }
}