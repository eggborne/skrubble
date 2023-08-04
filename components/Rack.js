import Tile from "./Tile";


export default function Rack(props) {
  return (
    <>
      <div className='rack'>
        <div className='tile-container'>
          {props.tiles.map(tile =>
            <Tile 
              letter={tile.letter} 
              // size={'calc(var(--board-size) / 9.5)'} 
              size={'calc(var(--rack-height) * 1.05)'} 
              value={tile.value} 
              key={tile.id}
              id={tile.id}
              selected={props.selectedTile && props.selectedTile.id === tile.id}
              onPointerDown={props.handleTilePointerDown}
            />
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
      `}</style>
    </>
  );
}