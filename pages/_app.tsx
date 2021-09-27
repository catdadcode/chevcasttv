import "../styles/globals.css"
import type { AppProps } from "next/app";
import Head from "next/head";
import { SessionProvider } from "next-auth/react";
import { Layout } from "components";

const App = ({
  Component,
  pageProps: { session, ...pageProps }
}: AppProps) => (
  <SessionProvider session={session}>
    <Head>
      <title>ChevCast.tv</title>
      <meta name="description" content="ChevCast Community" />
      <link rel="icon" href="/favicon.ico" />
    </Head>
    <Layout>
      <Component {...pageProps} />
    </Layout>
  </SessionProvider>
)
export default App
