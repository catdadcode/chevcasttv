import React from "react";
import { useRouter } from "next/router";
import {
  Drawer,
  List,
  ListItem,
  ListItemText
} from "components";
import { useAppState } from "hooks/useAppState";

const DrawerNav = () => {
  const router = useRouter();
  const { state: { navDrawerOpen }, dispatch } = useAppState();

  const navigate = (page: string) => {
    dispatch("CLOSE_NAV_DRAWER");
    router.push(page);
  }

  return (
    <Drawer anchor="left" open={navDrawerOpen} onClose={() => dispatch("CLOSE_NAV_DRAWER")}>
      <List>
        <ListItem
          button
          disabled={router.pathname === "/"}
          onClick={() => navigate("/")}
        >
          <ListItemText primary="Home" /> 
        </ListItem>
        <ListItem
          button
          disabled={router.pathname === "/chevbot"}
          onClick={() => navigate("/chevbot")}
        >
          <ListItemText primary="Chevbot" /> 
        </ListItem>
        <ListItem
          button
          disabled={router.pathname === "/videos"}
          onClick={() => navigate("/videos")}
        >
          <ListItemText primary="Videos" /> 
        </ListItem>
      </List>
    </Drawer>
  );
};

export default DrawerNav;