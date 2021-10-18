import "styles/globals.css";
import type { AppProps } from "next/app";
import Head from "next/head";
import { SessionProvider } from "next-auth/react";
import { Layout } from "components";
import ThemeProvider from "styles/theme";
import { AppStateProvider } from "hooks/useAppState";

const App = ({
  Component,
  pageProps: { session, ...pageProps }
}: AppProps) => {
  return(
    <SessionProvider session={session}>
      <AppStateProvider>
        <ThemeProvider>
          <Head>
            <title>ChevCast.tv</title>
            <meta name="description" content="ChevCast Community" />
            <link rel="icon" href="/favicon.ico" />
          </Head>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </ThemeProvider>
      </AppStateProvider>
    </SessionProvider>
  );
};
export default App
