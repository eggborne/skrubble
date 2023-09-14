import { useEffect, useState } from 'react';
import { subscribeToList } from '../scripts/firebase';


export default function AdminScreen() {
  const [visitors, setVisitors] = useState([]);
  const [gameSessions, setGameSessions] = useState([]);
  const [userListUpdated, setUserListUpdated] = useState(false);
  const [gameSessionListUpdated, setGameSessionListUpdated] = useState(false);

  function getDisplayNameById(id) {
    console.log('getting from vis', [...visitors]);
    let visitorWithIdArr = [...visitors].filter(v => v.visitorId === id);
    console.log('visitorArr?', visitorWithIdArr)
    return visitorWithIdArr.length > 0 ? visitorWithIdArr[0].displayName : '';
  }

  async function startLobbySubscription() {
    let userData;
    const newUserList = await subscribeToList('users', async (snapshot) => {
      userData = await snapshot.val();
      userData = userData ? Object.values(userData) : [];
      setVisitors(userData);
      return userData;
    });
    return newUserList;
  }

  async function startGamesSubscription() {
    let sessionData;
    const newGamesData = await subscribeToList(`game-sessions`, async (snapshot) => {
      sessionData = await snapshot.val();
      console.warn('initially got', sessionData);
      sessionData = sessionData ? Object.values(sessionData) : [];
      console.warn('game sub got new sessiondata', sessionData);
      setGameSessions(sessionData);
      return sessionData;
    });
    return newGamesData;
  }

  useEffect(() => {
    console.warn('initial useEffect ran -------------------------------------------------------------------------');
    startLobbySubscription();
    startGamesSubscription();
  }, []);

  return (
    <div className='admin-screen'>
      <div className={`table-row-list${userListUpdated ? ' updated' : ''}`}>
        <h2>Users</h2>
        {visitors.length ?
          visitors.map(visitorObj => {
            return (
              <div key={`visitor-${visitorObj.visitorId}`} className='table-row-listing'>
                <div className='user-photo-area'>
                  <img alt={visitorObj.photoUrl} className='user-photo' src={`https://skrubble.live/${visitorObj.photoUrl}`} />
                </div>
                {Object.keys(visitorObj).filter(k => k !== 'photoUrl').map(key =>
                  <div key={key} className={`table-cell${key.includes('Id') ? ' uid' : ''}`}>
                    <div className='table-cell-label'>{key}</div>
                    <div className='table-cell-value'>{visitorObj[key]}</div>
                  </div>
                )}
              </div>
            );
          })
          :
          <div>{'no users'}</div>
        }
      </div>
      <div className={`table-row-list${gameSessionListUpdated ? ' updated' : ''}`}>
        <h2>Games</h2>
        {gameSessions.length ?
          gameSessions.map(gameObj => {
            console.log('mappion gameObj', gameObj)
            return (
              <div key={`game-session-${gameObj.sessionId}`} className='table-row-listing'>
                <div className={`table-cell`}>
                  <div className='table-cell-label'>{'players'}</div>
                  <div className='table-cell-value'>{`${getDisplayNameById(gameObj.userId)} vs. ${getDisplayNameById(gameObj.opponentId)}`}</div>
                </div>
                {Object.keys(gameObj).map(key => {                  
                  let printedValue = gameObj[key];
                  if (typeof gameObj[key] !== 'string') {
                    printedValue = gameObj[key].length;                  
                  }
                  if (key === 'currentTurn') {
                    printedValue = getDisplayNameById(printedValue);
                  }

                  return (<div key={key} className={`table-cell${key.includes('Id') ? ' uid' : ''}`}>
                    <div className='table-cell-label'>{key}</div>
                    <div className='table-cell-value'>{printedValue}</div>
                  </div>);
                  }
                )}
              </div>
            );
          })
          :
          <div>{'no games'}</div>
        }
      </div>

      <style jsx global>{`
        html,
        body {
          margin: 0;
          font-family: sans-serif;
          background-color: black;
          color: var(--main-text-color);
          user-select: none;
        }
        body {
          display: flex;
          flex-direction: column;
          align-items: stretch;
        }
      `}</style>
      <style jsx>{`
        .admin-screen {
          font-size: 14px;
          padding: 1rem;
          
          min-height: 100dvh;
          display: flex;
          flex-direction: column;
          gap: 2rem;
          background-color: #232;
          color: #aaa;

          & > .table-row-list {
            display: flex;
            flex-direction: column;
            align-items: stretch;
            gap: 1rem;
            width: max-content;
            width: 100%;

            &.updated {
              background-color: #aaffff04;
            }

            & > h2 {
              text-align: center;
            }

            & > .table-row-listing {
              background-color: #ffffff15;
              border-radius: inherit;
              display: flex;
              justify-content: space-between;
              height: 4rem;

              &:nth-of-type(odd) {
                background-color: #ffffff15;
              }

              & > .user-photo-area {
                width: 4.5rem;
                display: flex;
                align-items: center;
                justify-content: center;

                & > img.user-photo {
                  width: 3rem;
                  height: 3rem;
                }
              }

              & > .table-cell {
                display: flex;
                flex-direction: column;
                flex-grow: 1;
                overflow: hidden;   
                width: 6rem;      

                & > * {
                  padding: 0.5rem;
                }

                & > .table-cell-label {
                  background-color: #000000aa;
                  font-size: 0.75rem;
                  padding: 1px 2px;
                }

                & > .table-cell-value {
                  word-wrap: break-word;
                }

                &.uid {
                  
                  & > .table-cell-value {
                    font-size: 0.6rem;
                  }
                }

                &:nth-of-type(odd) {
                  background-color: #00000015;
                }
              }
            }
          }
        }
      `}</style>

    </div>
  );
}