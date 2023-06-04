export default function Tile(props) {
  return (
    <>
      <div className='tile'>
        {props.letter}
      </div>
      <style jsx>{`
        .tile {
          position: relative;
          color: black;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #cccc99;
          width: ${props.size};
          height: ${props.size};
          min-width: ${props.size};
          min-height: ${props.size};
          border-radius: calc(var(--board-size) / 180);
          box-shadow: 0 0 calc(var(--board-size) / 150) #000000aa;
          font-size: calc(${props.size} / 1.5);
          font-weight: bold;
          font-family: 'interstate-bold', sans-serif;
          z-index: 3;
        }

        .tile:after {
          content: '${props.value}';
          position: absolute;
          bottom: 0;
          right: 10%;
          font-size: calc(${props.size} / 3);
        }
      `}</style>
    </>
  );
}