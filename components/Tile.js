export default function Tile(props) {
  return (
    <>
      <div className='tile'>
        {props.letter}
      </div>
      <style jsx>{`
        .tile {
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #cccc99;
          width: 100%;
          height: 100%;
          border-radius: calc(var(--board-size) / 150);
          box-shadow: 0 0 calc(var(--board-size) / 150) #000000aa;
          font-size: calc(var(--board-size) / 24);
          font-weight: bold;
          font-family: 'interstate-bold', sans-serif;
          z-index: 3;
        }
      `}</style>
    </>
  );
}