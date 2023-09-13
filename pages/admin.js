import { useEffect, useState } from 'react';
import { getAllVisitors, getAllGameSessions } from '../scripts/db';
import { pause } from '../scripts/util';

let VISITOR_POLL_RATE = 500;
let USER_POLL;
let SESSION_POLL;

export default function AdminScreen() {
  const [visitors, setVisitors] = useState([]);
  const [gameSessions, setGameSessions] = useState([]);
  const [userPoll, setUserPoll] = useState();
  const [sessionPoll, setSessionPoll] = useState();
  const [waitingForData, setWaitingForData] = useState(false);
  const [apiCalls, setApiCalls] = useState(0);
  const [userListUpdated, setUserListUpdated] = useState(false);
  const [gameSessionListUpdated, setGameSessionListUpdated] = useState(false);

  async function refreshVisitors() {
    if (!waitingForData) {
      setWaitingForData(true);
      setUserListUpdated(true);
      const visitorQuery = await getAllVisitors();      
      const visitorList = visitorQuery.data[0];
      console.log('refreshVisitors got', visitorList);
      setVisitors(visitorList);
      setUserListUpdated(false);
      // await pause(Math.round(VISITOR_POLL_RATE / 2));
      setWaitingForData(false);
    }
  }
  async function refreshGameSessions() {
    console.warn('calling refreshGameSessions');
    if (!waitingForData) {
      setGameSessionListUpdated(true);
      const sessionQuery = await getAllGameSessions();
      const sessionList = sessionQuery.data[0];
      console.log('refreshGameSessions got', sessionList);
      setGameSessions(sessionList);
      // await pause(Math.round(VISITOR_POLL_RATE / 2));
      setGameSessionListUpdated(false);
    } else {
      console.error('game session did not refresh due to still waiting');
    }
  }

  useEffect(() => {
    clearTimeout(USER_POLL);

    USER_POLL = setTimeout(async () => {
      await refreshVisitors();
      refreshGameSessions();
      setApiCalls(apiCalls + 2);
    }, VISITOR_POLL_RATE);

  }), [visitors, gameSessions];

  return (
    <div className='admin-screen'>
      <h2>Administrator panel</h2>
      <div className={`table-row-list${userListUpdated ? ' updated' : ''}`}>
        <h1>Users</h1>
        {visitors.length ?
          visitors.map(visitorObj => {
            return (
              <div key={`visitor-${visitorObj.visitorId}`} className='table-row-listing'>
                {Object.keys(visitorObj).map(key =>
                  <div key={key} className='table-cell'>
                    <div className='table-cell-label'>{key}</div>
                    <div className='table-cell-value'>{visitorObj[key]}</div>
                  </div>
                )}
              </div>
            );
          })
          :
          <div>loading...</div>
        }
      </div>
      <div className={`table-row-list${gameSessionListUpdated ? ' updated' : ''}`}>
        <h1>Game Sessions</h1>
        {gameSessions.length ?
          gameSessions.map(gameObj => {
            return (
              <div key={`game-session-${gameObj.visitorId}`} className='table-row-listing'>
                {Object.keys(gameObj).map(key =>
                  <div key={key} className='table-cell'>
                    <div className='table-cell-label'>{key}</div>
                    <div className='table-cell-value'>{gameObj[key]}</div>
                  </div>
                )}
              </div>
            );
          })
          :
          <div>loading...</div>
        }
      </div>

      <div className='call-indicator'>
        <div>POLL RATE</div><div>{VISITOR_POLL_RATE}</div>
        <div>API CALLS:</div><div>{apiCalls}</div>
        <div>waiting:</div><div>{waitingForData ? 'true' : 'false'}</div>
        <div>Users updating:</div><div>{userListUpdated ? 'true' : 'false'}</div>
        <div>Sessions updating:</div><div>{gameSessionListUpdated ? 'true' : 'false'}</div>
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
      `}</style>
      <style jsx>{`
        .admin-screen {
          font-size: 13px;
          box-sizing: border-box;
          padding:1rem  4rem;
          max-width: 100vw;
          min-height: 100dvh;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          background-color: #334433;
          color: #aaa;

          & > .call-indicator {
            padding: 1rem;
            position: absolute;
            top: 1rem;
            right: 1rem;
            width: 10rem;
            background-color: black;
            color: white;
            font-size: 14px;
            display: grid;
            grid-template-columns: max-content 2rem;
            gap: 0 1rem;

            & > div {
              text-align: right;
            }
          }

          & > .table-row-list {
            display: flex;
            flex-direction: column;
            align-items: stretch;
            gap: 0.5rem;
            background-color: #00000011;
            padding: 1rem;
            border-radius: 0.25rem;
            width: max-content;
            max-width: 100vw;

            &.updated {
              background-color: #aaffff04;
            }

            & > .table-row-listing {
              background-color: #ffffff15;
              border-radius: inherit;
              display: flex;
              justify-content: space-between;

              &:nth-of-type(odd) {
                background-color: #ffffff15;
              }

              & > .table-cell {
                display: flex;
                flex-direction: column;
                flex-grow: 1;
                max-width: 12vw; 
                overflow: hidden;                       

                & > * {
                  padding: 0.5rem;
                }
                & > .table-cell-label {
                  background-color: #000000aa;
                }
                & > .table-cell-value {
                  word-wrap: break-word;
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