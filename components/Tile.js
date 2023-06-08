import { useEffect, useState } from "react";

export default function Tile(props) {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (!revealed) {
      setRevealed(true);
    }
  }, [revealed]);

  function handlePointerDown(e) {
    props.onPointerDown({
      letter: props.letter,
      value: props.value,
      key: props.id,
      id: props.id,
    }, { x: e.pageX, y: e.pageY });
  }

  function handlePointerMove(e) {
    props.onPointerMove({ x: e.pageX, y: e.pageY });
  }

  const tileClass = `tile${revealed ? ' revealed' : ''}${props.selected ? ' selected' : ''}`
  return (
    <>
      <div
        id={props.id}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        className={tileClass}
      >
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
          box-shadow: 0 0 calc(var(--board-size) / 100) #000000aa;
          font-size: calc(${props.size} / 1.5);
          font-weight: bold;
          font-family: 'interstate-bold', sans-serif;
          opacity: 0.5;
          translate: 0 -1rem;
          z-index: 3;
          transition: opacity 500ms ease, translate 500ms ease;
        }

        .tile * {
          pointer-events: none;
        }

        .tile:after {
          content: '${props.value}';
          position: absolute;
          bottom: 0;
          right: 10%;
          font-size: calc(${props.size} / 3);
        }

        .tile.revealed {
          opacity: 1;
          scale: 1;
          translate: 0;
        }
        
        .tile.selected {
          position: fixed;
          outline: 0.1rem solid lightgreen;
          translate: -50% -50%;
          transition: none;
        }
      `}</style>
    </>
  );
}