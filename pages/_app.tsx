import "styles/globals.css";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import Head from "next/head";
import { Layout } from "components";
import ThemeProvider from "styles/theme";
import { AppStateProvider } from "hooks/useAppState";

const App = ({
  Component,
  pageProps
}: AppProps) => {
  const router = useRouter();
  const renderLayout = !router.route.includes("browser-sources");

  return(
      <AppStateProvider>
        <ThemeProvider>
          <Head>
            <title>ChevCast.tv</title>
            <meta name="description" content="ChevCast Community" />
            <link rel="icon" href="/favicon.ico" />
          </Head>
          { renderLayout ? <Layout>
            <Component {...pageProps} />
          </Layout> : <Component {...pageProps} /> }
        </ThemeProvider>
      </AppStateProvider>
  );
};
export default App
