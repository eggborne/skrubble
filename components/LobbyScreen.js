import { useEffect, useMemo, useState } from "react";
import Button from "./Button";

export default function LobbyScreen(props) {
  console.warn('LobbyScreen props', props);
  const [revealed, setRevealed] = useState();

  function getDisplayNameById(id) {
    let visitorWithIdArr = [...props.visitors].filter(v => v.uid === id);
    return visitorWithIdArr.length > 0 ? visitorWithIdArr[0].displayName : '';
  }

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

  function onClickRequestGame(selecteduid) {
    console.log('LobbyScreen.onClickRequestGame ---------------------- clicked uid', selecteduid);
    props.handleClickRequestGame(selecteduid);
  }

  function onClickCancelRequest(selecteduid) {
    props.handleClickCancelRequest(selecteduid);
  }

  function onClickJoinGame(gameObj) {
    props.handleClickJoinGame(gameObj);
  }

  const allUsers = useMemo(() => {
    if (props.visitors.length > 0) {
      const selfObj = props.visitors.filter(v => v.uid === props.user.uid)[0] || undefined;
      const nonSelfVisitors = props.visitors.filter(v => v.uid !== props.user.uid).sort((a, b) => a.displayName.localeCompare(b.displayName));
      const preparedArray = nonSelfVisitors.length > 0 ? [selfObj, ...nonSelfVisitors] : selfObj ? [selfObj] : [];
      return preparedArray;
    } else {
      return [];
    }
  }, [props.visitors]);

  const pendingIncomingChallengeList = useMemo(() => {
    return props.visitors.filter(v => v.uid !== props.user.uid && v.pendingOutgoingChallenges && v.pendingOutgoingChallenges.includes(props.user.uid));
  }, [props.visitors]);

  const activeGames = useMemo(() => {
    const fullGamesList = props.gameSessions.filter(g => (g.instigator === props.user.uid) || (g.respondent === props.user.uid));
    const userTurnGames = fullGamesList.filter(g => g.currentTurn === props.user.uid);
    const opponentTurnGames = fullGamesList.filter(g => g.currentTurn !== props.user.uid);
    return { userTurnGames, opponentTurnGames };
  }, [props.gameSessions, props.user]);

  const totalActiveGames = activeGames.userTurnGames.length + activeGames.opponentTurnGames.length;

  return (
    <div
      className={`lobby-screen${revealed ? ' showing' : ''}`}
    >
      <h1 className='user-label'>{props.user.displayName}</h1>
      <h2 className={'lobby-header'}>LOBBY</h2>
      <div className='lobby-display games'>
        <h3 className='lobby-sublist-header'>{!totalActiveGames ? 'No ' : ''}Active Games</h3>
        {totalActiveGames > 0 &&
          Object.values(activeGames).map((sectionArray, s) =>
            sectionArray.length > 0 && <div key={`game-section-${s}`} className='list-section'>
              <h3>{s == 0 ? 'Your' : 'Their'} turn</h3>
              {sectionArray.map(gameObj => {
                const instigatorName = getDisplayNameById(gameObj.instigator);
                const respondentName = getDisplayNameById(gameObj.respondent);
                return (
                  <div key={`game-row-${gameObj.sessionId}`} className={`listing-row `}>
                    <div
                      className={'visitor-listing game-listing'}
                      id={`game-${gameObj.sessionId}`}
                    >
                      <h3 className='display-name'>{instigatorName} vs. {respondentName}</h3>
                      <div className='game-info'>
                        <span>Bag: {gameObj.bag.length}</span>
                        <span>{instigatorName}: {gameObj.instigatorScore}</span>
                        <span>{respondentName}: {gameObj.respondentScore}</span>
                        <span>{gameObj.currentTurn === gameObj.instigator ? instigatorName : respondentName}'s turn</span>
                      </div>
                      <div className='status-column'>
                        <Button
                          width={'max-content'}
                          label={'Go to Game'}
                          clickAction={() => onClickJoinGame(gameObj)}
                          specialClass={'game-ongoing'}
                          color={'#669966'}
                          disabled={false}
                        />
                      </div>
                    </div>
                  </div>
                );
              })
              }
            </div>
          )
        }
      </div>
      <div className='lobby-display challenges'>
        <h3 className='lobby-sublist-header'>{pendingIncomingChallengeList.length === 0 ? 'No ' : ''}Incoming Challenges</h3>
        {pendingIncomingChallengeList.map(prospectiveOpponentObj => {
          console.log('prospectiveOpponentObj', prospectiveOpponentObj);
          return (
            <div key={`incoming-challenge-${prospectiveOpponentObj.uid}`} className='listing-row'>
              <div
                className={'visitor-listing challenging-user'}
              >
                <h3 className='display-name'>{prospectiveOpponentObj.displayName}</h3>
                <div className='status-column'>
                  <Button
                    width={'max-content'}
                    clickAction={() => props.handleClickContemplateChallenge(prospectiveOpponentObj.uid)}
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
      <div className='lobby-display users'>
        <h3 className='lobby-sublist-header'>All Users</h3>
        {allUsers.length > 0 &&
          allUsers.filter(v => v.uid).map(visitorObj => {
            const isSelf = props.user.uid === visitorObj.uid;
            const isBeingChallengedByUser = props.user.pendingOutgoingChallenges && props.user.pendingOutgoingChallenges.includes(visitorObj.uid);
            const isAway = visitorObj.phase.includes('away');
            const userLocationClass = visitorObj.currentLocation.split(' ')[0];
            const listingClasses = ['visitor-listing',
              isSelf && 'self',
              isBeingChallengedByUser && 'being-challenged-by-user',
              isAway && 'away',
              userLocationClass].filter(cl => cl).join(' ')
              ;
            const locationMessage = visitorObj.currentLocation;
            const rowButtonAction = isBeingChallengedByUser ? () => onClickCancelRequest(visitorObj.uid) : () => onClickRequestGame(visitorObj.uid);
            const rowButtonLabel = isBeingChallengedByUser ? 'AWAITING CHALLENGE RESPONSE (Click to cancel)' : 'REQUEST GAME';
            const rowSpecialButtonClass = isBeingChallengedByUser ? 'requesting-game' : 'request-game';
            return (
              <div className='listing-row' key={`visitor-${visitorObj.uid}`}>
                <div
                  className={listingClasses}
                  id={`visitor-${visitorObj.uid}`}
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
                </div>
              </div>
            );
          })
        }
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
          font-size: 1rem !important;

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
            font-size: calc(var(--lobby-header-height) / 1.5);
            font-weight: normal;
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
            padding: 0 0.5%;

            & > .lobby-sublist-header {
              font-size: calc(var(--lobby-header-height) * 0.4);
              height: calc(var(--lobby-header-height) * 0.75);
              display: flex;
              align-items: center;
              justify-content: center;
            }
            
            & > .list-section {
              
              & > h3 {
                margin: 1rem;
                font-size: 1.25rem;
              }
            }

            & .listing-row {
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
                border-radius: 0.5rem;
                transition: all 300ms ease;
                overflow: hidden;
                border-color: #ffff0088;
                background-color: #88aa4433;                  

                &.game-listing {
                  background-color: #775577 !important;
                  grid-template-columns: max-content max-content max-cintent 1dr;;

                  & > .game-info {
                    text-shadow: var(--text-stroke);
                    font-weight: bold;
                    font-size: 1rem;
                    display: grid;
                    grid-template-columns: max-content max-content max-content 1fr;
                    align-items: center;
                    justify-content: flex-start;
                    gap: 1rem;

                    & > span:last-of-type {
                      font-size: 1.325rem;
                      justify-self: flex-end;
                    }
                  }
                }

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

                &.being-challenged-by-user {
                  background-color: #0066ff99;
                }

                &.challenging-user {
                  background-color: #33aa8899; 
                }     

                &.self {
                  background-color: transparent;
                  border-color: #ffffaa33 !important;
                  
                  & > h3 {
                    color: #ffffaa;
                  }
                }

                &.away {
                  background-color: #ffaaff22 !important;
                }
                
                &.title {
                  border-color: #ffaa44;                  
                }
                
                &.lobby {
                  border-color: #ffaa44;                  
                }
                
                &.game {
                  border-color: #55ff55;                  
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