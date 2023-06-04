import { useEffect, useState } from 'react';
import Head from 'next/head';
import Footer from '../components/Footer';
import Header from '../components/Header';
import Button from '../components/Button';
import GameBoard from '../components/GameBoard';
import { tileData } from '../scripts/scrabbledata';
import { randomInt } from '../scripts/util';
import Rack from '../components/Rack';

export default function Home() {
  const [loaded, setLoaded] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [bag, setBag] = useState([]);
  const [playerRack, setPlayerRack] = useState([]);
  const [opponentRack, setOpponentRack] = useState([]);

  function createBag() {
    const nextBag = [];
    for (const letter in tileData) {
      let tileQuantity = tileData[letter].quantity;
      for (let i = 0; i < tileQuantity; i++) {
        nextBag.push({
          letter: letter.toUpperCase(),
          value: tileData[letter].value,
          id: crypto.randomUUID() || `${letter}-${i}`,
        });
      }
    }
    console.warn('created bag!', nextBag)
    setBag(nextBag);
    return nextBag;
  }

  function getRandomLetters(nextBag, amount) {
    const letterArray = [];
    for (let i = 0; i < amount; i++) {
      letterArray.push(nextBag.splice(randomInt(0, nextBag.length - 1), 1)[0]);
    }
    setBag(nextBag);
    return letterArray;
  }

  useEffect(() => {
    if (!loaded) {
      document.documentElement.style.setProperty('--actual-height', window.innerHeight + 'px');
      setLoaded(true);
    }
  }, [loaded]);

  function startGame() {
    setGameStarted(true);
    const nextBag = createBag();
    const playerOpeningLetters = getRandomLetters(nextBag, 7);
    const opponentOpeningLetters = getRandomLetters(nextBag, 7);
    console.log('player opening letters:', playerOpeningLetters);
    console.log('opponent opening letters:', opponentOpeningLetters);
    setPlayerRack(playerOpeningLetters);
    setOpponentRack(opponentOpeningLetters);
  }

  return (
    <div>
      <Head>
        <title>Phoenetic Scrabble</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <Header />
        <div id='home-body'>
          {gameStarted ?
            <>
              
              <Rack tiles={opponentRack} />
              <GameBoard />
              <Rack tiles={playerRack} />
            </>
            :
            <Button label='START' clickAction={startGame} />
          }
        </div>
        <Footer bag />
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
          justify-content: space-evenly;
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
