import createStateContainer from "@chevtek/react-state-container";

type State = {
  navDrawerOpen: boolean;
  userMenuOpen: boolean;
  user?: {
    avatar: string;
    email: string;
    username: string;
  };
}

export const [
  AppStateProvider,
  useAppState
] = createStateContainer("AppState")
  .setState({
    navDrawerOpen: false,
    userMenuOpen: false
  } as State)
  .setActions({

    SET_USER: (state, user: State["user"]) => {
      state.user = user;
    },

    DELETE_USER: state => {
      state.user = undefined;
    },

    OPEN_NAV_DRAWER: state => {
      state.navDrawerOpen = true;
    },

    CLOSE_NAV_DRAWER: state => {
      state.navDrawerOpen = false;
    },

    TOGGLE_USER_MENU: state => {
      state.userMenuOpen = !state.userMenuOpen;
    },
    CLOSE_USER_MENU: state => {
      state.userMenuOpen = false;
    }

  })
  .build();