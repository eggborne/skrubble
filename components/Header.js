import { tileData } from "../scripts/scrabbledata";
import { randomInt } from "../scripts/util";
import Tile from "./Tile";

export default function Header(props) {
  return (
    <header>
      <div className={`title-tile-area${props.revealed ? ' revealed' : ''}`}>
        <div className='title-tile-container'><Tile bgPosition={0} letter='S' value={tileData['s'].value} title /></div>
        <div className='title-tile-container'><Tile bgPosition={15} letter='K' value={tileData['k'].value} title even /></div>
        <div className='title-tile-container'><Tile bgPosition={30} letter='R' value={tileData['r'].value} title /></div>
        <div className='title-tile-container'><Tile bgPosition={45} letter='U' value={tileData['u'].value} title even /></div>
        <div className='title-tile-container'><Tile bgPosition={60} letter='B' value={tileData['b'].value} title /></div>
        <div className='title-tile-container'><Tile bgPosition={75} letter='B' value={tileData['b'].value} title even /></div>
        <div className='title-tile-container'><Tile bgPosition={90} letter='L' value={tileData['l'].value} title /></div>
        <div className='title-tile-container'><Tile bgPosition={100} letter='E' value={tileData['e'].value} title even /></div>
      </div>
      <div className={`title-legend${props.revealed && props.location === 'title' ? ' revealed' : ''}${props.location === 'title' ? ' expanded' : ''}`}>
        the <span style={{ color: '#ddffcc' }} >phonetic</span> crossword game
      </div>
      <style jsx>{`
        header {
          position: relative;
          min-width: 100vw;
          height: var(--header-height);
          margin-top: ${props.location === 'title' ? '12vh' : '0'};
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 0 calc(var(--racked-tile-size) * 0.1);
          transition: all 500ms ease;
          font-family: 'Aladin', cursive;
          padding-top: ${props.location === 'lobby' && 'calc(var(--header-height) * 0.25)'};

          & > .title-tile-area {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: calc(var(--title-tile-size) * 0.1);
            transition: all 1200ms;
            opacity: 0;
            
            &.revealed {
              opacity: 1;
            }

            & > .title-tile-container {
              animation: bounce 200ms ease alternate 2;
              animation-delay: 1300ms;
            }
          }

          & > .title-legend {
            position: absolute;
            bottom: calc(var(--title-tile-size) / -1.25);
            font-size: var(--title-font-size);
            text-shadow: 
              1px 1px calc(var(--button-height) / 32) #000000,
              -1px 1px calc(var(--button-height) / 32) #000000,
              -1px -1px calc(var(--button-height) / 32) #000000,
              1px -1px calc(var(--button-height) / 32) #000000
            ;
  
            opacity: 0;
            scale: 1.5;
            animation: dip 200ms ease alternate 2;
            animation-delay: 1000ms;

            &.revealed {
              transition: all 600ms ease;
              transition-delay: 600ms;
              scale: 1;
            
              &.expanded {
                opacity: 1;
              }
            }

          }
        }
      `}</style>
    </header>
  );
}