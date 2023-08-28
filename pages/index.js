import { isMobile } from 'is-mobile';
import { useEffect, useState } from 'react';
import { auth, provider } from '../scripts/firebase';
import { getAuth, signInWithPopup, GoogleAuthProvider, signInWithRedirect, signOut, signInAnonymously } from "firebase/auth";
import Head from 'next/head';
import Header from '../components/Header';
import Button from '../components/Button';
import GameBoard from '../components/GameBoard';
import Rack from '../components/Rack';
import { emptyLetterMatrix, fullBoard, tileData } from '../scripts/scrabbledata';
import { pause, randomInt, shuffleArray } from '../scripts/util';
import LoginModal from '../components/LoginModal';
import UserIcon from '../components/UserIcon';
import VersusScreen from '../components/VersusScreen';
import { v4 } from 'uuid';
import BagModal from '../components/BagModal';
import BlankModal from '../components/BlankModal';
import WordScoreDisplay from '../components/WordScoreDisplay';
import { getAllRulesets } from '../scripts/db';
import { getViolations } from '../scripts/validator';
import RulesModal from '../components/RulesModal';
import ViolationsModal from '../components/ViolationsModal';

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
  const [userScore, setUserScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [opponent, setOpponent] = useState(defaultOpponent);
  const [currentTurn, setCurrentTurn] = useState('user');
  const [pendingTurnScore, setPendingTurnScore] = useState(0);
  const [wordScoreTileId, setWordScoreTileId] = useState(undefined);
  const [gameStarted, setGameStarted] = useState(false);
  const [submitReady, setSubmitReady] = useState(false);
  const [bag, setBag] = useState([]);
  const [playerRack, setPlayerRack] = useState([]);
  const [opponentRack, setOpponentRack] = useState([]);
  const [selectedTileId, setSelectedTileId] = useState(null);
  const [targetedSpaceId, setTargetedSpaceId] = useState(null);
  const [pointerPosition, setPointerPosition] = useState({ x: null, y: null });
  const [letterMatrix, setLetterMatrix] = useState([...emptyLetterMatrix]);
  const [dragStartPosition, setDragStartPosition] = useState(null);
  const [modalShowing, setModalShowing] = useState(undefined);
  const [editingBlank, setEditingBlank] = useState(undefined);
  const [wordsOnBoard, setWordsOnBoard] = useState({ horizontal: [], vertical: [] });
  const [previousWordList, setPreviousWordList] = useState({ horizontal: [], vertical: [] });
  const [newWords, setNewWords] = useState([]);
  const [turnHistory, setTurnHistory] = useState([]);
  const [wordRules, setWordRules] = useState({});
  const [unpronouncableWords, setUnpronouncableWords] = useState([]);
  const [debugMode, setDebugMode] = useState(true);

  function signInAsGuest() {
    signInAnonymously(getAuth())
      .then(() => {
        console.log('signInAsGuest().then =>');
        let newUser = guestUser;

        setUser(newUser);
        console.log('guest user!', newUser);
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
        console.log('new user!', newUser);
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

  function callModal(modalName) {
    setModalShowing(modalName);
  }
  function toggleModal(modalName) {
    const newValue = modalShowing === modalName ? 'undefined' : modalName;
    setModalShowing(newValue);
  }
  function dismissModal(modalName) {
    setModalShowing(undefined);
  }

  function callBlankModal() {
    setModalShowing('blank');
    setEditingBlank(selectedTileId);
  }

  function createBag() {
    const newBag = [];
    for (const letter in tileData) {
      let tileQuantity = tileData[letter].quantity;
      for (let i = 0; i < tileQuantity; i++) {
        newBag.push({
          letter: letter.toUpperCase(),
          value: tileData[letter].value,
          id: v4(),
          offset: { x: 0, y: 0 },
          bgPosition: randomInt(0, 100),
        });
      }
    }
    setBag(newBag);
    return newBag;
  }

  function getRandomLetters(nextBag, amount, owner) {
    const letterArray = [];
    for (let i = 0; i < amount; i++) {
      const drawnTile = nextBag.splice(randomInt(0, nextBag.length - 1), 1)[0];
      drawnTile.rackIndex = i;
      drawnTile.owner = owner;
      drawnTile.turnPlayed = 0;
      if (drawnTile.letter === 'BLANK') {
        drawnTile.blank = true;
      }
      letterArray.push(drawnTile);
    }
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

  async function getWordRules() {
    const rulesets = await getAllRulesets();
    const rawWordRules = rulesets.data[0].filter(set => set.dialect === "Pronouncable")[0];
    const newWordRules = {};
    for (let attribute in rawWordRules) {
      const firstRawChar = rawWordRules[attribute][0];
      const needsParsing = firstRawChar === '[' || firstRawChar === '{';
      newWordRules[attribute] = needsParsing ? JSON.parse(rawWordRules[attribute]) : rawWordRules[attribute];
    }
    console.warn('newWordRules', newWordRules);
    return newWordRules;
  }

  useEffect(() => {
    if (!loaded) {
      establishScreenAttributes();
      document.getElementById('home-container').addEventListener('touchmove', e => e.preventDefault(), false);
      window.addEventListener('keydown', e => {
        if (e.code === 'Space') {
          e.preventDefault();
        }
      });
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
      let startTime = Date.now();
      getWordRules().then(newWordRules => {
        console.warn('got rules in', (Date.now() - startTime));
        setWordRules(newWordRules);
        // getViolations('chickens', newWordRules);
      });
      setLoaded(true);
    }

  }, [loaded]);

  useEffect(() => {
    const tilesNeighbored = allTilesNeighbored();
    let ready = tilesNeighbored;
    const filledSpaces = letterMatrix.flat().filter(space => space.contents && space.contents.placed);

    const touchingLocked = placedTilesTouchingLocked(filledSpaces.filter(space => !space.contents.locked));
    const tilesInLine = placedTilesAreAligned(filledSpaces.filter(space => !space.contents.locked));
    const centerTileFilled = filledSpaces.filter(space => space.contents.placed.x === 7 && space.contents.placed.y === 7)[0];
    const firstWordNotOnStart = (lockedTiles.length === 0 && !centerTileFilled);

    const wordsToAnalyze = getWordsFromBoard();
    const newViolatingWords = [];
    wordsToAnalyze.forEach(wordObj => {
      const violations = getViolations(wordObj.word, wordRules);
      if (violations.banned || violations.invalid) {
        const newViolatorObj = {
          wordObj,
          violations,
        };
        newViolatingWords.push(newViolatorObj);
      }
    });
    setUnpronouncableWords(newViolatingWords);
    const allWordsOkay = newViolatingWords.length === 0;
    if (!allWordsOkay || (!tilesInLine || (tilesInLine && !tilesNeighbored)) || firstWordNotOnStart || (!touchingLocked && lockedTiles.length > 0)) {
      ready = false;
    }

    document.getElementById('in-line-display').innerHTML = tilesInLine;
    document.getElementById('touching-locked-display').innerHTML = touchingLocked || (lockedTiles.length === 0 && centerTileFilled) ? 'true' : 'false';
    document.getElementById('submit-ready-display').innerHTML = ready;

    setSubmitReady(ready);
  }, [letterMatrix]);

  useEffect(() => {
    setPreviousWordList(wordsOnBoard);
  }, [currentTurn]);

  async function startGame() {
    setGameStarted(true);
    const nextBag = createBag();
    const playerOpeningLetters = getRandomLetters(nextBag, 7, 'user');
    const opponentOpeningLetters = getRandomLetters(nextBag, 7, 'opponent');
    await pause(1000);
    setPlayerRack(playerOpeningLetters);
    await pause(800);
    setOpponentRack(opponentOpeningLetters);
  }

  useEffect(() => {
    let totalNewPoints = newWords.reduce((acc, curr) => scoreWord(curr) + acc, 0);
    setPendingTurnScore(totalNewPoints);
  }, [newWords]);

  function tileHasNeighbor(space) {
    const flatOccupiedSpaceArray = [...letterMatrix].flat().filter(val => val.contents);
    const verticalNeighbors = flatOccupiedSpaceArray.filter(occupiedSpace => {
      const sameColumn = occupiedSpace.coords.x === space.coords.x;
      const aboveOrBelow = occupiedSpace.coords.y === (space.coords.y - 1) || occupiedSpace.coords.y === (space.coords.y + 1);
      return sameColumn && aboveOrBelow;
    });
    const horizontalNeighbors = flatOccupiedSpaceArray.filter(occupiedSpace => {
      const sameRow = occupiedSpace.coords.y === space.coords.y;
      const toLeftOrRight = occupiedSpace.coords.x === (space.coords.x - 1) || occupiedSpace.coords.x === (space.coords.x + 1);
      return sameRow && toLeftOrRight;
    });

    const hasNeighbor = verticalNeighbors.length > 0 || horizontalNeighbors.length > 0;
    return hasNeighbor ? [...verticalNeighbors, ...horizontalNeighbors] : false;
  }

  function submitTiles() {
    let newPlayerRack = [...playerRack];
    const placedTiles = newPlayerRack.filter(tile => tile.placed);
    placedTiles.map(tile => {
      tile.locked = true;
      tile.turnPlayed = turnHistory.length;
    });
    newPlayerRack = newPlayerRack.filter(tile => !tile.locked);
    const newLetters = getRandomLetters([...bag], 7 - newPlayerRack.length, 'user');
    const newFullRack = [...newPlayerRack, ...newLetters];
    setPlayerRack(newFullRack);
    const newTurn = currentTurn === 'user' ? 'opponent' : 'user';
    const newTurnData = [...turnHistory, [...placedTiles]];
    setUserScore(userScore + pendingTurnScore);
    setPendingTurnScore(0);
    setNewWords([]);
    setTurnHistory(newTurnData);
    setCurrentTurn(newTurn);
  }

  function cursorOverBoard(touchX, touchY) {
    let over;
    const boardElement = document.getElementById('game-board');
    const boardRect = boardElement.getBoundingClientRect();
    const xDistance = touchX - boardRect.left;
    const yDistance = touchY - boardRect.top;
    if (xDistance > 0 && yDistance > 0 && xDistance < boardRect.width && yDistance < boardRect.height) {
      over = true;
    }
    return over;
  }

  function handleScreenPointerDown(e) {
    const touchX = e.pageX;
    const touchY = e.pageY;

    const draggableTiles = [...document.querySelectorAll(`.tile:not(.opponent):not(.title):not(.locked):not(.bag):not(.blank-selection)`)];
    draggableTiles.forEach((tileElement, t) => {
      const tileRect = tileElement.getBoundingClientRect();
      const xDistance = touchX - tileRect.left;
      const yDistance = touchY - tileRect.top;
      if (xDistance > 0 && yDistance > 0 && xDistance < tileRect.width && yDistance < tileRect.height) {
        const newSelectedTileId = tileElement.id;
        setSelectedTileId(newSelectedTileId);
        const newPlayerRack = [...playerRack];
        const rackedTileObject = newPlayerRack.filter(tile => tile.id === newSelectedTileId)[0];
        const tileStyle = getComputedStyle(tileElement);
        const tileTranslate = {
          x: parseInt(tileStyle.translate.split(' ')[0]),
          y: parseInt(tileStyle.translate.split(' ')[1]) || 0
        };
        const tileSize = parseFloat(tileStyle.width);
        const tileCenter = {
          x: (tileTranslate.x * -1) + tileRect.left + (tileSize / 2),
          y: (tileTranslate.y * -1) + tileRect.top + (tileSize / 2)
        };
        const newTileOffset = {
          x: touchX - tileCenter.x,
          y: touchY - tileCenter.y
        };
        rackedTileObject.offset = newTileOffset;

        setPlayerRack(newPlayerRack);

        setDragStartPosition(tileCenter);

        if (tileElement.classList.contains('placed')) {
          unplaceTile(rackedTileObject);
          if (placedTiles.length === 1) {
            setWordScoreTileId(undefined);
            setPendingTurnScore(0);
          }
          const newTargetedSpaceId = findTargetedBoardSpaceId(touchX, touchY);
          if (newTargetedSpaceId) {
            setTargetedSpaceId(newTargetedSpaceId);
          } else {
            setTargetedSpaceId(null);
          }
        }
      }
    });
  }

  function handleScreenPointerMove(e) {
    const throttleOK = Date.now() % 2 === 0;
    if (selectedTileId && throttleOK) {
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
        const newTargetedSpaceId = findTargetedBoardSpaceId(touchX, touchY);
        if (typeof newTargetedSpaceId === 'string') {
          setTargetedSpaceId(newTargetedSpaceId);
        }
      } else {
        const targetedRackSpace = findTargetedRackSpace(touchX, touchY);
        const notPastAdjacentTileMidpoint = Math.abs(rackedTileObject.offset.x) < (document.getElementById(rackedTileObject.id).getBoundingClientRect().width * 0.7);

        if (targetedRackSpace.targetedId && !notPastAdjacentTileMidpoint) {
          setTargetedSpaceId(targetedRackSpace.targetedId);
        } else {
          setTargetedSpaceId(null);
        }
      }
    }
  }

  function handleScreenPointerUp(e) {
    if (selectedTileId) {
      const touchX = IS_MOBILE ? e.changedTouches[0].pageX : e.pageX;
      const touchY = IS_MOBILE ? e.changedTouches[0].pageY : e.pageY;

      const newPlayerRack = [...playerRack];
      const rackedTileObject = newPlayerRack.filter(tile => tile.id === selectedTileId)[0];
      if (!cursorOverBoard(touchX, touchY)) {
        if (targetedSpaceId) {
          const rackFull = newPlayerRack.every(tile => !tile.placed);
          if (rackFull) {
            const rackIndex = newPlayerRack.indexOf(rackedTileObject);
            const targetIndex = parseInt(targetedSpaceId.split('-')[3]);
            const targetedRackSpace = findTargetedRackSpace(touchX, touchY);
            const position = targetedRackSpace.position;
            const moveDirection = targetIndex > rackIndex ? 'right' : 'left';
            insertRackTile(rackIndex, targetIndex, position, moveDirection);
          }
          rackedTileObject.offset = { x: 0, y: 0 };
        }
      } else {
        if (targetedSpaceId) {
          placeTile(rackedTileObject);
          // setWordScoreTileId(selectedTileId);
        }
      }
      if (!targetedSpaceId) {
        rackedTileObject.offset = { x: 0, y: 0 };
        setPlayerRack(newPlayerRack);
      }
      setDragStartPosition(null);
      setSelectedTileId(null);
      setTargetedSpaceId(null);
    }
  }

  function placeTile(tileObj) {
    // tileObj.placed = targetedSpaceId;
    tileObj.placed = {
      x: targetedSpaceId.split('-')[0] - 1,
      y: targetedSpaceId.split('-')[1] - 1,
    };
    const newPlayerRack = [...playerRack];
    const tileElement = document.getElementById(tileObj.id);
    const newLetterMatrix = [...letterMatrix];
    const matrixX = tileObj.placed.x;
    const matrixY = tileObj.placed.y;
    // newLetterMatrix[matrixX][matrixY].contents = tileObj;
    newLetterMatrix[matrixY][matrixX].contents = tileObj;
    const spaceElement = document.getElementById(targetedSpaceId);
    const spaceRect = spaceElement.getBoundingClientRect();
    const spacePosition = {
      x: spaceRect.left,
      y: spaceRect.top
    };

    if (tileObj.letter === 'BLANK') {
      callBlankModal();
    }

    window.requestAnimationFrame(async () => {
      const tileRect = tileElement.getBoundingClientRect();
      const preTileDistance = getTileDistanceFromSpace(tileRect, spacePosition);
      tileObj.offset.x -= preTileDistance.x;
      tileObj.offset.y -= preTileDistance.y;
      tileObj.landed = true;
      await pause(2);
      setPlayerRack(newPlayerRack);
      setLetterMatrix(newLetterMatrix);
    });
  }

  function allTilesNeighbored() {
    let congruous = true;
    [...letterMatrix].forEach((row, r) => {
      row.forEach((space, s) => {
        if (space.contents) {
          if (!tileHasNeighbor(space)) {
            congruous = false;
          }
        }
      });
    });
    document.getElementById('neigbored-display').innerText = congruous;
    return congruous;
  }

  function placedTilesAreAligned(placedTileSpaces) {
    const horizontallyAligned = placedTileSpaces.every(space => space.coords.x === placedTileSpaces[0].coords.x);
    const verticallyAligned = placedTileSpaces.every(space => space.coords.y === placedTileSpaces[0].coords.y);
    const tilesInLine = horizontallyAligned || verticallyAligned;
    return tilesInLine;
  }

  function placedTilesTouchingLocked(placedTileSpaces) {
    let touching = false;
    placedTileSpaces.forEach(space => {
      const tileNeighbors = tileHasNeighbor(space);
      const hasLockedNeighbor = tileNeighbors && tileNeighbors.filter(neighborSpace => neighborSpace.contents.locked).length > 0;
      if (hasLockedNeighbor) {
        touching = true;
      }
    });
    return touching;
  }

  function changeTileAttribute(tileObj, attribute, newValue) {
    tileObj[attribute] = newValue;
    setPlayerRack(newPlayerRack);
  }

  function unplaceTile(tileObj) {
    const matrixX = tileObj.placed.x;
    const matrixY = tileObj.placed.y;
    const newLetterMatrix = [...letterMatrix];
    tileObj.landed = false;
    tileObj.placed = false;
    if (tileObj.blank) {
      tileObj.letter = 'BLANK';
    }
    // newLetterMatrix[matrixX][matrixY].contents = null;
    newLetterMatrix[matrixY][matrixX].contents = null;
    setLetterMatrix(newLetterMatrix);
    // setWordScoreTileId(undefined);
  }

  function getTileDistanceFromSpace(tileRect, spacePosition) {
    return {
      x: tileRect.left - spacePosition.x,
      y: tileRect.top - spacePosition.y
    };
  }

  function shuffleUserTiles() {
    let newRack = [...playerRack];
    shuffleArray(newRack);
    setPlayerRack(newRack);
  }

  function returnUserTiles() {
    const newPlayerRack = [...playerRack];
    newPlayerRack.filter(tile => tile.placed).forEach(tile => {
      unplaceTile(tile);
      tile.offset = { x: 0, y: 0 };
    });
    setPlayerRack(newPlayerRack);
  }

  function findTargetedRackSpace(cursorPositionX, cursorPositionY) {
    let result = {
      targetedId: undefined,
      position: undefined,
    };
    const playerRackSpaces = [...document.getElementsByClassName('dropzone')].filter(spaceElement => spaceElement && spaceElement.classList.contains('on-rack') && !spaceElement.classList.contains('vacant') && spaceElement.id.includes('user'));
    playerRackSpaces.forEach((spaceElement, s) => {
      const spaceRect = spaceElement.getBoundingClientRect();
      const distanceX = cursorPositionX - (spaceRect.x + (spaceRect.width / 2));
      const distanceY = cursorPositionY - (spaceRect.y + (spaceRect.width / 2));
      const targetedX = Math.abs(distanceX) <= spaceRect.width / 2;
      const targetedY = Math.abs(distanceY) <= spaceRect.height / 2;
      if (targetedX && targetedY) {
        result.targetedId = spaceElement.id;
        result.position = distanceX < 0 ? 'before' : 'after';
      }
    });
    return result;
  }

  function findTargetedBoardSpaceId(cursorPositionX, cursorPositionY) {
    let result;
    let spaceOccupied = false;
    [...document.getElementsByClassName('dropzone')].filter(spaceElement => spaceElement && !spaceElement.classList.contains('on-rack')).forEach((spaceElement) => {
      const spaceRect = spaceElement.getBoundingClientRect();
      const matrixX = parseInt(spaceElement.id.split('-')[0]) - 1;
      const matrixY = parseInt(spaceElement.id.split('-')[1]) - 1;
      // const occupied = letterMatrix[matrixX][matrixY].contents !== null;
      const occupied = letterMatrix[matrixY][matrixX].contents !== null;

      if (spaceElement) {
        const targetedX = cursorPositionX > spaceRect.x && cursorPositionX < (spaceRect.x + spaceRect.width);
        const targetedY = cursorPositionY > spaceRect.y && cursorPositionY < (spaceRect.y + spaceRect.height);
        if (targetedX && targetedY) {
          if (occupied) {
            spaceOccupied = true;
          } else {
            result = spaceElement.id;
          }
        }
      }
    });
    return result || spaceOccupied;
  }

  function insertRackTile(originalIndex, newIndex) {
    const newPlayerRack = [...playerRack];
    const replacingTileObj = newPlayerRack[originalIndex];
    newPlayerRack.splice(originalIndex, 1);
    newPlayerRack.splice(newIndex, 0, replacingTileObj);
    setPlayerRack(newPlayerRack);
  }

  function handleSelectBlankLetter(selectedLetter) {
    const newPlayerRack = [...playerRack];
    const blankTileObj = newPlayerRack.filter(tile => tile.id === editingBlank)[0];
    blankTileObj.letter = selectedLetter;
    newPlayerRack[newPlayerRack.indexOf(blankTileObj)] = blankTileObj;
    setPlayerRack(newPlayerRack);
    setLetterMatrix([...letterMatrix]);
    setEditingBlank(undefined);
    dismissModal();
  }

  function getRowsFromColumns(matrix) {
    const newMatrix = [];
    matrix.forEach((row, r) => {
      row.forEach((item, i) => {
        if (!newMatrix[i]) {
          newMatrix[i] = [];
        }
        newMatrix[i][r] = item;
      });
    });
    return newMatrix;
  }

  function extractWordsFromRow(row, rowIndex, rotate) {
    const words = [];
    let lastWordStartIndex = undefined;
    row.forEach((space, s) => {
      if (space.contents && s < 14) {
        if (lastWordStartIndex === undefined) {
          lastWordStartIndex = s;
        }
      } else if (!space.contents || (space.contents && (s === 14))) {
        if (lastWordStartIndex !== undefined) {
          const extractedWord = row.slice(lastWordStartIndex, s + 1).filter(tile => tile.contents).map(tile => tile.contents.letter);
          if (extractedWord.length > 1) {
            const wordSpaceArray = [];
            const specialSpaces = [];
            const lockedData = [];
            let wordScoreMultiplier = 1;
            let wordId = [];
            for (let i = 0; i < extractedWord.length; i++) {
              let currentTileObj, currentSpaceSpecial;
              if (rotate) {
                currentTileObj = getRowsFromColumns([...letterMatrix])[rowIndex][lastWordStartIndex + i];
                currentSpaceSpecial = fullBoard[rowIndex][lastWordStartIndex + i][0];
              } else {
                currentTileObj = [...letterMatrix][rowIndex][lastWordStartIndex + i];
                currentSpaceSpecial = fullBoard[rowIndex][lastWordStartIndex + i][0];
              }
              let newTileObj = { ...currentTileObj };
              if (newTileObj.contents.locked) {
                currentSpaceSpecial = undefined;
              }
              if (currentSpaceSpecial === 'dw') { wordScoreMultiplier >= 2 ? wordScoreMultiplier += 2 : wordScoreMultiplier = 2; }
              if (currentSpaceSpecial === 'tw') { wordScoreMultiplier >= 3 ? wordScoreMultiplier += 3 : wordScoreMultiplier = 3; }
              newTileObj = {
                ...newTileObj,
                specialSpace: currentSpaceSpecial,
              };
              wordSpaceArray.push(newTileObj);
              wordId.push(currentTileObj.contents.id);
              lockedData[i] = currentTileObj.contents.locked;
              specialSpaces[i] = currentSpaceSpecial;
            }
            wordId = wordId.join('+');

            const wordObj = {
              word: extractedWord.join(''),
              wordId: wordId,
              specialSpaces: specialSpaces,
              lockedData: lockedData,
              spaces: wordSpaceArray,
              wordScoreMultiplier: wordScoreMultiplier,
              startingSpace: {
                row: rowIndex,
                column: lastWordStartIndex,
              },
              endingSpace: {
                row: rowIndex,
                column: lastWordStartIndex + extractedWord.length - 1,
              },
            };
            words.push(wordObj);
          }
          lastWordStartIndex = undefined;
        }
      }
    });
    const result = words.length ? words : undefined;
    return result;
  }

  function getArrayFromColumn(columnIndex, arr) {
    const columnArray = [];
    const totalRows = arr.length;
    for (let i = 0; i < totalRows; i++) {
      columnArray[i] = arr[i][columnIndex];
    }
    return columnArray;
  }

  function getWordsFromBoard() {
    const matrixCopy = [...letterMatrix];
    // const turnedMatrixCopy = getRowsFromColumns(matrixCopy);
    const horizontalWords = [];
    const verticalWords = [];
    matrixCopy.forEach((row, r) => {
      const rowWords = extractWordsFromRow(row, r);
      if (rowWords) {
        horizontalWords.push(...rowWords);
      }
      const columnArray = getArrayFromColumn(r, matrixCopy);
      const columnWords = extractWordsFromRow(columnArray, r, true);
      if (columnWords) {
        verticalWords.push(...columnWords);
      }
    });
    const newWordList = {
      horizontal: horizontalWords,
      vertical: verticalWords,
    };
    setWordsOnBoard(newWordList);
    const nextNewWords = getNewWords(newWordList);
    setNewWords(nextNewWords);
    const playerTileWords = nextNewWords.filter(wordObj => !wordObj.spaces.every(spaceObj => spaceObj.contents.locked));
    const newWordScoreTile = getWordScoreTile(playerTileWords);
    if (newWordScoreTile) {
      setWordScoreTileId(newWordScoreTile.contents.id);
    }
    return nextNewWords;
  }

  function getNewWords(wordList) {
    const boardWordsCopy = { ...wordList };
    const previousWordsCopy = { ...previousWordList };
    const previousHorizontalWordIdArray = previousWordsCopy.horizontal.map(wordObj => wordObj.wordId);
    const newHorizontal = boardWordsCopy.horizontal.length ? boardWordsCopy.horizontal.filter((wordObj, w) =>
      !previousHorizontalWordIdArray.includes(wordObj.wordId)
    ) : [];
    const previousVerticalWordIdArray = previousWordsCopy.vertical.map(wordObj => wordObj.wordId);
    const newVertical = boardWordsCopy.vertical.length ? boardWordsCopy.vertical.filter((wordObj, w) =>
      !previousVerticalWordIdArray.includes(wordObj.wordId)
    ) : [];
    return [...newHorizontal, ...newVertical];
  }

  function getWordScoreTile(wordSpaceArr) {
    let furthestRightLowerSpace;
    let highestCoordTotal = 0;
    wordSpaceArr.forEach(wordObj => {
      const lastLetterSpace = wordObj.spaces[wordObj.spaces.length - 1];
      const totalCoords = lastLetterSpace.coords.x + lastLetterSpace.coords.y;
      if (totalCoords > highestCoordTotal) {
        highestCoordTotal = totalCoords;
        furthestRightLowerSpace = lastLetterSpace;
      }
    });
    return furthestRightLowerSpace;
  }

  function scoreWord(wordObj) {
    const multipliers = {
      'dl': 2,
      'tl': 3,
      'dw': 1,
      'tw': 1,
    };
    let score = 0;
    wordObj.spaces.forEach(spaceObj => {
      let multiplier = spaceObj.specialSpace ? multipliers[spaceObj.specialSpace] : 1;
      const tileScore = spaceObj.contents.value * multiplier;
      // console.log('score for', spaceObj.contents.letter, tileScore, '(', spaceObj.contents.value, ' x ', multiplier, ')');
      score += tileScore;
    });
    const subTotal = score;
    const finalScore = score *= wordObj.wordScoreMultiplier;
    // console.warn('final score', finalScore, `(${subTotal} x ${wordObj.wordScoreMultiplier})`)
    return finalScore;
  }

  function handleSignOut() {
    signOut(auth).then(() => {
      console.warn('--------------------> signed out!');
    }).catch((error) => {
      console.error('--------------------> FAILED to sign out!');
    });
  }

  const placedTiles = [...playerRack].filter(tile => tile.placed);
  const lockedTiles = [...letterMatrix].flat().filter(space => space.contents && space.contents.locked);

  const horizontalWordList = Object.values(wordsOnBoard.horizontal).map(wordObj => wordObj.word);
  const verticalWordList = Object.values(wordsOnBoard.vertical).map(wordObj => wordObj.word);

  const newWordList = newWords.map(wordObj => `${wordObj.word} (${scoreWord(wordObj)})`);
  // const newWordList = newWords.map(wordObj => `${wordObj.word}`);
  let totalViolations = 0;
  unpronouncableWords.forEach(violationObj => {
    totalViolations += violationObj.violations.violations.length;
  });

  return (
    <div>
      {<div className={'debug'}>
        <div className={'debug-row'}>
          <div>Selected:</div>
          <div>
            {selectedTileId ?
              `${document.getElementById(selectedTileId).innerText}` :
              `none`
            }
          </div>
        </div>
        <div className={'debug-row'}>
          <div>Target:</div>
          <div>
            {targetedSpaceId ?
              `${targetedSpaceId}` :
              `none`
            }
          </div>
        </div>
        <p>&nbsp;</p>
        <div className={'debug-row'}>
          <div>All neighbored:</div>
          <div id='neigbored-display'></div>
        </div>
        <div className={'debug-row'}>
          <div>Placed in line:</div>
          <div id='in-line-display'></div>
        </div>
        <div className={'debug-row'}>
          <div>Touching/on center:</div>
          <div id='touching-locked-display'></div>
        </div>
        <div className={'debug-row'}>
          <div style={{ fontWeight: 'bold' }} >Submit ready:</div>
          <div style={{ fontWeight: 'bold' }} id='submit-ready-display'></div>
        </div>
        <p>&nbsp;</p>
        <div className={'debug-row'}>
          <div>Horiz. words:</div>
          <div>{horizontalWordList.join(' ')}</div>
        </div>
        <div className={'debug-row'}>
          <div>Vert. words:</div>
          <div>{verticalWordList.join(' ')}</div>
        </div>
        <div className={'debug-row'}>
          <div style={{ fontWeight: 'bold' }} >New words:</div>
          <div style={{ fontWeight: 'bold' }} >{newWordList.join(' ')}</div>
        </div>
        <div className={'debug-row'}>
          <div style={{ fontWeight: 'bold' }} >Violating words:</div>
          <div style={{ fontWeight: 'bold' }} >{unpronouncableWords.map(violatorObj => violatorObj.wordObj.word + '').join(' ')}</div>
        </div>
        <p>&nbsp;</p>
        <div className={'debug-row'}>
          <div>Pending score:</div>
          <div>{pendingTurnScore}</div>
        </div>
      </div>}
      <Head>
        <title>Skrubble.live</title>
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link href="https://fonts.googleapis.com/css2?family=Aladin&family=Bangers&display=swap" rel="stylesheet"></link>
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
                <div className={`player-turn-area user${currentTurn === 'user' ? ' current-turn' : ''}`}>
                  <UserIcon user={user} size='large' />
                  <div className='player-score'>{userScore}</div>
                </div>
                <div className={`player-turn-area opponent${currentTurn === 'opponent' ? ' current-turn' : ''}`}>
                  <UserIcon user={opponent} size='large' />
                  <div className='player-score'>{opponentScore}</div>
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
              {/* {(submitReady && !selectedTileId) ? <WordScoreDisplay */}
              <WordScoreDisplay
                pendingTurnScore={pendingTurnScore}
                // targetTileObj={[...playerRack].filter(tile => tile.id === wordScoreTileId)[0]}
                wordScoreTileId={wordScoreTileId}
                submitReady={submitReady}
              />

              <div className='player-area user'>
                <div className='rack-area'>
                  <Rack
                    owner={'user'}
                    tiles={playerRack}
                    selectedTileId={selectedTileId}
                    targetedSpaceId={targetedSpaceId}
                  />
                </div>
                <div className='user-button-area'>
                  <Button label='Menu' clickAction={() => null} />
                  <Button disabled={!submitReady || !placedTiles.length || (placedTiles.length < 2 && lockedTiles.length === 0)} color='green' label='Submit' clickAction={submitTiles} />
                  {playerRack.every(tile => !tile.placed && !tile.selected) ?
                    <Button label='Shuffle' clickAction={shuffleUserTiles} />
                    :
                    <Button label='&#8595;&#8595;' clickAction={returnUserTiles} />
                  }
                  <Button size='small' label={`Word Rules`} clickAction={() => toggleModal('rules')} />
                  <Button disabled={!unpronouncableWords.length} size='small' label={`See Violations${totalViolations ? ' (' + totalViolations + ')' : ''}`} clickAction={() => toggleModal('violations')} />
                  <Button size='small' label={`Bag (${bag.length})`} clickAction={() => toggleModal('bag')} />
                </div>
              </div>
              <BagModal bag={bag} showing={modalShowing === 'bag'} dismissModal={() => toggleModal()} />
              <BlankModal bag={bag} showing={modalShowing === 'blank'} dismissModal={handleSelectBlankLetter} />
              <RulesModal wordRules={wordRules} showing={modalShowing === 'rules'} dismissModal={() => toggleModal()} />
              <ViolationsModal wordRules={wordRules} unpronouncableWords={unpronouncableWords} showing={modalShowing === 'violations'} dismissModal={() => toggleModal()} />
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
        <footer><a href='https://github.com/eggborne/skrubble'>View source on GitHub</a></footer>
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
          opacity: ${loaded ? 1 : 0};
          transition: opacity 500ms ease;
        }
        #home-container {
          position: relative;
          flex-grow: 1;
          display: grid;
          grid-template-columns: 1fr;
          grid-template-rows: min-content calc(var(--rack-height) * 1.75) min-content 1fr;

          & > .turn-display-area {
            display: flex;
            align-items: stretch;
            justify-content: center;
            padding: 2.5%;
            padding-top: 0;
            gap: 2.5%;
            
            & > .player-turn-area {
              width: 50%;
              display: flex;
              flex-direction: row;
              align-items: center;
              justify-content: space-evenly;
              border-radius: calc(var(--racked-tile-size) / 4);
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
            align-items: center;
            pointer-events: none;
            width: 100%;

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
                background: linear-gradient(
                  180deg, 
                  rgba(194,123,0) 0%, 
                  rgba(208,147,74) calc(var(--racked-tile-size) * 0.5), 
                  rgba(183,130,0) calc(var(--racked-tile-size) * 0.6) ,
                  rgba(183,130,0) 100%
                );
                box-shadow: 
                  0 0 calc(var(--board-size) / 96) #00000099,
                  0 0 calc(var(--board-size) / 150) #000000aa inset
                ;
                border: 1px solid black;
                border-radius: calc(var(--racked-tile-size) / 4) calc(var(--racked-tile-size) / 4) 0 0 !important;
                z-index: 0;
              }

              & > .user-button-area {
                width: 95%;
                display: grid;
                grid-template-columns: 25% 1fr 25%;
                grid-template-rows: 1fr 1fr;
                align-items: center;
                align-self: center;
                margin-top: calc(var(--rack-height) / 1.25);
                justify-content: center;
                gap: 0 calc(var(--rack-height) / 4);
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

        footer {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 2rem;
          background-color: #00000099;
          color: #aaa;
          font-size: 0.8rem;
          display: flex;
          align-items: center;
          justify-content: center; 
          opacity: ${user ? '0' : '1'};
          pointer-events: ${user ? 'none' : 'all'};
          transition: opacity 500ms ease;
        }
      `}</style>

      <style jsx global>{`
        {/* @import url('https://fonts.googleapis.com/css2?family=Aladin&family=Bangers&display=swap'); */}
        :root {
          --actual-height: 100dvh;
          --board-size: 100vw;
          --header-height: ${user ? '2.5rem' : '18vw'};
          --main-padding: 0px;
          --large-icon-size: calc(var(--racked-tile-size) * 1.5);
          --rack-height: calc(var(--board-size) / 10);
          --rack-width: 98vw;
          --title-tile-size: calc(var(--header-height) * 0.6);
          --title-font-size: calc(var(--title-tile-size) / 1.5);
          --racked-tile-size: calc(var(--rack-width) / 7.5);
          --played-tile-size: calc(var(--board-size) / 16.5);
          --bag-display-tile-size: calc(var(--played-tile-size) * 1.85);
          --rack-board-tile-ratio: 0.475;
          --racked-tile-gap-size: calc(var(--racked-tile-size) / 16);
          --grabbed-tile-scale: 1.4;
          --board-outline-size: calc(var(--board-size) / 160);
          --footer-height: 3rem;
          --button-height: 3.5rem;
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
          font-family: sans-serif;
          background-color: black;
          color: var(--main-text-color);
          user-select: none;
        }

        h1, h2, h3, h4 {
          padding: 0;
          margin: 0;
        }

        a {
          text-decoration: none;
          color: #aa99aa;

          &:hover {
            color: #ffaaff;
          }
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
          top: 0;
          right: 0;
          min-width: 14rem;
          max-width: 14rem;
          padding: 1rem;
          display: flex;
          flex-direction: column;
          align-items: stretch;
          gap: 0.25rem;
          background: #999999dd;
          color: black;
          z-index: 4;
          pointer-events: none;
          display: ${debugMode ? 'flex' : 'none'};
          // opacity: 0;

          & > .debug-row {
            display: flex;
            justify-content: space-between;
            gap: 1rem;
            border-bottom: 1px solid black;
            padding: 0.15rem;

            &:last-of-type {
              border: 0;
            }
          }
        }

        @keyframes bounce {
          from {
            transform: scale(1);
          }
          to {
            transform: scale(1.05);
          }
        }
        @keyframes dip {
          from {
            transform: scale(1);
          }
          to {
            transform: scale(0.95);
          }
        }

        @media screen and (orientation: portrait) and (min-aspect-ratio: 0.55) {
          :root {
            --board-size: 49vh;
            // --racked-tile-size: 7vh;
            --racked-tile-size: 13vw;
            --large-icon-size: calc(var(--racked-tile-size) * 1);
            --header-height: calc(var(--racked-tile-size) * 0.5);
          }

          header {
            // display: none !important;
            padding: 1% !important;
          }

          #user-rack {
            background-color: transparent;
            box-shadow: none;
            border: none;
            & > .shelf {
              display: none;
            }
          }
        }

        @media screen and (orientation: landscape) {
          :root {
            --header-height: ${user ? '2.5rem' : '5rem'};
            --main-padding: 1rem;
            --board-size: calc((var(--actual-height) - var(--header-height)) - var(--main-padding));
            --title-tile-size: calc(var(--header-height) * 0.85);
            --title-font-size: calc(var(--title-tile-size) / 2);
            --bag-display-tile-size: calc(var(--played-tile-size) * 1.5);
            --rack-height: calc(var(--board-size) / 12);
            --rack-width: calc(var(--rack-height) * 9);
            --rack-board-tile-ratio: 0.61;
          }

          header {
            background-color: transparent;
          }

          #home-container.container {
            grid-template-columns: 1fr var(--board-size);
            grid-template-rows:  0.65fr 1fr 1fr;
            gap: 0 calc(var(--racked-tile-size) / 3);
          }

          .player-area {
            padding: 0 var(--main-padding);
            grid-column-start: 1;

            &.opponent {
              grid-row:-start: 1;
            }
            &.user {
              grid-column-start: 1;
            }
          }

          .turn-display-area {
            padding: 2.5% 0 !important;
          }

          .game-board {
            grid-column-start: 2;
            grid-row-start: 1;
            grid-row-end: 4;
            align-self: center;
            justify-self: center;

          }
        }

        @media screen and (orientation: landscape) and (max-aspect-ratio: 5.2/3) {
          :root {
            --board-size: 50vw;
          }
        }
      `}</style>
    </div>
  );
}
