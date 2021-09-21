import type { NextPage } from 'next'
import Head from 'next/head'
import styles from '../styles/Home.module.css'

const About: NextPage = () => {
  return (
    <div className={styles.container}>
      <Head>
        <title>ChevCast.tv</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <h1>About Page!</h1>
      </main>
    </div>
  );
};

export default About;