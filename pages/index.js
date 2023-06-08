import { useEffect, useState } from 'react';
import { db, auth, provider } from '../scripts/firebase';
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import Head from 'next/head';
import Footer from '../components/Footer';
import Header from '../components/Header';
import Button from '../components/Button';
import GameBoard from '../components/GameBoard';
import Rack from '../components/Rack';
import { tileData } from '../scripts/scrabbledata';
import { pause, randomInt } from '../scripts/util';
import LoginModal from '../components/LoginModal';

export default function Home() {
  const [loaded, setLoaded] = useState(false);
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [bag, setBag] = useState([]);
  const [playerRack, setPlayerRack] = useState([]);
  const [opponentRack, setOpponentRack] = useState([]);
  const [selectedTile, setSelectedTile] = useState(null);

  function callGooglePopup() {
    console.log("BLARGH")
    signInWithPopup(auth, provider)
    .then((result) => {
      console.log('clicked sign in?', result)
      setUser(result.user);
      // This gives you a Google Access Token. You can use it to access the Google API.
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential.accessToken;
      // The signed-in user info.
      const user = result.user;
      // IdP data available using getAdditionalUserInfo(result)
      // ...
    }).catch((error) => {
      // Handle Errors here.
      const errorCode = error.code;
      const errorMessage = error.message;
      console.log(errorCode)
      console.log(errorMessage)
      // The email of the user's account used.
      const email = error.customData.email;
      // The AuthCredential type that was used.
      const credential = GoogleAuthProvider.credentialFromError(error);
      console.error(errorCode, errorMessage, email, credential)
      // ...
    });
  }

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
    console.warn('created bag!', nextBag);
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

  async function startGame() {
    setGameStarted(true);
    const nextBag = createBag();
    const playerOpeningLetters = getRandomLetters(nextBag, 7);
    const opponentOpeningLetters = getRandomLetters(nextBag, 7);
    await pause(1500);
    setPlayerRack(playerOpeningLetters);
    await pause(1000);
    setOpponentRack(opponentOpeningLetters);
  }

  function handleTilePointerDown(tile, cursorPosition) {
    const tileElement = document.getElementById(tile.id);
    console.log(Math.round(cursorPosition.x), Math.round(cursorPosition.y));
    tileElement.style.top = cursorPosition.y + 'px';
    tileElement.style.left = cursorPosition.x + 'px';
    setSelectedTile(tile);
  }

  function handleTilePointerMove(cursorPosition) {
    const tileElement = document.getElementById(selectedTile.id);

    console.log('new position: ' + cursorPosition.x, cursorPosition.y);
    tileElement.style.top = cursorPosition.y + 'px';
    tileElement.style.left = cursorPosition.x + 'px';
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
              <Rack
                tiles={opponentRack}
                handleClickTile={() => null}
              />
              <GameBoard />
              <Rack
                tiles={playerRack}
                selectedTile={selectedTile}
                handleTilePointerDown={handleTilePointerDown}
                handleTilePointerMove={handleTilePointerMove}
              />
            </>
            :
            user ?
            <>
            <div className='logged-in-user-info'>
              <p>Signed in as</p>
              <img src={user.photoURL}></img>
              <p className='user-name'>{user.displayName}</p>
              <p>{user.email}</p>
            </div>
              <Button
                label='START'
                clickAction={startGame}
              />
            </>
            :
            <LoginModal callGooglePopup={callGooglePopup} />
          }
        </div>
        <Footer bag={bag} />
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

        .logged-in-user-info {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }

        .logged-in-user-info > .user-name {
          font-weight: bold;
          font-size: 2rem;
        }
      `}</style>

      <style jsx global>{`
        :root {
          --actual-height: 100vh;
          --main-width: 100vw;
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
          user-select: none;
        }
        p {
          margin: 0;
          padding: 0;
        }
        * {
          box-sizing: border-box;
        }
      `}</style>
    </div>
  );
}
