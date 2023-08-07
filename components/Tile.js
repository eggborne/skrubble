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

  const tileClass = `tile${props.selected ? ' selected' : ''}${props.placed ? ' placed' : ''}${props.title ? ' title' : ''}${revealed ? ' revealed' : ''}`;
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
          --current-size: var(--racked-tile-size);
          box-sizing: border-box;
          position: relative;
          color: black;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #ffff99;
          background-image: url(../floorwood.png);
          width: var(--current-size);
          height: var(--current-size);
          min-width: var(--current-size);
          min-height: var(--current-size);
          border-radius: calc(var(--current-size) / 16);
          box-shadow: 
            0 0 calc(var(--current-size) / 24) #000000aa,
            0 0 calc(var(--current-size) / 24) #000000aa inset
          ;
          border: 1px solid #000;
          font-size: calc(var(--current-size) / 1.5);
          font-weight: bold;
          font-family: 'interstate-bold', sans-serif;
          opacity: 0.5;
          translate: 0 -50%;
          z-index: 3;
          // transition: opacity 500ms ease, translate 500ms ease;
          transition: all 500ms ease;
          cursor: ${props.draggable ? 'grab' : 'unset'};
          pointer-events: all;

          &.title {
            --current-size: var(--title-tile-size);
            translate: none;
            cursor: unset;
          }
        }

        .tile * {
          pointer-events: none;
        }

        .tile:after {
          content: '${props.value}';
          position: absolute;
          bottom: 5%;
          right: 10%;
          font-size: 35%;
        }

        .tile.revealed {
          opacity: 1;
          scale: 1;
          translate: 0;
        }
        
        .tile.selected {
          transform-origin: 0 -25%;
          transition: scale 100ms ease !important;
          cursor: grabbing;
          z-index: 999;
          scale: 1.25;
          opacity: 0.65;
        }
        
        .tile.placed {
          --current-size: var(--played-tile-size);
          position: absolute;
          left: 50%;
          top: 50%;
          translate: -50% -50%;
          box-shadow: 
            0 0 calc(var(--current-size) / 18) #00000044,
            0 0 calc(var(--current-size) / 18) #00000077 inset
          ;
          border: 1px solid #00000066;
          scale: 1.5;

          &.revealed {
            transition-duration: 100ms;
            scale: 1;
          }
        }
      `}</style>
    </>
  );
}