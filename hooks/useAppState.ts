import createStateContainer from "@chevtek/react-state-container";
import React, { ReactNode } from "react";
import type { JwtPayload } from "types/JwtPayload";

type State = {
  navDrawerOpen: boolean;
  userMenuOpen: boolean;
  user?: JwtPayload;
  dialogs: {
    login: boolean;
    error?: {
      type: "Custom",
      title: string,
      description: string,
      content?: ReactNode
    } | {
      type: "NotAuthorized",
      title?: string,
      description?: string,
      content?: ReactNode
    };
  }
}

export const [
  AppStateProvider,
  useAppState
] = createStateContainer("AppState")
  .setState({
    navDrawerOpen: false,
    userMenuOpen: false,
    dialogs: {
      login: false
    }
  } as State)
  .setActions({

    SET_USER: (state, user: State["user"]) => {
      state.user = user;
    },

    DELETE_USER: state => {
      state.user = undefined;
    },

    OPEN_ERROR: (state, data: State["dialogs"]["error"]) => {
      state.dialogs.error = data;
    },

    OPEN_LOGIN: state => {
      state.dialogs.login = true;
    },

    OPEN_NAV_DRAWER: state => {
      state.navDrawerOpen = true;
    },

    CLOSE_ERROR: state => {
      delete state.dialogs.error;
    },

    CLOSE_LOGIN: state => {
      state.dialogs.login = false;
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