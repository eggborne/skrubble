import { isMobile } from 'is-mobile';
import { useEffect, useState } from 'react';
import { auth, provider } from '../scripts/firebase';
import { getAuth, signInWithPopup, GoogleAuthProvider, signInWithRedirect, signOut, signInAnonymously } from "firebase/auth";
import Head from 'next/head';
import Header from '../components/Header';
import Button from '../components/Button';
import GameBoard from '../components/GameBoard';
import Rack from '../components/Rack';
import { emptyLetterMatrix, tileData } from '../scripts/scrabbledata';
import { pause, randomInt, shuffleArray } from '../scripts/util';
import LoginModal from '../components/LoginModal';
import UserIcon from '../components/UserIcon';
import VersusScreen from '../components/VersusScreen';
import { v4 } from 'uuid';

const IS_MOBILE = isMobile();
let LANDSCAPE;

const defaultOpponent = {
  displayName: 'Opponent',
  photoURL: '../femaleavatar.png',
  uid: 'placeholderopponentid',
};
const guestUser = {
  displayName: 'Guest',
  photoURL: '../guestavatar.png',
  uid: v4(),
};

export default function Home() {
  const [loaded, setLoaded] = useState(false);
  const [user, setUser] = useState(null);
  const [opponent, setOpponent] = useState(defaultOpponent);
  const [gameStarted, setGameStarted] = useState(false);
  const [bag, setBag] = useState([]);
  const [playerRack, setPlayerRack] = useState([]);
  const [opponentRack, setOpponentRack] = useState([]);
  const [selectedTileId, setSelectedTileId] = useState(null);
  const [targetedSpaceId, setTargetedSpaceId] = useState(null);
  const [pointerPosition, setPointerPosition] = useState({ x: null, y: null });
  const [letterMatrix, setLetterMatrix] = useState([...emptyLetterMatrix]);
  const [dragStartPosition, setDragStartPosition] = useState(null);
  const [lastCursorPosition, setLastCursorPosition] = useState(null);
  const [lastTouchStart, setLastTouchStart] = useState(null);

  function signInAsGuest() {
    signInAnonymously(getAuth())
      .then(() => {
        console.log('signInAsGuest().then =>');
        let newUser = guestUser;

        setUser(newUser);
        console.log(newUser);
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error(errorCode, errorMessage);
      });
  }

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
          id: v4(),
          offset: { x: 0, y: 0 },
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
      console.log('nextBag length when i', i, ':', nextBag.length);
      letterArray.push(nextBag.splice(randomInt(0, nextBag.length - 1), 1)[0]);
    }
    // nextBag = nextBag.filter(tile => letterArray.indexOf(tile) === -1);
    console.log('letters:', nextBag);
    setBag(nextBag);
    return letterArray;
  }

  function establishScreenAttributes() {
    // document.documentElement.style.setProperty('--actual-height', 'window.innerHeight');
    LANDSCAPE = window.innerWidth > window.innerHeight;
    window.onresize = () => {
      // document.documentElement.style.setProperty('--actual-height', window.innerHeight + 'px');
      LANDSCAPE = window.innerWidth > window.innerHeight;
    };
  }

  useEffect(() => {
    if (!loaded) {
      establishScreenAttributes();

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
  function cursorOverBoard(touchX, touchY) {
    let over;
    const boardElement = document.getElementById('game-board');
    const xDistance = touchX - boardElement.getBoundingClientRect().left;
    const yDistance = touchY - boardElement.getBoundingClientRect().top;
    console.log('touched', touchX, touchY);
    console.log('distance', xDistance, yDistance);
    console.log('boardW', boardElement.getBoundingClientRect().width);
    console.log('boardH', boardElement.getBoundingClientRect().height);
    if (xDistance > 0 && yDistance > 0 && xDistance < boardElement.getBoundingClientRect().width && yDistance < boardElement.getBoundingClientRect().height) {
      console.error('over!');
      over = true;
    }
    return over;
  }

  function handleScreenPointerDown(e) {
    const touchX = e.pageX;
    const touchY = e.pageY;

    const draggableTiles = [...document.querySelectorAll(`.tile:not(.opponent):not(.title)`)];
    draggableTiles.forEach((tileElement, t) => {
      const xDistance = touchX - tileElement.getBoundingClientRect().left;
      const yDistance = touchY - tileElement.getBoundingClientRect().top;
      if (xDistance > 0 && yDistance > 0 && xDistance < tileElement.getBoundingClientRect().width && yDistance < tileElement.getBoundingClientRect().height) {
        const newSelectedTileId = tileElement.id;
        setSelectedTileId(newSelectedTileId);
        const newPlayerRack = [...playerRack];
        const rackedTileObject = newPlayerRack.filter(tile => tile.id === newSelectedTileId)[0];
        const tileTranslate = {
          x: parseInt(getComputedStyle(tileElement).translate.split(' ')[0]),
          y: parseInt(getComputedStyle(tileElement).translate.split(' ')[1]) || 0
        }
        if (tileElement.classList.contains('placed')) {
          rackedTileObject.placed = false;
        }
        const tileSize = parseFloat(getComputedStyle(tileElement).width);
        const tileCenter = {
          x: (tileTranslate.x * -1) + tileElement.getBoundingClientRect().left + (tileSize / 2),
          y: (tileTranslate.y * -1) + tileElement.getBoundingClientRect().top + (tileSize / 2)
        };
        const newTileOffset = {
          x: touchX - tileCenter.x,
          y: touchY - tileCenter.y
        };
        rackedTileObject.offset = newTileOffset;
        setPlayerRack(newPlayerRack);
        // setDragStartPosition(tileCenter);
        setDragStartPosition({x: touchX, y: touchY});
        setLastCursorPosition({
          x: touchX,
          y: touchY
        });
      }
    });
    setLastTouchStart(Date.now());
  }

  function handleScreenPointerMove(e) {
    if (selectedTileId) {
      const touchX = IS_MOBILE ? e.touches[0].pageX : e.pageX;
      const touchY = IS_MOBILE ? e.touches[0].pageY : e.pageY;
      const newPlayerRack = [...playerRack];
      const rackedTileObject = newPlayerRack.filter(tile => tile.id === selectedTileId)[0];
      const newTileOffset = {
        x: touchX - dragStartPosition.x,
        y: touchY - dragStartPosition.y
      };
      rackedTileObject.offset = newTileOffset;
      setPlayerRack(newPlayerRack);
      if (cursorOverBoard(touchX, touchY)) {
        const newTargetedSpaceId = findTargetedSpaceId(touchX, touchY);
        if (newTargetedSpaceId) {
          setTargetedSpaceId(newTargetedSpaceId);
        }
      } else {
        setTargetedSpaceId(null);
      }
      setLastCursorPosition({
        x: touchX, y: touchY
      });
    }
  }

  function handleScreenPointerUp(e) {
    console.log('up e', targetedSpaceId, e)
    if (selectedTileId) {
      const touchX = IS_MOBILE ? e.changedTouches[0].pageX : e.pageX;
      const touchY = IS_MOBILE ? e.changedTouches[0].pageY : e.pageY;
      const newPlayerRack = [...playerRack];
      const rackedTileObject = newPlayerRack.filter(tile => tile.id === selectedTileId)[0];
      const moveAmount = {
        x: touchX - lastCursorPosition.x,
        y: touchY - lastCursorPosition.y
      };
      const swipeDuration = Date.now() - lastTouchStart;
      const swipedOff = swipeDuration < 300 && (Math.abs(moveAmount.x) > 10 || Math.abs(moveAmount.y) > 10);
      
      if (swipedOff || !cursorOverBoard(touchX, touchY)) {
        console.warn('returning tile')
        rackedTileObject.offset = { x: 0, y: 0 };
      } else {
        if (targetedSpaceId) {
          placeTile(rackedTileObject);
        }
      }
      setPlayerRack(newPlayerRack);
      setDragStartPosition(null);
      setSelectedTileId(null);
      setTargetedSpaceId(null);
      setLastCursorPosition(null);
    }
    setLastTouchStart(null);
  }

  async function placeTile(tileObj) {
    tileObj.placed = true;
    
    const newPlayerRack = [...playerRack];
    const rackedTileObject = newPlayerRack.filter(tile => tile.id === selectedTileId)[0];
    const tileElement = document.getElementById(rackedTileObject.id);

    const splitId = targetedSpaceId.split('-'); 
    const spaceElement = document.getElementById(`${splitId[0]}-${splitId[1]}`);
    const spacePosition = {
      x: spaceElement.getBoundingClientRect().left,
      y: spaceElement.getBoundingClientRect().top
    };
    const preTileDistance = getTileDistanceFromSpace(tileElement, spacePosition);
    rackedTileObject.offset.x -= preTileDistance.x;
    rackedTileObject.offset.y -= preTileDistance.y;
    setPlayerRack(newPlayerRack);
    await pause(160);
    const postTileDistance = getTileDistanceFromSpace(tileElement, spacePosition);
    rackedTileObject.offset.x -= postTileDistance.x;
    rackedTileObject.offset.y -= postTileDistance.y;
    setPlayerRack(newPlayerRack);
  }

  function unplaceTile(tileObj, spacePosition) {
    console.warn('CALLING UNPLACELETTER', tileObj);
    
  }

  function getTileDistanceFromSpace(tileElement, spacePosition) {
    return {
      x: tileElement.getBoundingClientRect().left - spacePosition.x,
      y: tileElement.getBoundingClientRect().top - spacePosition.y
    }
  }

  function shuffleUserTiles() {
    console.log('shuffling!', playerRack);
    let newRack = [...playerRack];
    shuffleArray(newRack);
    console.log('shuffled!', newRack);
    setPlayerRack(newRack);
  }

  function returnUserTiles() {
    const newPlayerRack = [...playerRack];
    newPlayerRack.forEach(tile => {
      tile.placed = false;
      tile.offset = { x: 0, y: 0 };
    });
    setPlayerRack(newPlayerRack);
  }

  function findTargetedSpaceId(cursorPositionX, cursorPositionY) {
    let result;
    [...document.getElementsByClassName('dropzone')].filter(spaceElement => spaceElement && !spaceElement.classList.contains('racked')).forEach((spaceElement) => {
      const matrixX = parseInt(spaceElement.id.split('-')[0]) - 1;
      const matrixY = parseInt(spaceElement.id.split('-')[1]) - 1;
      const occupied = letterMatrix[matrixX][matrixY].contents !== null;
      // if (!spaceElement.classList.contains('racked')) {
      //   console.warn('space occupied?', occupied);
      //   console.warn('matrixX?', matrixX);
      //   console.warn('matrixY?', matrixY);
      // }
      // console.warn('cursorPosition?', cursorPosition.x, cursorPosition.y);
      if (spaceElement && !occupied) {
        const targetedX = cursorPositionX > spaceElement.getBoundingClientRect().x && cursorPositionX < (spaceElement.getBoundingClientRect().x + spaceElement.getBoundingClientRect().width);
        const targetedY = cursorPositionY > spaceElement.getBoundingClientRect().y && cursorPositionY < (spaceElement.getBoundingClientRect().y + spaceElement.getBoundingClientRect().height);
        if (targetedX && targetedY) {
          result = spaceElement.id;
        }
      }
    });
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
              `${selectedTileId.letter}` :
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
          gameStarted={gameStarted}
        />
        <div
          className='container'
          id='home-container'
          onPointerDown={gameStarted ? handleScreenPointerDown : () => null}
          onPointerMove={(gameStarted && !IS_MOBILE) ? handleScreenPointerMove : () => null}
          onPointerUp={(gameStarted && !IS_MOBILE) ? handleScreenPointerUp : () => null}
          onPointerCancel={(gameStarted && !IS_MOBILE) ? handleScreenPointerUp : () => null}
          onTouchMove={(gameStarted && IS_MOBILE) ? handleScreenPointerMove : () => null}
          onTouchEnd={(gameStarted && IS_MOBILE) ? handleScreenPointerUp : () => null}
          onTouchCancel={(gameStarted && IS_MOBILE) ? handleScreenPointerUp : () => null}
        >
          {gameStarted ?
            <>
              <div className='turn-display-area'>
                <div className='player-turn-area user current-turn'>
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
                    selectedTileId={selectedTileId}
                  />
                </div>
                <div className='user-button-area'>
                  <Button label='Menu' clickAction={() => null} />
                  <Button color='green' label='Submit' clickAction={() => null} />
                  {playerRack.every(tile => !tile.placed && !tile.selected) ?
                    <Button label='Shuffle' clickAction={shuffleUserTiles} />
                    :
                    <Button label='Return' clickAction={returnUserTiles} />
                  }
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
              <LoginModal handleClickGoogleLogin={callGooglePopup} handleClickGuestLogin={signInAsGuest} />
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
          position: relative;
          flex-grow: 1;
          display: grid;
          grid-template-columns: 1fr;
          grid-template-rows: min-content calc(var(--rack-height) * 1.5) min-content 1fr;

          & > .turn-display-area {
            display: flex;
            align-items: stretch;
            justify-content: center;
            padding: 2.5%;
            // padding-top: 0;
            gap: 2.5%;
            
            & > .player-turn-area {
              width: 50%;
              display: flex;
              flex-direction: row;
              align-items: center;
              justify-content: space-evenly;
              border-radius: calc(var(--rack-height) / 4);
              background-color: #ffffff33;
              padding: calc(var(--racked-tile-size) * 0.1) 0;
              
              &.current-turn {
                border: calc(var(--rack-height) / 10) solid #ffff00aa;
                background-color: #ffff0066;
              }

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
              flex-direction: column;
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
                box-shadow: 
                  0 0 calc(var(--board-size) / 96) #00000099,
                  0 0 calc(var(--board-size) / 150) #000000aa inset
                ;
                border: 1px solid black;
                border-radius: calc(var(--main-padding) / 3) calc(var(--main-padding) / 3) 0 0;
                z-index: 0;
              }

              & > .user-button-area {
                width: 95%;
                display: grid;
                grid-template-columns: 25% 1fr 25%;
                align-items: center;
                align-self: center;
                // flex-grow: 1;
                // padding-top: calc(var(--rack-height) / 4);
                margin-top: calc(var(--rack-height) / 1.5);
                justify-content: center;
                gap: 3%;
                z-index: 1;
              }
            }

            & > .rack-area {
              width: 100%;
              align-self: stretch;
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
          --board-size: 100vw;
          --header-height: ${user ? '2rem' : '14vw'};
          --main-padding: 0px;
          --rack-height: calc(var(--board-size) / 10);
          --rack-width: calc(var(--rack-height) * 9);
          --title-tile-size: calc(var(--header-height) * 0.7);
          --racked-tile-size: calc(var(--rack-height) * 1.1);
          --played-tile-size: calc(var(--board-size) / 16.5);
          --rack-board-tile-ratio: 0.55;
          --board-outline-size: calc(var(--board-size) / 160);
          --footer-height: 3rem;
          --button-height: 3rem;
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
          font-family: -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen,Ubuntu,Cantarell,"Fira Sans","Droid Sans","Helvetica Neue",sans-serif;
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
            --header-height: ${user ? '2.5rem' : '6rem'};
            --main-padding: 1rem;
            --board-size: calc((var(--actual-height) - var(--header-height)) - var(--main-padding));
            --rack-height: calc(var(--board-size) / 12);
            --rack-board-tile-ratio: 0.65;
          }

          header {
            background-color: transparent;
          }

          #home-container.container {
            grid-template-columns: 1fr var(--board-size);
            grid-template-rows:  0.65fr min-content  1fr;
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

          .turn-display-area {
            padding-top: 2.5%;
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