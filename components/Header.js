import { tileData } from "../scripts/scrabbledata";
import Tile from "./Tile";
import UserIcon from "./UserIcon";

export default function Header(props) {
  return (
    <header>
      <div className={`title-tile-area${props.revealed ? ' revealed' : ''}`}>
        <Tile letter='S' value={tileData['s'].value} title />
        {/* <span style={{
          transform: 'scaleX(-1)'
        }}> */}
          <Tile letter='K' value={tileData['k'].value} title />
        {/* </span> */}
        <Tile letter='R' value={tileData['r'].value} title />
        <Tile letter='U' value={tileData['u'].value} title />
        <Tile letter='B' value={tileData['b'].value} title />
        <Tile letter='B' value={tileData['b'].value} title />
        <Tile letter='L' value={tileData['l'].value} title />
        <Tile letter='E' value={tileData['e'].value} title />
      </div>
      {/* {props.landscape && props.user &&
        <UserIcon
          user={props.user}
          size={'small'}
        />
      } */}
      <style jsx>{`
        header {
          min-width: 100dvw;
          height: var(--header-height);
          margin-top: ${props.user ? '0' : '12vh'};
          background-color: ${props.gameStarted ? 'var(--secondary-bg-color)' : 'transparent'};
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 calc(var(--racked-tile-size) * 0.1);
          transition: all 500ms ease;

          & > .title-tile-area {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: calc(var(--title-tile-size) * 0.1);
            transition: all 1200ms;

            // width: calc(var(--title-tile-size) * 16);
            height: var(--header-height);
            opacity: 0;
            
            &.revealed {
              // width: calc((var(--title-tile-size) * 8) + (var(--title-tile-size) * 0.7));
              opacity: 1;
            }
          }
        }

        @media screen and (orientation: landscape) {
          header {
            margin-top: ${props.user ? '0' : '16vh'};
            justify-content: ${props.user ? 'space-between' : 'center'};
          }
        }
      `}</style>
    </header>
  );
}