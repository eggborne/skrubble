import Tile from "./Tile";


export default function Rack(props) {
  return (
    <>
      <div className='rack'>
        {props.tiles.map(tile =>
          <Tile letter={tile.letter} size={'calc(var(--board-size) / 10)'} value={tile.value} key={tile.id} />
        )}
      </div>
      <style jsx>{`
        .rack {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: calc(var(--board-size) / 100);
          background-color: #cccc99;
          width: 90%;
          height: calc(var(--board-size) / 12);
          border-radius: calc(var(--board-size) / 150);
          box-shadow: 0 0 calc(var(--board-size) / 150) #000000aa;
          font-size: calc(var(--board-size) / 24);
          font-weight: bold;
          font-family: 'interstate-bold', sans-serif;
          z-index: 3;
        }

        .rack:after {
          content: '';
          bottom: -45%;
          position: absolute;
          left: -0.5%;
          width: 101%;
          align-self: center;
          height: calc(var(--board-size) / 30);
          background-color: inherit;
          border: 1px solid black;
          z-index: 3;
          
        }
      `}</style>
    </>
  );
}