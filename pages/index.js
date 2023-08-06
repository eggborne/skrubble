import { useEffect, useState } from 'react';
import { db, auth, provider } from '../scripts/firebase';
import { getAuth, signInWithPopup, GoogleAuthProvider, setPersistence, inMemoryPersistence, signInWithRedirect, signOut, getRedirectResult } from "firebase/auth";
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

let SELECTED_TILE = null;
let TARGETED_SPACE_ID = null;

export default function Home() {
  const [loaded, setLoaded] = useState(false);
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
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
      // window.addEventListener('resize', () => {
      //   document.documentElement.style.setProperty('--actual-height', window.innerHeight + 'px');
      // });
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
          console.error('SETPERSISTENCE ERROR!', errorCode, errorMessage);
        });
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
    setSelectedTile(tile);
    SELECTED_TILE = tile;
  }

  function handleTilePointerMove(e) {
    if (SELECTED_TILE) {
      const tileElement = document.getElementById(SELECTED_TILE.id);
      const cursorPosition = {
        x: e.pageX - SELECTED_TILE.originalPosition.x - (tileElement.getBoundingClientRect().width / 2),
        y: e.pageY - SELECTED_TILE.originalPosition.y - (tileElement.getBoundingClientRect().height / 1.25)
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
        <Header revealed={loaded} user={user} />
        <div
          id='home-container'
          onPointerMove={handleTilePointerMove}
        >
          {gameStarted ?
            <>
              <div className='player-area'>
                <div className='player-info'></div>
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
              <div className='player-area'>
                <div className='rack-area'>
                  <Rack
                    owner={'user'}
                    tiles={playerRack}
                    selectedTile={selectedTile}
                    handleTilePointerDown={handleTilePointerDown}
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
        <Footer bag={bag} handleSignOut={handleSignOut} />
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
            pointer-events: none;

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
          --board-size: 100vw;
          --racked-tile-size: calc(var(--board-size) / 9.5);
          --played-tile-size: calc(var(--board-size) / 16.5);
          --rack-height: calc(var(--board-size) / 10);
          --board-outline-size: calc(var(--board-size) / 160);
          --header-height: 3rem;
          --footer-height: 3rem;
          --button-height: 4rem;
          --main-bg-color: #335533;
          --secondary-bg-color: #443330;
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
