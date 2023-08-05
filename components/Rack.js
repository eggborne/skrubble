import Space from "./Space";
import Tile from "./Tile";


export default function Rack(props) {
  return (
    <>
      <div className={`rack ${props.owner}`}>
        <div className='tile-container'>
          {props.tiles.map((tile, t) =>
            <Space
              key={`${props.owner}-rack-space=${t}`}
              id={`${props.owner}-rack-space=${t}`}
              type={'racked'}
              targeted={props.targetedSpaceId === `${props.owner}-rack-space=${t}`}
              spaceData={[]}
              // backgroundColor={'transparent'}
              label={''}
              contents={
                <Tile 
                draggable={true}
                letter={tile.letter} 
                value={tile.value} 
                key={tile.id}
                id={tile.id}
                selected={props.selectedTile && props.selectedTile.id === tile.id}
                onPointerDown={props.handleTilePointerDown}
              />
              }
            >
              {/* <Tile 
                draggable={true}
                letter={tile.letter} 
                value={tile.value} 
                key={tile.id}
                id={tile.id}
                selected={props.selectedTile && props.selectedTile.id === tile.id}
                onPointerDown={props.handleTilePointerDown}
              /> */}
            </Space>
          )}
        </div>
        <div className='shelf'></div>
      </div>
      <style jsx>{`
        .rack {
          position: relative;
          background-color: #cccc99;
          background-color: #bbbb88;
          width: 90%;
          height: var(--rack-height);
          border-radius: calc(var(--board-size) / 150);
          box-shadow: 0 0 calc(var(--board-size) / 150) #000000aa;
          font-size: calc(var(--board-size) / 24);
          font-weight: bold;
          font-family: 'interstate-bold', sans-serif;
          z-index: 3;
          border: 1px solid black;

          & > .tile-container {
            position: absolute;
            width: 100%;
            display: grid;
            grid-template-rows: 1fr;
            grid-template-columns: repeat(7, min-content);
            gap: calc(var(--rack-height) / 6);
            align-content: bottom;
            justify-items: center;
            justify-content: center;
            bottom: 5%;
            // display: flex;
            // justify-content: space-between;
          }
        }

        .shelf {
          position: absolute;
          bottom: -20%;
          left: -1%;
          width: 102%;
          align-self: center;
          height: calc(var(--board-size) / 30);
          background-color: inherit;
          border: 1px solid black;
          border-radius: calc(var(--board-size) / 200);
          z-index: 3;
        }

        .tile-space {
          outline: 2px solid red;
          width: var(--racked-tile-size);
          height: var(--racked-tile-size);
          min-width: var(--racked-tile-size);
          min-height: var(--racked-tile-size);
        }
      `}</style>
    </>
  );
}