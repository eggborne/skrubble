import { useEffect, useState } from 'react';
import { db, auth, provider } from '../scripts/firebase';
import { getAuth, signInWithPopup, GoogleAuthProvider, setPersistence, inMemoryPersistence } from "firebase/auth";
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

  useEffect(() => {

  });

  function callGooglePopup() {
    console.log("BLARGH")
    // signInWithPopup(auth, provider)
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
      setPersistence(auth, inMemoryPersistence)
      .then(() => {
      // In memory persistence will be applied to the signed in Google user
      // even though the persistence was set to 'none' and a page redirect
      // occurred.
      // return signInWithPopup(auth, provider);
      return callGooglePopup();
    })
  .catch((error) => {
    // Handle Errors here.
    const errorCode = error.code;
    const errorMessage = error.message;
  });
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

  function handleTilePointerMove(e) {
    const cursorPosition = { x: e.pageX, y: e.pageY };
    const tileElement = document.getElementById(selectedTile.id);

    console.log('new position: ' + cursorPosition.x, cursorPosition.y);
    tileElement.style.top = cursorPosition.y + 'px';
    tileElement.style.left = cursorPosition.x + 'px';
  }

  return (
    <div>
      <Head>
        <title>Phonetic Scrabble</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <Header />
        <div 
          id='home-container'
          // onPointerMove={handleTilePointerMove}
        >
          {gameStarted ?
            <>
            <div className='player-area'>
              <div className='player-info'></div>
              <div className='rack-area'>
                <Rack
                  tiles={opponentRack}
                  handleClickTile={() => null}
                />
              </div>
            </div>
              <GameBoard />
              <div className='player-area'>
                <div className='rack-area'>
                  <Rack
                    tiles={playerRack}
                    selectedTile={selectedTile}
                    // handleTilePointerDown={handleTilePointerDown}
                    // handleTilePointerMove={handleTilePointerMove}
                  />
                </div>
                <div className='player-info'></div>
              </div>
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
          max-height: var(--actual-height);
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          align-items: center;
        }
        #home-container {
          flex-grow: 1;
          display: grid;
          grid-template-columns: 1fr;
          grid-template-rows: 1fr min-content 1fr;
          // overflow: hidden;

          & > .player-area {
            display: grid;
            grid-template-columns: 1fr;
            grid-template-rows: 0.8fr 0.8fr;
            justify-items: center;
            align-items: center;

            & > .player-info {
              height: 100%;
              width: 100%;
            }

            & > .rack-area {
              width: 100%;
              height: 100%;
              display: flex;
              align-items: center;
              justify-content: center;
            }

            &:last-of-type {
              grid-template-rows: 0.8fr 0.8fr;
              align-content: flex-end;
            }

          }
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

        .logged-in-user-info > img {
          border-radius: 50%;
        }
      `}</style>

      <style jsx global>{`
        :root {
          --actual-height: 100vh;
          --main-width: 100vw;
          --board-size: calc(100vw - 1.25rem);
          --rack-height: calc(var(--board-size) / 10);
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

        @media screen and (orientation: landscape) {
          :root {
            --rack-height: 3rem;
            --board-size: calc(100vh - (var(--rack-height) * 5.2));
          }

          .player-area {
            
            grid-template-rows: 1fr !important;

            & > .player-info {
              position: fixed;
            }
          }
        }
      `}</style>
    </div>
  );
}
