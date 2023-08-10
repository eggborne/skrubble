import Space from "./Space";
import Tile from "./Tile";

export default function Rack(props) {
  return (
    <div className={`rack ${props.owner}`} id={`${props.owner}-rack`}>
      <div className='tile-container'>
        {props.tiles.map((tile, t) =>
          <Space
            key={`${props.owner}-rack-space-${t}`}
            id={`${props.owner}-rack-space-${t}`}
            racked={true}
            targeted={props.targetedSpaceId === `${props.owner}-rack-space=${t}`}
            spaceData={[]}
            label={''}
            contents={
              <Tile
                owner={props.owner}
                draggable={props.owner === 'user'}
                letter={tile.letter}
                value={tile.value}
                key={tile.id}
                id={tile.id}
                selected={props.selectedTileId === tile.id}
                rackSpaceId={`${props.owner}-rack-space-${t}`}
                offset={tile.offset}
                placed={tile.placed}
              />
            }
          >
          </Space>
        )}
        {/* {emptyRackSpaces.map((space, s) => {
          let spaceContents;
          if (s < props.tiles.length) {
            const tile = props.tiles[s];
            spaceContents = <Tile
              owner={props.owner}
              draggable={props.owner === 'user'}
              letter={tile.letter}
              value={tile.value}
              key={tile.id}
              id={tile.id}
              selected={props.selectedTileId && props.selectedTileId.id === tile.id}
              rackSpaceId={`${props.owner}-rack-space-${s}`}
              onPointerDown={props.handleTilePointerDown}
              onPointerUp={props.handleTilePointerUp}
            />;
          } else {
            spaceContents = 'blargh';
          }
          return <Space
            key={`${props.owner}-rack-space-${s}`}
            id={`${props.owner}-rack-space-${s}`}
            racked={true}
            targeted={props.targetedSpaceId === `${props.owner}-rack-space=${s}`}
            spaceData={[]}
            label={''}
            contents={spaceContents}
          >;
          </Space>;
        })} */}
      </div>
      <div className='shelf'></div>
      <style jsx>{`
        .rack {
          position: relative;
          width: var(--rack-width);
          height: var(--rack-height);
          border-radius: calc(var(--board-size) / 150);
          ${props.owner === 'user' &&
        `background-color: #aaaa66;
            box-shadow: 
              0 0 calc(var(--board-size) / 150) #000000aa,
              0 0 calc(var(--board-size) / 150) #000000aa inset
            ;
            border: 1px solid black;`
        }
          font-size: calc(var(--board-size) / 24);
          font-weight: bold;
          font-family: 'interstate-bold', sans-serif;
          z-index: 3;

          & > .tile-container {
            position: absolute;
            width: 100%;
            display: grid;
            grid-template-rows: 1fr;
            grid-template-columns: repeat(7, min-content);
            gap: calc(var(--rack-height) / 8);
            align-content: bottom;
            justify-items: center;
            justify-content: center;
            ${props.owner === 'user' && 'bottom: 0%'};
          }
          & > .shelf {
            display: ${props.owner === 'opponent' ? 'none' : 'block'};
            position: absolute;
            bottom: -33%;
            left: -1%;
            width: 102%;
            align-self: center;
            height: calc(var(--rack-height) / 2.5);
            background-color: inherit;
            background-image: linear-gradient(to bottom, #00000033 0%, transparent 50%, #00000033 100%);
            border: 1px solid black;
            border-radius: calc(var(--rack-height) / 20);
            box-shadow: 1px 0 calc(var(--rack-height) / 16) #00000099;
            z-index: 3;
          }
  
          & > .tile-space {
            width: var(--racked-tile-size);
            height: var(--racked-tile-size);
            min-width: var(--racked-tile-size);
            min-height: var(--racked-tile-size);
          }
        }
      `}</style>
    </div>
  );
}