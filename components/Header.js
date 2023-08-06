import { tileData } from "../scripts/scrabbledata";
import Tile from "./Tile";

export default function Header(props) {
  return (
    <header>
      <div className={`title-tile-area${props.revealed ? ' revealed' : ''}`}>
        <Tile letter='S' value={tileData['s'].value} title />
        <Tile letter='K' value={tileData['k'].value} title />
        <Tile letter='R' value={tileData['r'].value} title />
        <Tile letter='U' value={tileData['u'].value} title />
        <Tile letter='B' value={tileData['b'].value} title />
        <Tile letter='B' value={tileData['b'].value} title />
        <Tile letter='L' value={tileData['l'].value} title />
        <Tile letter='E' value={tileData['e'].value} title />
      </div>
      {props.user && <div className='user-info'>
        <p className='user-name'>{props.user.displayName}</p>
        <img src={props.user.photoURL}></img>
      </div>}
      <style jsx>{`
        header {
          width: 100%;
          height: var(--header-height);
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: var(--secondary-bg-color);
          padding: 0 calc(var(--racked-tile-size) * 0.1);

          & > .title-tile-area {
            display: flex;
            justify-content: space-between;
            align-items: center;
            transition: all 1200ms;
            
            scale: 0.8;
            width: calc(var(--racked-tile-size) * 14.5);
            max-width: 100vw;
            height: var(--header-height);
            opacity: 0;
            
            &.revealed {
              width: calc(var(--racked-tile-size) * 8.5);
              opacity: 1;
            }
          }

          & > .user-info {
            display: flex;
            align-items: center;
            gap: calc(var(--header-height) / 6);
            height: var(--header-height);
            font-size: 0.9rem;
            & img {
              height: 80%;
              border-radius: 50%;
            }
          }
        }

        h1 {
          font-size: calc(var(--header-height) / 2);
        }

        @media screen and (orientation: landscape) {
          header {
            justify-content: space-between;

            & > .title-tile-area {
              scale: 0.7;
              transform-origin: left center;
            }
          }
        }
      `}</style>
    </header>
  );
}