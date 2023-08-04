import { useEffect, useState } from "react";

export default function Tile(props) {
  const [revealed, setRevealed] = useState(false);
  const [originalRackPosition, setOriginalRackPosition]  = useState({});

  useEffect(() => {
    if (!revealed) {
      setRevealed(true);
      if (props.draggable) {
        const rackPosition = { 
          x: document.getElementById(props.id).getBoundingClientRect().x, 
          y: document.getElementById(props.id).getBoundingClientRect().y 
        };
        setOriginalRackPosition(rackPosition);
      }
    }
  }, [revealed]);

  function handlePointerDown(e) {
    const tileObject = {
      letter: props.letter,
      value: props.value,
      key: props.id,
      id: props.id,
      originalPosition: originalRackPosition,
    };
    props.onPointerDown(tileObject, { x: e.pageX, y: e.pageY });
  }

  const tileClass = `tile${revealed ? ' revealed' : ''}${props.selected ? ' selected' : ''}`
  return (
    <>
      <div
        id={props.id}
        onPointerDown={props.draggable ? handlePointerDown : () => null}
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
          // transition: opacity 500ms ease, translate 500ms ease;
          transition: all 500ms ease;
          cursor: grab;
        }

        .tile * {
          pointer-events: none;
        }

        .tile:after {
          content: '${props.value}';
          position: absolute;
          bottom: 5%;
          right: 10%;
          font-size: calc(${props.size} / 4);
        }

        .tile.revealed {
          opacity: 1;
          scale: 1;
          translate: 0;
        }
        
        .tile.selected {
          transform-origin: 0 -25%;
          outline: 0.1rem solid lightgreen;
          transition: scale 100ms ease !important;
          cursor: grabbing;
          z-index: 999;
        }
        
        .tile.selected.over-board {
          scale: 0.525;
        }
      `}</style>
    </>
  );
}