import { useEffect, useMemo, useState } from "react";
import Button from "./Button";

export default function LobbyScreen(props) {
  console.warn('LobbyScreen props', props);
  const [revealed, setRevealed] = useState();

  useEffect(() => {
    if (!revealed) {
      setRevealed(true);
    }
    return () => {
      if (revealed) {
        console.error('LEAVING LOBBY in LobbyScreen useEffect callback!!!!!!!!!!!!!!!!');
      }
    };
  }, [revealed]);

  function onClickRequestGame(selectedVisitorId) {
    console.log('LobbyScreen.onClickRequestGame ---------------------- clicked visitorId', selectedVisitorId);
    props.handleClickRequestGame(selectedVisitorId);
  }

  function onClickCancelRequest(selectedVisitorId) {
    props.handleClickCancelRequest(selectedVisitorId);
  }

  function onClickJoinGame(gameSessionId) {
    props.handleClickJoinGame(gameSessionId);
  }

  const allUsers = useMemo(() => {
    if (props.visitors.length > 0) {
      const selfObj = props.visitors.filter(v => v.visitorId === props.user.uid)[0] || undefined;
      console.log('selfObj', selfObj, props.visitors);
      const nonSelfVisitors = props.visitors.filter(v => v.visitorId !== props.user.uid).sort((a, b) => a.displayName.localeCompare(b.displayName));
      const preparedArray = nonSelfVisitors.length > 0 ? [selfObj, ...nonSelfVisitors] : selfObj ? [selfObj] : [];
      console.log('preparedArray', preparedArray);
      return preparedArray;
    } else {
      return [];
    }
  }, [props.visitors]);

  const pendingIncomingChallengeList = useMemo(() => {
    return props.visitors.filter(v => v.visitorId !== props.user.uid && v.pendingOutgoingChallenges && v.pendingOutgoingChallenges.includes(props.user.uid));
  }, [props.visitors]);

  const activeGamesList = useMemo(async () => {
    const newGamesList = props.visitors.filter(g => g.instigator === props.user.uid || g.respondent === props.user.uid);
    console.log('new games list', newGamesList);
    return newGamesList;
  }, [props.gameSessions]);
  
  const opponentUsersList = useMemo(() => {
    const gameOpponents = [];
    const opponents = props.visitors.filter(v => v.visitorId !== props.user.uid);
    opponents.forEach(opponentObj => {
      const gamesList = opponentObj.ongoingGames || [];
      gamesList.forEach(gameSessionId => {
        if (props.ongoingGames.includes(gameSessionId)) {
          gameOpponents.push(opponentObj);
        }
      });
    });
    return gameOpponents;
  }, [props.visitors]);
  

  // const allGames = useMemo(() => {

  // }, [props.ongoingGames]);

  return (
    <div
      className={`lobby-screen${revealed ? ' showing' : ''}`}
    >
      <h1 className='user-label'>{props.user.displayName}</h1>
      <h2 className={'lobby-header'}>Choose your opponent</h2>
      <div className='lobby-display users'>
        <h3 className='lobby-sublist-header'>All Users</h3>
        {allUsers.length > 0 ?
          allUsers.map(visitorObj => {
            const isSelf = props.user.uid === visitorObj.visitorId;
            const isBeingChallengedByUser = props.pendingOutgoingChallenges && props.pendingOutgoingChallenges.includes(visitorObj.visitorId);
            const isAway = visitorObj.phase.includes('away');
            const userLocationClass = visitorObj.currentLocation.split(' ')[0];
            const listingClasses = ['visitor-listing',
              isSelf && 'self',
              isBeingChallengedByUser && 'being-challenged-by-user',
              isAway && 'away',
              userLocationClass].filter(cl => cl).join(' ')
              ;
            const locationMessage = visitorObj.currentLocation;
            const rowButtonAction = isBeingChallengedByUser ? () => onClickCancelRequest(visitorObj.visitorId) : () => onClickRequestGame(visitorObj.visitorId);
            const rowButtonLabel = isBeingChallengedByUser ? 'AWAITING CHALLENGE RESPONSE (Click to cancel)' : 'REQUEST GAME';
            const rowSpecialButtonClass = isBeingChallengedByUser ? 'requesting-game' : 'request-game';
            return (
              <div className='listing-row' key={`visitor-${visitorObj.visitorId}`}>
                <div
                  className={listingClasses}
                  id={`visitor-${visitorObj.visitorId}`}
                >
                  <h3 className='display-name'>{visitorObj.displayName}{isSelf ? ' (you!)' : ''}</h3>
                  <div>{locationMessage}</div>
                  <div className='status-column'>
                    <span style={{ display: 'none' }}>{visitorObj.phase}</span>
                    {!isSelf &&
                      <Button
                        width={'max-content'}
                        label={rowButtonLabel}
                        clickAction={rowButtonAction}
                        specialClass={rowSpecialButtonClass}
                        color={'#669966'}
                        disabled={false}
                      />
                    }                   
                  </div>
                  {/* <div style={{ color: visitorObj.latency < 100 ? '#aaffaa' : visitorObj.latency < 500 ? '#ffffaa' : '#ffaaaa' }}>{parseInt(visitorObj.latency) || ''}</div> */}
                </div>

              </div>
            );
          })
          :
          <h2 className='empty-lobby-message'>{'Nobody else here :('}</h2>
        }
      </div>
      <div className='lobby-display challenges'>
        <h3 className='lobby-sublist-header'>Incoming Challenges</h3>
        {pendingIncomingChallengeList.map(prospectiveOpponentObj => {
          console.log('prospectiveOpponentObj', prospectiveOpponentObj);
          return (
            <div key={`incoming-challenge-${prospectiveOpponentObj.visitorId}`} className='listing-row'>
              <div
                className={'visitor-listing challenging-user'}
              >
                <h3 className='display-name'>{prospectiveOpponentObj.displayName}</h3>
                <div className='status-column'>
                  <Button
                    width={'max-content'}
                    clickAction={() => props.handleClickContemplateChallenge(prospectiveOpponentObj.visitorId)}
                    label={'CHALLENGING! Click to accept'}
                    specialClass={'challenging-user'}
                    color={'#669966'}
                    disabled={false}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className='lobby-display games'>
        <h3 className='lobby-sublist-header'>Your Active Games</h3>
        {opponentUsersList.length > 0 && opponentUsersList.map(opponentObj => {
          return (
            <div>{opponentObj.displayName}</div>
          );
        })}
      </div>

      <div className='lobby-button-area'>
        <Button
          label='BACK'
          clickAction={props.handleClickBackToTitle}
          width={'6rem'}
          color={'brown'}
        />
      </div>
      <style jsx>{`
        .lobby-screen {
          --lobby-header-height: 4rem;
          --listing-height: 5rem;
          --lobby-max-width: 12;
          --list-padding: 1rem;          
          --list-column-template: 5rem max-content 1fr;
          --list-row-template: 4rem 4rem 4rem;
          position: absolute;
          justify-self: center;
          width: 95vw;
          max-width: 100vh;
          min-height: calc(var(--actual-height) - (var(--header-height) * 1.5));
          padding: var(--list-padding);
          margin-top: calc(var(--lobby-header-height) * 0.3);         
          padding-top: calc(var(--lobby-header-height) * 1.2);
          display: flex;
          flex-direction: column;
          gap: calc(var(--list-padding) * 2);
          background-color: var(--main-modal-color);
          border-radius: var(--modal-border-radius);
          box-shadow: 
            0 0 calc(var(--board-size) / 100) #00000088,
            0 0 calc(var(--board-size) / 150) #000000aa inset
          ;
          transition: all 300ms ease;
          transition-delay: 100ms;
          font-size: 0.8rem !important;

          &:not(.showing) {
            opacity: 0;
          }

          & h2.empty-lobby-message {
            width: 100%;
            height: 5rem;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2rem;
            font-family: 'Aladin';
            font-weight: normal;
          }

          & .user-label {
            display: none;
            position: absolute;
            top: calc(var(--lobby-header-height) * 1.1);
            right: 5%;
            font-size: 3rem;
            font-weight: bold;
            color: #aff;
            z-index: 2;
          }

          & > .lobby-header, & > .visitor-column-header {
            position: absolute;
            top: 0;
            left: 0;
            padding: 0;
            margin: 0;
            background-color: #00000099;
            width: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
          }

          & > .lobby-header {
            height: var(--lobby-header-height);
            border-top-left-radius: calc(var(--board-size) * 0.025);
            border-top-right-radius: calc(var(--board-size) * 0.025);
            font-family: 'Aladin';
            font-size: calc(var(--lobby-header-height) / 1.65);
            font-weight: unset;
          }

          & > .visitor-column-header {
            justify-content: space-between;
            top: calc(var(--lobby-header-height) * 1.5);
            width: 100%;
            height: 2rem;
            padding: 0 calc(var(--list-padding));
            background-color: transparent;
            font-weight: bold;
            display: grid;
            grid-template-columns: var(--list-column-template);
            grid-template-rows: var(--list-rows-template);

            & > h3 {
              padding: 0 calc(var(--list-padding) / 2);
            }
            
          }

          & > .lobby-display {
            display: flex;
            flex-direction: column;
            align-items: stretch;
            //gap: calc(var(--listing-height) / 10);
            padding: 0 0.5%;

            & > .lobby-sublist-header {
              font-size: calc(var(--lobby-header-height) * 0.35);
              height: calc(var(--lobby-header-height) * 0.5);
              display: flex;
              align-items: center;
              justify-content: center;
            }

            & > .listing-row {
              position: relative;
              display: flex;
              align-items: center;
              justify-content: space-between;
              gap: 3%;
              &:not(:last-child) {
                margin-bottom: calc(var(--listing-height) / 10);
              }
              
              & > .visitor-listing {
                position: relative;
                flex-grow: 1;
                display: grid;
                grid-template-columns: var(--list-column-template);
                grid-template-rows: var(--list-rows-template);
                align-items: center;
                min-height: var(--listing-height);
                border: calc(var(--list-padding) * 0.05) solid #00000055;
                background-color: #00000022;
                //cursor: pointer;
                border-radius: 0.5rem;
                transition: all 300ms ease;
                overflow: hidden;
                border-color: #ffff0088;

                & > .status-column {
                  display: flex;
                  flex-direction: row;
                  align-items: center;
                  justify-content: flex-end;
                }

                & * {
                  pointer-events: none;
                }

                & > * {
                  //background-color: #00000033;
                  padding-left: calc(var(--list-padding));
                  padding-right: calc(var(--listing-height) / 8);
                  align-self: stretch;
                  display: flex;
                  flex-direction: column;
                  justify-content: center;
                  overflow: hidden;

                  &.display-name {
                    font-size: 1.325rem;
                  }
                  
                  &:nth-child(1) {
                    background-color: #00000022;
                  }
                }
                
                &:nth-of-type(odd) {
                  background-color: #00000011;
                }

                &.being-challenged-by-user {
                  background-color: #0066ff99;
                }

                &.challenging-user {
                  background-color: #33aa8899; 
                }     

                &.self {
                  //display: none;
                  background-color: transparent;
                  border-color: #ffffaa33;
                  pointer-events: none;                 
                  
                  & > h3 {
                    color: #ffffaa;
                  }
                }

                {/* &.away, &.title, &.lobby &.game {
                  background-color: unset;                  

                } */}

                {/* &.away::before, &.title::before, &.lobby::before, &.game::before {
                  content: '';
                  position: absolute;
                  top: 0; 
                  left: 0;
                  height: 100%;
                  width: 100%;
                  z-index: 0;
                  pointer-events: none;
                }

                &.away::before {
                  background-color: #ffaaff22;
                }
                
                &.title::before {
                  background-color: #aaaaff33;                  
                }
                
                &.lobby::before {
                  //background-color: #aaffaa88;                  
                }
                
                &.game::before {
                  background-color: #aaaaff33;                  
                } */}
                &.away {
                  background-color: #ffaaff22 !important;
                }
                
                &.title {
                  outline: solid red;
                  background-color: #aaaaff33;                  
                }
                
                &.lobby {
                  background-color: #aaffaa88;                  
                }
                
                &.game {
                  background-color: #aaaaff33;                  
                }
              }
            }
          }

          & > .lobby-button-area {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 2rem;
            padding-top: 1rem;
          }

          & .loading-message {
            display: flex;
            align-items: center;
            justify-content: center;
            flex-grow: 1;
            font-family: 'Aladin';
            font-size: calc(var(--lobby-header-height) / 2);
            font-weight: unset;
          }
        }
        
        @media screen and (orientation: landscape) {
          .lobby-screen {
            --listing-height: 5rem;            
            --list-column-template: minmax(max-content, 14rem) 1fr min-content;
            --list-row-template: 1fr;
            font-size: 1rem;
            max-width: calc(var(--listing-height) *  var(--lobby-max-width));

            & h3 {
              font-size: 1rem;
            }
          }
        }
      `}</style>
    </div>
  );
}