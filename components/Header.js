import { tileData } from "../scripts/scrabbledata";
import { randomInt } from "../scripts/util";
import Tile from "./Tile";

export default function Header(props) {
  return (
    <header>
      <div className={`title-tile-area${props.revealed ? ' revealed' : ''}`}>
        <Tile bgPosition={0} letter='S' value={tileData['s'].value} title />
        <Tile bgPosition={15} letter='K' value={tileData['k'].value} title />
        <Tile bgPosition={30} letter='R' value={tileData['r'].value} title />
        <Tile bgPosition={45} letter='U' value={tileData['u'].value} title />
        <Tile bgPosition={60} letter='B' value={tileData['b'].value} title />
        <Tile bgPosition={75} letter='B' value={tileData['b'].value} title />
        <Tile bgPosition={90} letter='L' value={tileData['l'].value} title />
        <Tile bgPosition={100} letter='E' value={tileData['e'].value} title />
      </div>
      {/* {props.landscape && props.user &&
        <UserIcon
          user={props.user}
          size={'small'}
        />
      } */}
      <style jsx>{`
        header {
          min-width: 100vw;
          height: var(--header-height);
          margin-top: ${props.user ? '0' : '12vh'};
          // background-color: ${props.gameStarted ? 'var(--secondary-bg-color)' : 'transparent'};
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
            height: var(--header-height);
            opacity: 0;
            
            &.revealed {
              // width: calc((var(--title-tile-size) * 8) + (var(--title-tile-size) * 0.7));
              opacity: 1;
            }
          }
        }
      `}</style>
    </header>
  );
}