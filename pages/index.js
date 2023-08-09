import { isMobile } from 'is-mobile';
import { useEffect, useState } from 'react';
import { db, auth, provider } from '../scripts/firebase';
import { getAuth, signInWithPopup, GoogleAuthProvider, signInWithRedirect, signOut, signInAnonymously } from "firebase/auth";
import Head from 'next/head';
import Footer from '../components/Footer';
import Header from '../components/Header';
import Button from '../components/Button';
import GameBoard from '../components/GameBoard';
import Rack from '../components/Rack';
import { emptyLetterMatrix, tileData } from '../scripts/scrabbledata';
import { pause, randomInt, shuffleArray } from '../scripts/util';
import LoginModal from '../components/LoginModal';
import Tile from '../components/Tile';
import UserIcon from '../components/UserIcon';
import VersusScreen from '../components/VersusScreen';
import { v4 } from 'uuid';

const IS_MOBILE = isMobile();
let LANDSCAPE;

let SELECTED_TILE = null;
let TARGETED_SPACE_ID = null;

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
  const [selectedTile, setSelectedTile] = useState(null);
  const [targetedSpaceId, setTargetedSpaceId] = useState(null);
  const [pointerPosition, setPointerPosition] = useState({ x: null, y: null });
  const [letterMatrix, setLetterMatrix] = useState([...emptyLetterMatrix]);

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
          letter: letter,
          value: tileData[letter].value,
          id: v4(),
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
      console.log('nextBag length when i', i, ':', nextBag.length)
      letterArray.push(nextBag.splice(randomInt(0, nextBag.length - 1), 1)[0]);
    }
    // nextBag = nextBag.filter(tile => letterArray.indexOf(tile) === -1);
    console.log('letters:', nextBag)
    setBag(nextBag);
    return letterArray;
  }

  useEffect(() => {
    if (!loaded) {
      // document.documentElement.style.setProperty('--actual-height', 'window.innerHeight');
      LANDSCAPE = window.innerWidth > window.innerHeight;
      window.addEventListener('resize', () => {
        // document.documentElement.style.setProperty('--actual-height', window.innerHeight + 'px');
        LANDSCAPE = window.innerWidth > window.innerHeight;
      });
      if (IS_MOBILE) {
        // window.addEventListener('touchmove', handleTileTouchMove, {passive: false});
        // window.addEventListener('touchend', handleTilePointerUp);
      } else {
      }
      window.addEventListener(IS_MOBILE ? 'touchmove' : 'pointermove', handleTilePointerMove, { passive: false });
      // window.addEventListener('pointerup', handleTilePointerUp);

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

  function handleTilePointerDown(e, tile) {
    const tileElement = document.getElementById(tile.id);
    if (tileElement.classList.contains('placed')) {
      const originalTile = { ...tile };
      originalTile.id = originalTile.id.replace('-placed', '');
      unplaceLetter(originalTile, tile.placed);
      setSelectedTile(originalTile);
      SELECTED_TILE = originalTile;
      // document.getElementById(originalTile.id).style.opacity = '0.5';
    } else {
      setSelectedTile(tile);
      SELECTED_TILE = tile;
      // tileElement.style.opacity = '0.5';
    }
  }

  function handleTilePointerMove(e) {
    if (SELECTED_TILE) {
      const tileElement = document.getElementById(SELECTED_TILE.id);
      const touchX = IS_MOBILE ? e.touches[0].pageX : e.pageX;
      const touchY = IS_MOBILE ? e.touches[0].pageY : e.pageY;
      // const cursorPosition = {
      //   x: touchX - SELECTED_TILE.originalPosition.x - (tileElement.getBoundingClientRect().width / 2),
      //   y: touchY - SELECTED_TILE.originalPosition.y - (tileElement.getBoundingClientRect().height / 1)
      // };
      const cursorPosition = {
        x: touchX - SELECTED_TILE.originalPosition.x - (tileElement.getBoundingClientRect().width / 2),
        y: touchY - SELECTED_TILE.originalPosition.y - (tileElement.getBoundingClientRect().height / 1)
      };
      const cursorOffset = {
        x: touchX - SELECTED_TILE.originalPosition.x - (tileElement.getBoundingClientRect().width / 2),
        y: touchY - SELECTED_TILE.originalPosition.y - (tileElement.getBoundingClientRect().height / 1)
      }
      setPointerPosition(cursorPosition);
      // tileElement.style.top = cursorPosition.y + 'px';
      // tileElement.style.left = cursorPosition.x + 'px';
      // tileElement.style.transform = `translate(${cursorOffset.x}px, ${cursorOffset.y}px)`
      tileElement.style.translate = `${cursorOffset.x}px ${cursorOffset.y}px`
      const newTargetedSpaceId = findTargetedSpaceId({ x: touchX, y: touchY });
      if (newTargetedSpaceId) {
        setTargetedSpaceId(newTargetedSpaceId);
        TARGETED_SPACE_ID = newTargetedSpaceId;
      }
    }
    e.preventDefault();
  }

  function handleTilePointerUp(e) {
    if (SELECTED_TILE) {
      if (TARGETED_SPACE_ID) {
        const targetCoords = {
          x: parseInt(TARGETED_SPACE_ID.split('-')[0] - 1),
          y: parseInt(TARGETED_SPACE_ID.split('-')[1] - 1)
        };
        placeLetter(e, SELECTED_TILE, targetCoords);
        setTargetedSpaceId(null);
        TARGETED_SPACE_ID = null;

      } else {
        replaceTile(SELECTED_TILE.id);
      }
    }
    setSelectedTile(null);
    SELECTED_TILE = null;
    setPointerPosition({ x: null, y: null });
  }

  function placeLetter(e, tileObj, spacePosition) {
    const rackedLetterElement = document.getElementById(tileObj.id);
    const placedTileComponent =
      <Tile
        draggable={true}
        letter={tileObj.letter}
        value={tileObj.value}
        key={tileObj.key + '-placed'}
        id={tileObj.id + '-placed'}
        rackSpaceId={tileObj.rackSpaceId}
        onPointerDown={handleTilePointerDown}
        onPointerUp={handleTilePointerUp}
        tileObj
        placed={spacePosition}
      />;
    const newLetterMatrix = [...letterMatrix];
    newLetterMatrix[spacePosition.x][spacePosition.y] = placedTileComponent;
    const spaceElement = document.getElementById(`${spacePosition.y}-${spacePosition.x}`);
    // rackedLetterElement.style.setProperty('--current-size', 'var(--played-tile-size)');
    // rackedLetterElement.style.left = '0';
    // rackedLetterElement.style.top = '0';
    // rackedLetterElement.style.opacity = '0.2';
    // rackedLetterElement.style.pointerEvents = 'none';
    // rackedLetterElement.style.visibility = 'hidden';
    setLetterMatrix(newLetterMatrix);
  }

  function unplaceLetter(tileObj, spacePosition) {
    console.log('unplacing', tileObj, 'from', spacePosition);
    const placedTileElement = document.getElementById(tileObj.id + '-placed');
    const floatingTileElement = document.getElementById(tileObj.id);
    console.warn('floatingTileElement', floatingTileElement)
    // floatingTileElement.style.opacity = '1';
    // floatingTileElement.style.pointerEvents = 'all';
    // floatingTileElement.style.visibility = 'visible';

    const newTileObject = {
      ...tileObj,
      draggable: true,
      // placed: false,
    };
    const newLetterMatrix = [...letterMatrix];
    newLetterMatrix[spacePosition.y][spacePosition.x] = 0;
    placedTileElement.parentElement.removeChild(placedTileElement);
    setLetterMatrix(newLetterMatrix);
    setSelectedTile(newTileObject);
    SELECTED_TILE = newTileObject;
    console.log('setting selected', newTileObject);
    // const newPlayerRack = [...playerRack];
    // newPlayerRack.push(tileComponent);
    // setPlayerRack(newPlayerRack);
  }

  function replaceTile(tileId) {
    const tileElement = document.getElementById(tileId);
    tileElement.style.transition = 'all 200ms ease';
    tileElement.style.top = '0';
    tileElement.style.left = '0';
  }

  function shuffleUserTiles() {
    console.log('shuffling!', playerRack);
    let newRack = [...playerRack];
    shuffleArray(newRack);
    console.log('shuffled!', newRack);
    setPlayerRack(newRack);

  }

  function findTargetedSpaceId(cursorPosition) {
    let result;
    [...document.getElementsByClassName('dropzone')].filter(spaceElement => spaceElement && !spaceElement.classList.contains('racked')).forEach((spaceElement) => {
      const matrixX = parseInt(spaceElement.id.split('-')[0]) - 1;
      const matrixY = parseInt(spaceElement.id.split('-')[1]) - 1;
      const occupied = letterMatrix[matrixX][matrixY] !== 0;
      // if (!spaceElement.classList.contains('racked')) {
      //   console.warn('space occupied?', occupied);
      //   console.warn('matrixX?', matrixX);
      //   console.warn('matrixY?', matrixY);
      // }
      // console.warn('cursorPosition?', cursorPosition.x, cursorPosition.y);
      if (spaceElement && !occupied) {
        const targetedX = cursorPosition.x > spaceElement.getBoundingClientRect().x && cursorPosition.x < (spaceElement.getBoundingClientRect().x + spaceElement.getBoundingClientRect().width);
        const targetedY = cursorPosition.y > spaceElement.getBoundingClientRect().y && cursorPosition.y < (spaceElement.getBoundingClientRect().y + spaceElement.getBoundingClientRect().height);
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
          gameStarted={gameStarted}
        />
        <div
          className='container'
          id='home-container'
          // onPointerMove={handleTilePointerMove}
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
                    handleTilePointerUp={handleTilePointerUp}
                  />
                </div>
                <div className='user-button-area'>
                  <Button label='Menu' clickAction={() => null} />
                  <Button color='green' label='Submit' clickAction={() => null} />
                  <Button label='Shuffle' clickAction={shuffleUserTiles} />
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
                display: flex;
                align-items: center;
                align-self: center;
                flex-grow: 1;
                // padding-top: calc(var(--rack-height) / 4);
                // margin-top: calc(var(--rack-height) / 2.5);
                justify-content: center;
                gap: 2%;
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
          }

          header {
            background-color: transparent;
          }

          #home-container.container {
            grid-template-columns: 1fr var(--board-size);
            grid-template-rows: min-content 1fr 1fr;
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
