import React, { useState, FC } from "react";
import { Tabs, Tab } from "components";
import { SxProps } from "@mui/system";

type TabValue = "home" | "chevbot" | "videos";

const TabNav: FC = () => {
  const [tab, setTab] = useState<TabValue>("home");

  return (
    <Tabs
      value={tab}
      onChange={(e, value) => setTab(value)}
    >
      <Tab value="home" label="Home" />
      <Tab value="chevbot" label="Chevbot" />
      <Tab value="videos" label="Videos" />
    </Tabs>
  );
}

export default TabNav;