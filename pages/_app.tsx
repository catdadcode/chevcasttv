import "styles/globals.css";
import type { AppProps } from "next/app";
import Head from "next/head";
import { SessionProvider } from "next-auth/react";
import { Layout } from "components";
import { ThemeProvider } from "@mui/material/styles";
import theme from "styles/theme";

const App = ({
  Component,
  pageProps: { session, ...pageProps }
}: AppProps) => {
  return(
    <SessionProvider session={session}>
      <ThemeProvider theme={theme}>
        <Head>
          <title>ChevCast.tv</title>
          <meta name="description" content="ChevCast Community" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </ThemeProvider>
    </SessionProvider>
  );
};
export default App
