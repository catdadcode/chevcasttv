import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'

const Home: NextPage = () => {
  return (
    <div className={styles.container}>
      <Head>
        <title>ChevCast.tv</title>
        <meta name="description" content="ChevCast Community" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Welcome to ChevCast.tv!
        </h1>

        <p className={styles.description}>
          <h3>Pardon our dust.</h3>
          <p>We are working hard to bring you a brand new ChevCast Community experience!</p>
        </p>

        <div className={styles.grid}>
        </div>

      </main>

      <footer className={styles.footer}>
        <a href="https://chevtek.io">Powered by Chevtek</a>
      </footer>
    </div>
  )
}

export default Home
