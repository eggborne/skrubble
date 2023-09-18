import { useEffect, useMemo, useState } from 'react';
import { subscribeToList } from '../scripts/firebase';


export default function AdminScreen() {
  const [visitors, setVisitors] = useState([]);
  const [gameSessions, setGameSessions] = useState([]);
  const [userListUpdated, setUserListUpdated] = useState(false);
  const [gameSessionListUpdated, setGameSessionListUpdated] = useState(false);

  function getDisplayNameById(id) {
    let visitorWithIdArr = [...visitors].filter(v => v.uid === id);
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
    console.error('initial useEffect ran -------------------------------------------------------------------------');
    startLobbySubscription();
    startGamesSubscription();
  }, []);

  const sortedUserArray = useMemo(() => [...visitors].sort((a, b) => a.displayName.localeCompare(b.displayName)), [visitors]);

  return (
    <div className='admin-screen'>
      {visitors.length > 0 ?
        <>
          <div className={`table-row-list${userListUpdated ? ' updated' : ''}`}>
            <h2>Users {visitors.length ? `(${visitors.length})` : ''}</h2>
            {visitors.length &&
              <div className='sublist users'>
                {sortedUserArray.map(visitorObj => {
                  return (
                    <div style={{ opacity: visitorObj.currentLocation === 'away' ? 0.5 : 1 }} key={`visitor-${visitorObj.uid}`} className='table-row-listing'>
                      <div className='display-name-area'>
                        <div>{visitorObj.displayName}</div>
                        <div>{visitorObj.uid}</div>
                      </div>
                      <div className='user-photo-area'>
                        <img alt={visitorObj.photoUrl} className='user-photo' src={`https://skrubble.live/${visitorObj.photoUrl}`} />
                      </div>
                      {Object.keys(visitorObj).map(key => {
                        let printedValue = visitorObj[key];
                        if (key.includes('Challenges')) {
                          printedValue = printedValue.length;
                        }                        
                        return (<div key={`lobby-user-column-${key}`} className={`table-cell`}>
                          <div className='table-cell-label'>{key}</div>
                          <div className='table-cell-value'>{printedValue}</div>
                        </div>);
                      })}
                    </div>
                  );
                })}
              </div>
            }
          </div>
          <div className={`table-row-list${gameSessionListUpdated ? ' updated' : ''}`}>
            <h2>Active Games{gameSessions.length > 0 ? ` (${gameSessions.length})` : ''}</h2>
            {gameSessions.length ?
              gameSessions.map(gameObj => {
                console.log('mapping gameObj', gameObj);
                const instigatorName = getDisplayNameById(gameObj.instigator);
                const respondentName = getDisplayNameById(gameObj.respondent);
                return (
                  <div className='sublist games'>
                    <div key={`game-session-${gameObj.sessionId}`} className='table-row-listing'>
                      <div className='display-name-area'>
                        <div>{instigatorName} vs. {respondentName}</div>
                        <div>{gameObj.sessionId}</div>
                      </div>
                      <div className={`table-cell`}>
                        <div className='table-cell-label'>{'players'}</div>
                        <div className='table-cell-value'>{instigatorName}{<br />} vs. {<br />}{respondentName}</div>
                      </div>
                      {Object.keys(gameObj).map(key => {
                        let printedValue = gameObj[key];
                        if (key === 'bag') {
                          printedValue = gameObj[key].length;
                        } else if (key.includes('Rack')) {
                          printedValue = printedValue.length;
                        } else {
                          if (!key.includes('uid') && gameObj[key].length > 15) {
                            printedValue = getDisplayNameById(printedValue);
                          }
                        }

                        return (<div key={key} className={`table-cell`}>
                          <div className='table-cell-label'>{key}</div>
                          <div className='table-cell-value'>{printedValue}</div>
                        </div>);
                      }
                      )}
                    </div>
                  </div>
                );
              }) :
              <div className='empty-message'>{'no active games'}</div>
            }
          </div>
        </> :
        <div className='loading-message'>{'loading...'}</div>
      }

      <style jsx global>{`
        html,
        body {
          --text-stroke: 
            1px 1px 0.1rem #000000,
            -1px 1px 0.1rem #000000,
            -1px -1px 0.1rem #000000,
            1px -1px 0.1rem #000000
          ;
          margin: 0;
          font-family: sans-serif;
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
          box-sizing: border-box;
          font-size: 14px;
          padding: 3rem 1rem;          
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          gap: 2rem;
          background-color: #223;
          color: #aaa;

          & .empty-message, & .loading-message {
            text-align: center;
            font-size: 1.5rem;
            opacity: 0.5;
          }
          & .loading-message {
            margin-top: 6rem;
            font-weight: bold;
          }

          & .display-name-area {
            box-sizing: border-box;
            position: absolute;
            top: calc((2rem + 12px) * -1);
            left: 0;
            padding: 4px;
            font-size: 2rem;
            text-shadow: var(--text-stroke);
            font-weight: bold;
            background-color: #00002299;
            
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: space-between;

            & > div:last-child {
              font-size: 1.25rem;
            }
          }

          & > .table-row-list {
            display: flex;
            flex-direction: column;
            align-items: stretch;
            gap: 0.75rem;
            width: 100%;
            max-width: 100dvw;
            
            &.updated {
              background-color: #aaffff04;
            }

            & > h2 {
              padding: 0 1rem;
              font-size: 2rem;
              text-shadow: var(--text-stroke);
            }

            & > .sublist {
              display: flex;
              flex-direction: column;
              gap: 1.5rem;
              padding: 0.5rem;

              &.users {                

                &.title {                                    
                  & > .table-row-listing {
                    background-color: #f1bbaa22;
                  }
                }  

                &.lobby {
                  & > .table-row-listing {
                    background-color: #aaffaa22;
                  }
                }              

                &.in-game {
                  & > .table-row-listing {
                    background-color: #00ff0022;
                  }
                }
              }        
              
              & > .table-row-listing {
                position: relative;
                background-color: #ffffff15;
                border-radius: inherit;
                display: flex;
                justify-content: space-between;
                height: 5rem;

                margin-top: 2.5rem;

                &:nth-of-type(odd) {
                  background-color: #ffffff15;
                }                

                & > .user-photo-area {
                  min-width: 4rem;
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
                    background-color: #00002299;
                    font-size: 0.85rem;
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
        }
      `}</style>

    </div>
  );
}