import { useEffect, useState } from 'react';
import Head from 'next/head';
import Footer from '../components/Footer';
import Header from '../components/Header';
import Button from '../components/Button';
import GameBoard from '../components/GameBoard';

export default function Home() {
  const [loaded, setLoaded] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  useEffect(() => {
    if (!loaded) {
      document.documentElement.style.setProperty('--actual-height', window.innerHeight + 'px');
      setLoaded(true);
    }
  }, [loaded]);

  return (
    <div>
      <Head>
        <title>Phoenetic Scrabble</title>
        <link rel="icon" href="/favicon.ico" />
        <link href="https://www.dafontfree.net/embed/aW50ZXJzdGF0ZS1ib2xkJmRhdGEvMjUvaS8xMjk5NjUvSW50ZXJzdGF0ZS1Cb2xkLnR0Zg" rel="stylesheet" type="text/css"/>
      </Head>

      <main>
        <Header />
        <div id='home-body'>
          {gameStarted ?
            <GameBoard />
            :
            <Button label='START' clickAction={() => setGameStarted(true)} />
          }
        </div>
        <Footer />
      </main>

      <style jsx>{`
        main {
          background-color: var(--main-bg-color);
          height: var(--actual-height);
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          align-items: center;
        }
        #home-body {
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
      `}</style>

      <style jsx global>{`
        :root {
          --actual-height: 100vh;
          --board-size: calc(100vw - 1.5rem);
          --board-outline-size: calc(var(--board-size) / 160);
          --header-height: 3rem;
          --footer-height: 3rem;
          --button-height: 4rem;
          --main-bg-color: #555;
          --secondary-bg-color: #333;
          --main-text-color: #aba;
          --secondary-text-color: #ccc;
          --board-color: #ccc2a1;
          --tile-color: #ffddd0;
        }
        html,
        body {
          padding: 0;
          margin: 0;
          // font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
          //   Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue,
          //   sans-serif;
          font-family: 'interstate-bold', sans-serif;
          background-color: black;
          color: var(--main-text-color);
        }
        * {
          box-sizing: border-box;
        }
      `}</style>
    </div>
  );
}
