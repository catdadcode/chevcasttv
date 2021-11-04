import React, { FC, RefObject } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import {
  ListItemIcon,
  LogoutIcon,
  Menu,
  MenuItem,
  SettingsIcon
} from "components";
import { useAppState } from "hooks/useAppState";

type Props = {
  $menuAnchor: RefObject<HTMLElement>
};

const UserMenu: FC<Props> = ({ $menuAnchor }) => {
  const router = useRouter();
  const { state: { userMenuOpen }, dispatch } = useAppState();

  const logout = () => {
    (async () => {
      await axios.post("/api/auth/logout");
      dispatch("DELETE_USER");
    })().catch(console.log);
  }

  return (
    <Menu
      anchorEl={$menuAnchor.current}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "right",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      open={userMenuOpen}
      onClose={() => dispatch("CLOSE_USER_MENU")}
      onClick={() => dispatch("CLOSE_USER_MENU")}
    >
      <MenuItem onClick={() => router.push("/settings")}>
        <ListItemIcon>
          <SettingsIcon fontSize="small" />
        </ListItemIcon>
        Settings
      </MenuItem>
      <MenuItem onClick={logout}>
        <ListItemIcon>
          <LogoutIcon fontSize="small" />
        </ListItemIcon>
        Sign Out
      </MenuItem>
    </Menu>
  );
};

export default UserMenu;