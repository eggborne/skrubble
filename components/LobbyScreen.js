import { useEffect, useState } from "react";
import Button from "./Button";

export default function LobbyScreen(props) {
  const [revealed, setRevealed] = useState();
  const [selectedVisitor, setSelectedVisitor] = useState();

  useEffect(() => {
    if (!revealed) {
      setRevealed(true);
    }
  }, [revealed]);

  function handleClickVisitorListing(e) {
    setSelectedVisitor(e.target.id.split('-')[1]);
  }
  function onClickRequestGame(e) {
    props.handleClickRequestGame(selectedVisitor);
  }

  return (
    <div className={`lobby-screen${revealed ? ' showing' : ''}`}>
      <h2 className={'lobby-header'}>Choose your opponent</h2>
      <div className='visitor-column-header'>
        <div>Name</div>
        <div>Status</div>
      </div>
      <div className='lobby-display'>
        {props.visitors ?
          props.visitors.map(visitorObj => {
            let lastSeen;
            // let now = new Date().toISOString().slice(0, 19).replace('T', ' ');
            let now = new Date().toISOString();
            console.log('now', now);
            now = parseFloat(now.slice(now.length - 8));
            let last = new Date(visitorObj.lastPolled).toISOString();
            console.log('las', last)
            last = parseFloat(last.slice(last.length - 8));
            console.log('nows', now);
            console.log('lass', last)
            console.log(now - last)
            return <div key={`visitor-${visitorObj.visitorId}`} id={`visitor-${visitorObj.visitorId}`} onClick={props.user.uid !== visitorObj.visitorId ? handleClickVisitorListing : null} className={`visitor-listing${props.user.uid === visitorObj.visitorId ? ' self' : ''}${selectedVisitor === `${visitorObj.visitorId}` ? ' selected' : ''}`}>
              <div>Guest-{visitorObj.visitorId.slice(visitorObj.visitorId.length - 4)} {props.user.uid === visitorObj.visitorId ? '(YOU!)' : ''}</div>
              {/* <div>Last seen: {visitorObj.timeSinceLastPoll.slice(visitorObj.timeSinceLastPoll.length-2)}</div> */}
              <div>Last: {now - last}</div>
              <div>{visitorObj.status}</div>
            </div>})
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
        <Button
          label='REQUEST GAME'
          clickAction={onClickRequestGame}
          width={'12rem'}
          color={'darkgreen'}
          disabled={!selectedVisitor}
        />
      </div>
      <style jsx>{`
        .lobby-screen {
          --listing-height: 3rem;
          --list-padding: 2rem;
          position: absolute;
          left: 50%;
          top: 50%;
          translate: -50% -50%;
          width: 95vw;
          max-width: 100vh;
          height: calc(var(--actual-height) - (var(--header-height) * 1.5));
          padding: var(--list-padding);
          padding-top: calc(var(--listing-height) * 2);
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

          &:not(.showing) {
            opacity: 0;
            //filter: blur(calc(var(--board-size) * 0.005));
            //transform: scale(1.2) translateY(20%);
          }

          & > .lobby-header, & > .visitor-column-header {
            position: absolute;
            top: 0;
            left: 0;
            height: var(--listing-height);
            padding: 0;
            margin: 0;
            background-color: #000000aa;
            width: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
          }

          & > .lobby-header {
            border-top-left-radius: calc(var(--board-size) * 0.025);
            border-top-right-radius: calc(var(--board-size) * 0.025);
          }

          & > .visitor-column-header {
            justify-content: space-between;
            top: var(--listing-height);
            width: 100%;
            padding: 0 calc(var(--list-padding) * 1.5);
            background-color: transparent;
            font-weight: bold;
          }

          & > .lobby-display {
            display: flex;
            flex-direction: column;
            align-items: stretch;
            gap: calc(var(--listing-height) / 6);
            overflow-y: auto;

            & > .visitor-listing {
              //display: flex;
              //justify-content: space-between;
              //align-items: center;
              display: grid;
              grid-template-columns: 30% 1fr 1fr;
              align-items: center;
              min-height: var(--listing-height);
              padding: 0 calc(var(--list-padding) / 2);
              border: calc(var(--list-padding) * 0.05) solid #00000055;
              background-color: #00000022;
              cursor: pointer;
              border-radius: 0.5rem;
              transition: all 200ms ease;

              & > div:first-child {
                font-weight: bold;
              }

              &:hover {
                border: 2px solid orange;
              }
              
              &:nth-of-type(odd) {
                background-color: #00000011;
              }

              &.selected {
                background-color: #00ff0066;
                border: 2px solid orange;
              }

              &.self {
                background-color: #ffffaa11;
                border-color: #ffffaa33;
                pointer-events: none;
              }
            }
          }

          & > .lobby-button-area {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 2rem;
          }
        }
      `}</style>
    </div>
  );
}