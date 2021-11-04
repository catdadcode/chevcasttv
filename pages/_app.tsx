import "styles/globals.css";
import type { AppProps } from "next/app";
import Head from "next/head";
import { Layout } from "components";
import ThemeProvider from "styles/theme";
import { AppStateProvider } from "hooks/useAppState";

const App = ({
  Component,
  pageProps
}: AppProps) => {
  return(
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
  );
};
export default App
