import { useEffect, useState } from "react";
import Space from "./Space";
import { fullBoard, specialSpaceData } from "../scripts/scrabbledata";
import Tile from "./Tile";

export default function GameBoard(props) {
  console.log('gameboard', props);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (!revealed) {
      setRevealed(true);

    }
  }, [revealed]);

  return (
    <>
      <div className='game-board' id='game-board' style={{
        opacity: revealed ? '1' : '0',
        scale: revealed ? '1' : '0.25',
      }}>
        {fullBoard.map((row, r) =>
          row.map((space, s) => {
            const spaceContents = props.letterMatrix[r][s].contents;
            return <Space
              key={`${(r+1)}-${(s+1)}`}
              id={`${(r+1)}-${(s+1)}`}
              targeted={props.targetedSpaceId === `${(r+1)}-${(s+1)}`}
              spaceData={space}
              backgroundColor={space.length ? specialSpaceData[space[0]].color : 'var(--board-color)'}
              label={
                r === 7 && space[0] === 'dw' ?
                  <div className='star'></div>
                  :
                  space.length ?
                  specialSpaceData[space[0]].legend
                  :
                  ''
              }
              contents={
                spaceContents ?
                  spaceContents.locked ?
                  <Tile
                    owner={spaceContents.owner}
                    letter={spaceContents.letter}
                    value={spaceContents.value}
                    key={spaceContents.id}
                    id={spaceContents.id}
                    offset={{x: 0, y: 0}}
                    placed={spaceContents.placed}
                    landed={spaceContents.landed}
                    locked={spaceContents.locked}
                    rackIndex={spaceContents.rackIndex}
                    bgPosition={spaceContents.bgPosition}
                  />
                  :
                    spaceContents.letter
                  :
                  ''
              }
            />}
          )
        )}
      </div>
      <style jsx>{`
        .game-board {
          justify-self: center;
          width: var(--board-size);
          height: var(--board-size);
          border: calc(var(--board-outline-size) * 2.5) solid #eee;          
          display: grid;
          grid-template-columns: repeat(15, 1fr);
          grid-template-rows: repeat(15, 1fr);
          justify-items: center;
          align-items: center;
          box-shadow: 0 0 0.25rem #00000099;
          gap: calc(var(--board-outline-size) / 1.5);
          background-color: var(--board-bg-color);
          transition: scale 500ms ease-out;
        }
        
        .game-board::after {
          content: '';
          position: absolute;
          width: calc(var(--board-size) * 0.9835);
          height: calc(var(--board-size) * 0.9835);
          border: calc(var(--board-outline-size) / 2) solid #333;
        }
        h1 {
          font-size: calc(var(--header-height) / 2);
        }
        .star {
          --star-size: calc(var(--board-size) / 40);
          font-size: var(--star-size);
          position: relative;
          transform: translateY(-80%);
          
          border-right:  .3em solid transparent;
          border-bottom: .75em solid #333;
          border-left:   .3em solid transparent;
        
          &:before, &:after {
            content: '';
            
            display: block;
            width: 0;
            height: 0;
            
            position: absolute;
            top: .6em;
            left: -1em;
          
            border-right:  1em solid transparent;
            border-bottom: .7em  solid #333;
            border-left:   1em solid transparent;
          
            transform: rotate(-35deg);
          }
          
          &:after {  
            transform: rotate(35deg);
          }
        }
      `}</style>
    </>
  );
}