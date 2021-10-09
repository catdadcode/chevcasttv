import createStateContainer from "@chevtek/react-state-container";

export const [
  SettingsProvider,
  useSettings
] = createStateContainer("Settings")
  .setState({
    darkMode: true
  })
  .setActions({

    SET_DARK_MODE: (state, darkMode: boolean) => {
      state.darkMode = darkMode;
    }

  })
  .build();