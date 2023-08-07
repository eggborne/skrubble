import { useEffect, useState } from 'react';
import { db, auth, provider } from '../scripts/firebase';
import { getAuth, signInWithPopup, GoogleAuthProvider, setPersistence, inMemoryPersistence, signInWithRedirect, signOut, getRedirectResult, signInWithCredential } from "firebase/auth";
import Head from 'next/head';
import Footer from '../components/Footer';
import Header from '../components/Header';
import Button from '../components/Button';
import GameBoard from '../components/GameBoard';
import Rack from '../components/Rack';
import { emptyLetterMatrix, tileData } from '../scripts/scrabbledata';
import { pause, randomInt } from '../scripts/util';
import LoginModal from '../components/LoginModal';
import Tile from '../components/Tile';
import UserIcon from '../components/UserIcon';
import VersusScreen from '../components/VersusScreen';

let LANDSCAPE;

let SELECTED_TILE = null;
let TARGETED_SPACE_ID = null;

const defaultOpponent = {
  displayName: 'Opponent',
  photoURL: '../femaleavatar.png',
  uid: 'placeholderopponentid',
};

export default function Home() {
  const [loaded, setLoaded] = useState(false);
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [opponent, setOpponent] = useState(defaultOpponent);
  const [gameStarted, setGameStarted] = useState(false);
  const [bag, setBag] = useState([]);
  const [playerRack, setPlayerRack] = useState([]);
  const [opponentRack, setOpponentRack] = useState([]);
  const [selectedTile, setSelectedTile] = useState(null);
  const [targetedSpaceId, setTargetedSpaceId] = useState(null);
  const [pointerPosition, setPointerPosition] = useState({ x: null, y: null });
  const [letterMatrix, setLetterMatrix] = useState([...emptyLetterMatrix]);

  function callGoogleRedirect() {
    signInWithRedirect(auth, provider);
  }

  function callGooglePopup() {
    console.log("callGooglePopup");
    signInWithPopup(auth, provider)
      .then((result) => {
        console.log('signInWithPopup().then =>', result);
        let newUser = { ...result.user };

        setUser(newUser);
        console.log(newUser);
        // This gives you a Google Access Token. You can use it to access the Google API.
        // const credential = GoogleAuthProvider.credentialFromResult(result);
        // const token = credential.accessToken;
        // The signed-in user info.
        // const user = result.user;
        // IdP data available using getAdditionalUserInfo(result)
        // ...
      }).catch((error) => {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error('START callGooglePopup ERROR:');
        console.log(errorCode);
        console.log(errorMessage);
        console.error('END callGooglePopup ERROR:');
        // The email of the user's account used.
        const email = error.customData.email;
        // The AuthCredential type that was used.
        const credential = GoogleAuthProvider.credentialFromError(error);
        console.error(errorCode, errorMessage, email, credential);
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

  function placeLetter(letterObj, spacePosition) {
    const rackedLetterElement = document.getElementById(letterObj.id);
    const tileComponent =
      <Tile
        draggable={true}
        letter={letterObj.letter.toUpperCase()}
        value={letterObj.value}
        key={letterObj.key}
        id={letterObj.id}
        placed={true}
        onPointerDown={handleTilePointerDown}
      />;
    const newLetterMatrix = [...letterMatrix];
    newLetterMatrix[spacePosition.x][spacePosition.y] = tileComponent;
    rackedLetterElement.parentElement.removeChild(rackedLetterElement);
    setLetterMatrix(newLetterMatrix);
  }

  useEffect(() => {
    if (!loaded) {
      // document.documentElement.style.setProperty('--actual-height', '100dvh');
      LANDSCAPE = window.innerWidth > window.innerHeight;
      window.addEventListener('resize', () => {
        // document.documentElement.style.setProperty('--actual-height', window.innerHeight + 'px');
        LANDSCAPE = window.innerWidth > window.innerHeight;
      });
      window.addEventListener('pointerup', handleTilePointerUp);
      // getRedirectResult(auth)
      //   .then((result) => {
      //     setUser(result.user);
      //   }).catch((error) => {
      //     // Handle Errors here.
      //     const errorCode = error.code;
      //     const errorMessage = error.message;
      //     // The email of the user's account used.
      //     // const email = error.customData.email;
      //     // The AuthCredential type that was used.
      //     const credential = GoogleAuthProvider.credentialFromError(error);
      //     console.error('SETPERSISTENCE ERROR!', errorCode, errorMessage);
      //   });


      // setPersistence(auth, inMemoryPersistence)
      //   .then(() => {
      //     // In memory persistence will be applied to the signed in Google user
      //     // even though the persistence was set to 'none' and a page redirect
      //     // occurred.

      //     // return signInWithPopup(auth, provider);
      //     // return signInWithCredential()
      //     return callGooglePopup();
      //   })
      //   .catch((error) => {
      //     // Handle Errors here.
      //     const errorCode = error.code;
      //     const errorMessage = error.message;
      //     console.error('SETPERSISTENCE ERROR!', errorCode, errorMessage);
      //   });
      setLoaded(true);
    }
  }, [loaded]);

  async function startGame() {
    setGameStarted(true);
    const nextBag = createBag();
    const playerOpeningLetters = getRandomLetters(nextBag, 7);
    const opponentOpeningLetters = getRandomLetters(nextBag, 7);
    await pause(750);
    setPlayerRack(playerOpeningLetters);
    await pause(500);
    setOpponentRack(opponentOpeningLetters);
  }

  function handleTilePointerDown(tile, cursorPosition) {
    const tileElement = document.getElementById(tile.id);
    if (tileElement.classList.contains('placed')) {
      tileElement.classList.remove('placed');
      tileElement.style.position = 'absolute';
    }
    setSelectedTile(tile);
    SELECTED_TILE = tile;
  }

  function handleTilePointerMove(e) {
    if (SELECTED_TILE) {
      const tileElement = document.getElementById(SELECTED_TILE.id);
      const cursorPosition = {
        x: e.pageX - SELECTED_TILE.originalPosition.x - (tileElement.getBoundingClientRect().width / 2),
        y: e.pageY - SELECTED_TILE.originalPosition.y - (tileElement.getBoundingClientRect().height / 1)
      };
      setPointerPosition(cursorPosition);
      tileElement.style.top = cursorPosition.y + 'px';
      tileElement.style.left = cursorPosition.x + 'px';
      const newTargetedSpaceId = findTargetedSpaceId(tileElement, { x: e.pageX, y: e.pageY });
      console.log('target space', newTargetedSpaceId);
      setTargetedSpaceId(newTargetedSpaceId);
      TARGETED_SPACE_ID = newTargetedSpaceId;
    }
  }

  function handleTilePointerUp(e) {
    if (SELECTED_TILE) {
      if (TARGETED_SPACE_ID) {
        // const tileElement = document.getElementById(SELECTED_TILE.id);
        // tileElement.style.opacity = '0';
        const targetCoords = {
          x: parseInt(TARGETED_SPACE_ID.split('-')[0] - 1),
          y: parseInt(TARGETED_SPACE_ID.split('-')[1] - 1)
        };
        placeLetter(SELECTED_TILE, targetCoords);
        setTargetedSpaceId(null);
        TARGETED_SPACE_ID = null;

      } else {
        replaceTile(SELECTED_TILE.id);
      }
      setSelectedTile(null);
      SELECTED_TILE = null;
      setPointerPosition({ x: null, y: null });
    }
  }

  function replaceTile(tileId) {
    const tileElement = document.getElementById(tileId);
    tileElement.style.transition = 'all 200ms ease';
    tileElement.style.top = '0';
    tileElement.style.left = '0';
  }

  function findTargetedSpaceId(tileElement, cursorPosition) {
    let result;
    [...document.getElementsByClassName('dropzone')].forEach((spaceElement) => {
      const occupied = !spaceElement.classList.contains('racked') && letterMatrix[parseInt(spaceElement.id.split('-')[0]) - 1][parseInt(spaceElement.id.split('-')[1]) - 1] !== 0;
      if (spaceElement && !occupied) {
        const targetedX = cursorPosition.x > spaceElement.getBoundingClientRect().x && cursorPosition.x < (spaceElement.getBoundingClientRect().x + spaceElement.getBoundingClientRect().width);
        const targetedY = cursorPosition.y > spaceElement.getBoundingClientRect().y && cursorPosition.y < (spaceElement.getBoundingClientRect().y + spaceElement.getBoundingClientRect().height);
        if (targetedX && targetedY) {
          result = spaceElement.id;
        }
      }
    });
    console.log('returning result', result);
    return result;
  }

  function handleSignOut() {
    signOut(auth).then(() => {
      console.warn('--------------------> signed out!');
    }).catch((error) => {
      console.error('--------------------> FAILED to sign out!');
      // An error happened.
    });
  }

  return (
    <div>
      <div className='debug'>
        <div>
          <div>Selected tile:</div>
          <div>Targeted space:</div>
        </div>
        <div>
          <div>
            {pointerPosition.x ?
              `${selectedTile.letter}` :
              ``
            }
          </div>
          <div>
            {targetedSpaceId ?
              `${targetedSpaceId}` :
              ``
            }
          </div>
        </div>
      </div>
      <Head>
        <title>Skrubble.live</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <Header
          landscape={LANDSCAPE}
          revealed={loaded}
          user={user}
        />
        <div
          className='container'
          id='home-container'
          onPointerMove={handleTilePointerMove}
        >
          {gameStarted ?
            <>
              <div className='turn-display-area'>
                <div className='player-turn-area user'>
                  <UserIcon user={user} size='large' />
                  <div className='player-score'>0</div>
                </div>
                <div className='player-turn-area opponent'>
                  <UserIcon user={opponent} size='large' />
                  <div className='player-score'>0</div>
                </div>
              </div>
              <div className='player-area opponent'>
                <div className='rack-area'>
                  <Rack
                    owner={'opponent'}
                    tiles={opponentRack}
                    handleTilePointerDown={() => null}
                  />
                </div>
              </div>
              <GameBoard
                letterMatrix={letterMatrix}
                targetedSpaceId={targetedSpaceId}
              />
              <div className='player-area user'>
                <div className='rack-area'>
                  <Rack
                    owner={'user'}
                    tiles={playerRack}
                    selectedTile={selectedTile}
                    handleTilePointerDown={handleTilePointerDown}
                  />
                </div>
              </div>
            </>
            :
            user ?
              <VersusScreen
                user={user}
                opponent={opponent}
                handleClickStartGame={startGame}
              />
              :
              <LoginModal handleClickGoogleLogin={callGooglePopup} />
          }
        </div>
        {/* <Footer bag={bag} handleSignOut={handleSignOut} /> */}
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
          overflow: hidden;
        }
        #home-container {
          flex-grow: 1;
          display: grid;
          grid-template-columns: 1fr;
          grid-template-rows: calc(var(--rack-height) * 3) calc(var(--rack-height) * 2) min-content 1fr;

          & > * {
            // outline: 1px solid red;
          }

          & > .turn-display-area {
            display: flex;
            align-items: stretch;
            justify-content: center;

            & > .player-turn-area {
              flex-grow: 1;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;

              & > .player-score {
                font-size: calc(var(--racked-tile-size) / 1.5);
              }
            }
          }
           
          & > .player-area {
            position: relative;
            display: flex;
            justify-items: center;
            align-items: center;
            pointer-events: none;
            width: 100%;
            // background-color: salmon;
            

            &.user {
              align-items: flex-start;
              padding-top: calc(var(--rack-height) / 1.5);
              height: 100%;
              &:before {
                content: '';
                position: absolute;
                top: calc(var(--rack-height) * 1.5);
                left: 50%;
                translate: -50% 0;
                width: 100%;
                height: 90%;
                background: rgb(194,123,0);
                background: linear-gradient(180deg, rgba(194,123,0,1) 0%, rgba(208,147,74,1) 10%, rgba(173,110,0,1) 20%, rgba(173,110,0,1) 100%);
                border-radius: calc(var(--main-padding) / 3) calc(var(--main-padding) / 3) 0 0;
              }
            }

            & > .rack-area {
              width: 100%;
              // height: 100%;
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
          padding-top: 2rem;
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
          --actual-height: 100dvh;
          --main-width: 100vw;
          --header-height: 3rem;
          --main-padding: 0px;
          --board-size: 100vw;
          --played-tile-size: calc(var(--board-size) / 16.5);
          --title-tile-size: calc(var(--header-height) * 0.75);
          --rack-height: calc(var(--board-size) / 10);
          --rack-width: calc(var(--rack-height) * 9);
          --racked-tile-size: calc(var(--rack-height) * 1.1);
          --board-outline-size: calc(var(--board-size) / 160);
          --footer-height: 3rem;
          --button-height: 4rem;
          --main-bg-color: #335533;
          --secondary-bg-color: #443330;
          --footer-color: #443330;
          --main-text-color: #cdc;
          --secondary-text-color: #ccc;
          --board-color: #ccc2a1;
          --board-bg-color: #ddd;
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

        .debug {
          position: fixed;
          top: 40%;
          right: 0;
          padding: 0.5rem;
          width: 12rem;
          display: grid;
          grid-template-columns: 1fr 1fr;
          background: gray;
          color: black;
          z-index: 4;
          font-size: 0.75rem;
          display: none;

          & > div {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            gap: 0.25rem;

            &:last-of-type {
              padding-right: 1rem;
            }
          }
        }

        @media screen and (orientation: landscape) {
          :root {
            --main-padding: 1rem;
            --board-size: calc((100dvh - var(--header-height)) - var(--main-padding));
            --rack-height: calc(var(--board-size) / 12);
          }

          #home-container.container {
            grid-template-columns: 1fr var(--board-size);
            grid-template-rows: 1fr 1fr 1fr;
            gap: 0 calc(var(--racked-tile-size) / 3);
          }

          .player-area {
            grid-template-rows: 1fr !important;
            padding: var(--main-padding);
            grid-column-start: 1;

            &.opponent {
              grid-row:-start: 1;
            }
            &.user {
              grid-column-start: 1;
            }
          }

          .game-board {
            grid-column-start: 2;
            grid-row-start: 1;
            grid-row-end: 4;
            align-self: center;
            justify-self: center;

          }
        }
      `}</style>
    </div>
  );
}
