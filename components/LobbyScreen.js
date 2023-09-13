import { useEffect, useState } from "react";
import Button from "./Button";
import { subscribeToList, unsubscribeFromList } from "../scripts/firebase";

export default function LobbyScreen(props) {
  console.warn('LobbyScreen props', props);
  const [revealed, setRevealed] = useState();
  const [selectedVisitor, setSelectedVisitor] = useState();

  function getDisplayNameById(id) {
    let visitorWithIdArr = [...props.visitors].filter(v => v.visitorId === id);
    return visitorWithIdArr.length > 0 ? visitorWithIdArr[0].displayName : '';
  }

  useEffect(() => {
    if (!revealed) {
      
      setRevealed(true);
    }
    return () => {
      if (revealed) {
        console.error('LEAVING LOBBY!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!')
      }
    }
  }, [revealed]);

  function handleClickVisitorListing(e) {
    setSelectedVisitor(e.target.id.split('-')[1]);
  }

  function onClickRequestGame(selectedVisitorId) {
    props.handleClickRequestGame(selectedVisitorId);
  }

  function onClickCancelRequest(selectedVisitorId) {
    setSelectedVisitor();
    props.handleClickRequestGame('browsing');
  }

  return (
    <div
      // onClick={(e) => {
      //   if (!e.target.id.includes('visitor')) {
      //     setSelectedVisitor();
      //   }
      // }}
      className={`lobby-screen${revealed ? ' showing' : ''}`}
    >
      <h2 className={'lobby-header'}>Choose your opponent</h2>
      <div className='visitor-column-header'>
        <h3>Name</h3>
        <h3>Location</h3>
        <h3>Status</h3>
        <h3></h3>
      </div>
      <div className='lobby-display'>
        {props.visitors ?
          !props.visitors.length ?
            <h4 className={'loading-message'}>{'entering lobby...'}</h4>
            :
            props.visitors.map(visitorObj => {
              const isSelf = props.user.uid === visitorObj.visitorId;
              const isChallengingUser = visitorObj.phase === props.user.uid;
              const isBeingChallengedByUser = props.phase === visitorObj.visitorId;
              const selfIsSendingChallenge = props.phase && props.phase.length > 16;
              const selfIsBeingChallenged = props.phase && props.phase.length > 16;
              const isAway = visitorObj.phase.includes('away');
              const listingClasses = ['visitor-listing',
                isSelf && 'self',
                selectedVisitor === visitorObj.visitorId && 'selected',
                isBeingChallengedByUser && 'being-challenged-by-user',
                isChallengingUser && 'challenging-user',
                isAway && 'away'].filter(cl => cl).join(' ')
              ;
              // console.warn('PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP', visitorObj.displayName);
              // console.warn('visitorobj phase', visitorObj.phase);
              // console.warn('visitorobj visitorId', visitorObj.visitorId);
              // console.log('is challenging user', isChallengingUser);
              // console.log('is being challenged by user', isBeingChallengedByUser);
              // console.warn('props.user', props.user);
              const potentialOpponentId = isChallengingUser ? props.user.uid : isBeingChallengedByUser ? props.user.uid : selfIsSendingChallenge ? props.phase : undefined;
              // console.warn('--- opponent is', potentialOpponentId);
              const phaseMessage = isBeingChallengedByUser ?
                `Challenge from YOU`
                :
                (isChallengingUser || selfIsSendingChallenge) ?
                  `Challenging ${selfIsSendingChallenge ? getDisplayNameById(potentialOpponentId) : 'YOU'}`
                  :
                  visitorObj.phase
                ;
              return (
                <div className='listing-row' key={`visitor-${visitorObj.visitorId}`}>
                  <div className='uid-label'>{'self: ' + visitorObj.visitorId + ' | opp: ' + (visitorObj.currentOpponentId || 'none') + ' ----------------- phase: ' + visitorObj.phase}</div>
                  <div
                    className={listingClasses}

                    id={`visitor-${visitorObj.visitorId}`}
                    // onClick={props.user.uid !== visitorObj.visitorId ? handleClickVisitorListing : null}
                    style={{ opacity: visitorObj.currentLocation === 'lobby' ? 1 : 0.25 }}
                  >
                    <h3>{visitorObj.displayName}{isSelf ? ' (you!)' : ''}</h3>
                    <div>{visitorObj.currentLocation}</div>
                    <div className='status-column'>
                      <span style={{ display: 'none' }}>{visitorObj.phase}</span>
                      {isChallengingUser ?
                        <Button
                          width={'max-content'}
                          clickAction={() => props.handleClickAcceptChallenge(visitorObj.visitorId)}
                          label={'CHALLENGING! Click to accept'}
                          specialClass={'challenge-accept'}
                        />
                        :
                        (!isSelf && visitorObj.currentLocation === 'lobby') &&
                        <Button
                          width={'max-content'}
                          label={isBeingChallengedByUser ? 'Sending challenge... (Click to cancel)' : 'REQUEST GAME'}
                          clickAction={isBeingChallengedByUser ? () => onClickCancelRequest() : () => onClickRequestGame(visitorObj.visitorId)}
                          specialClass={'requesting-game'}
                          color={'#669966'}
                          disabled={false}
                        />
                      }
                    </div>
                    <div style={{ color: visitorObj.latency < 100 ? '#aaffaa' : visitorObj.latency < 500 ? '#ffffaa' : '#ffaaaa' }}>{parseInt(visitorObj.latency) || ''}</div>
                  </div>

                </div>
              );
            })
          :
          <div className='empty-lobby-message'>{'Nobody else here :('}</div>
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
          --list-padding: 1rem;          
          --list-column-template: 5rem max-content 1fr 3.5rem;
          --list-row-template: 4rem 4rem 4rem;
          position: absolute;
          left: 50%;
          top: 50%;
          translate: -50% -50%;
          width: 95vw;
          max-width: 100vh;
          height: calc(var(--actual-height) - (var(--header-height) * 1.5));
          padding: var(--list-padding);
          padding-top: calc(var(--lobby-header-height) * 2.2);;
          display: grid;
          grid-template-columns: 1fr;
          grid-template-rows: 1fr var(--button-height);
          justify-content: center;
          gap: var(--list-padding);
          background-color: var(--main-modal-color);
          border-radius: var(--modal-border-radius);
          box-shadow: 
            0 0 calc(var(--board-size) / 100) #00000088,
            0 0 calc(var(--board-size) / 150) #000000aa inset
          ;
          transition: all 450ms ease;
          transition-delay: 100ms;
          font-size: 0.8rem;

          &:not(.showing) {
            opacity: 0;
          }

          & .uid-label {
            position: absolute;
            bottom: 2px;
            left: 1%;
            font-size: 0.65rem;
            color: #ffffff44;
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
            gap: calc(var(--listing-height) / 10);
            overflow-y: auto;
            padding: 0 0.5%;

            & > .listing-row {
              position: relative;
              display: flex;
              align-items: center;
              justify-content: space-between;
              gap: 3%;
              
              & > .visitor-listing {
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
                transition: all 180ms ease;
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
                  background-color: #00000033;
                  padding: 0 calc(var(--list-padding) / 2);
                  align-self: stretch;
                  display: flex;
                  flex-direction: column;
                  justify-content: center;
                  overflow: hidden;
                  
                  &:nth-child(odd) {
                    background-color: #00000055;
                  }
                  
                  &:last-child {            
                    text-align: center;
                  }

                }

                &:not(.selected):hover {
                  //border: calc(var(--listing-height) / 24) solid orange;
                }
                
                &:nth-of-type(odd) {
                  background-color: #00000011;
                }

                &.selected {
                  
                  background-color: #888822;
                }

                &.being-challenged-by-user {
                  background-color: #ff6666;
                }

                &.challenging-user {
                  background-color: #888822; 
                  background-color: #00ff0066;             
                }     

                &.self {
                  //display: none;
                  background-color: transparent;
                  border-color: #ffffaa33;
                  pointer-events: none;
                  
                  & > h3 {
                    color: #ffffaa;
                  }

                  & > * {
                    background-color: transparent;
                  }
                }

                &.away {
                  opacity: 0.25 !important;
                }
              }
            }
          }

          & > .lobby-button-area {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 2rem;
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
            --listing-height: 4rem;
            --list-column-template: minmax(max-content, 12rem) 6rem 1fr 3.5rem;
            --list-row-template: 1fr;
            font-size: 1rem;

            & h3 {
              font-size: 1rem;
            }
          }
        }
      `}</style>
    </div>
  );
}