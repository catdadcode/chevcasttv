import React, { FC } from "react";
import { useRouter } from "next/router";
import { Tabs, Tab } from "components";

const TabNav: FC = () => {
  const router = useRouter();

  let tabValue;
  switch (router.pathname) {
    case "/":
    case "/chevbot":
    case "/videos":
      tabValue = router.pathname;
      break;
    default:
      tabValue = false;
      break;
  }

  return (
    <Tabs
      value={tabValue}
      onChange={(e, page) => router.push(page)}
    >
      <Tab value="/" label="Home" />
      <Tab value="/chevbot" label="Chevbot" />
      <Tab value="/videos" label="Videos" />
    </Tabs>
  );
}

export default TabNav;