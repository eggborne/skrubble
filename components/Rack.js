import { useEffect, useState } from "react";
import Space from "./Space";
import Tile from "./Tile";

export default function Rack(props) {
  const [homeSpaceCoords, setHomeSpaceCoords] = useState([]);
  useEffect(() => {
    const newHomeSpaceCoords = [...homeSpaceCoords];
    const rackElement = document.getElementById(`${props.owner}-rack`);
    const spaces = [...rackElement.getElementsByClassName('space')];
    spaces.forEach((space, s) => {
      newHomeSpaceCoords[s] = {
        x: space.getBoundingClientRect().left,
        y: space.getBoundingClientRect().top
      }
    });
    setHomeSpaceCoords(newHomeSpaceCoords);
  }, []);
  return (
    <div className={`rack ${props.owner}`} id={`${props.owner}-rack`}>
      <div className='tile-container'>
        {props.tiles.map((tile, t) => {
          return (
            <Space
              key={`${props.owner}-rack-space-${t}`}
              id={`${props.owner}-rack-space-${t}`}
              onRack={true}
              targeted={props.targetedSpaceId === `${props.owner}-rack-space-${t}`}
              spaceData={[]}
              label={''}
              vacant={tile.placed}
              contents={
                <Tile
                  owner={props.owner}
                  draggable={props.owner === 'user'}
                  letter={tile.letter}
                  value={tile.value}
                  key={tile.id}
                  id={tile.id}
                  turnPlayed={tile.turnPlayed}
                  selected={props.selectedTileId === tile.id}
                  rackSpaceId={`${props.owner}-rack-space-${t}`}
                  offset={tile.offset}
                  blankPosition={tile.blankPosition}
                  blank={tile.blank}
                  placed={tile.placed}
                  landed={tile.landed}
                  incongruent={tile.incongruent}
                  locked={tile.locked}
                  rackIndex={tile.rackIndex}
                  bgPosition={tile.bgPosition}
                  homeSpaceCoords={homeSpaceCoords[t]}
                />
              }
            >
            </Space>);
          }
        )}
      </div>
      <div className='shelf'></div>
      <style jsx>{`
        .rack {
          position: relative;
          width: var(--rack-width);
          height: var(--rack-height);
          ${props.owner === 'user' ?
          `background-color: #aaaa66;
            border-radius: calc(var(--board-size) / 150);
            box-shadow: 
              0 0 calc(var(--board-size) / 150) #000000aa,
              0 0 calc(var(--board-size) / 150) #000000aa inset
            ;
            border: 1px solid black;`
          :
          `--rack-height: calc(var(--board-size) / 16);
            `
        }
          z-index: 3;
          display: flex;
          justify-content: center;
          align-items: flex-end;

          & > .tile-container {
            display: flex;
            gap: var(--racked-tile-gap-size);
            
            ${props.owner === 'user' && 'bottom: 0%'};
          }
          & > .shelf {
            display: ${props.owner === 'opponent' ? 'none' : 'block'};
            position: absolute;
            bottom: -30%;
            left: -1%;
            width: 102%;
            align-self: center;
            height: calc(var(--rack-height) / 2.5);
            background-color: inherit;
            background-image: linear-gradient(to bottom, #00000033 0%, transparent 50%, #00000033 100%);
            border: 1px solid black;
            border-radius: calc(var(--rack-height) / 20);
            box-shadow: 1px 0 calc(var(--rack-height) / 18) #00000099;
            z-index: 3;
          }
  
          & > .tile-space {
            width: var(--racked-tile-size);
            height: var(--racked-tile-size);
            min-width: var(--racked-tile-size);
            min-height: var(--racked-tile-size);
          }
        }
        #opponent-rack {
          --rack-height: var(--racked-tile-size);
        }
        @media screen and (orientation: landscape) {
          #opponent-rack {
            align-self: start;
          }
        }
      `}</style>
    </div>
  );
}