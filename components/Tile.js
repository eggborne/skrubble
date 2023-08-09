import { useEffect, useState } from "react";

export default function Tile(props) {
  const [revealed, setRevealed] = useState(false);
  const [originalRackPosition, setOriginalRackPosition]  = useState({});

  useEffect(() => {
    if (!revealed) {
      setRevealed(true);
      if (props.draggable && !props.placed) {
        const rackPosition = { 
          x: document.getElementById(props.id).getBoundingClientRect().x, 
          y: document.getElementById(props.id).getBoundingClientRect().y,
        };
        setOriginalRackPosition(rackPosition);
      }
    }
  }, [revealed]);

  function handlePointerDown(e) {
    const tileObject = {
      // letter: props.letter,
      // value: props.value,
      // key: props.id,
      // id: props.id,
      ...props,
      originalPosition: originalRackPosition,
    };
    props.onPointerDown(e, tileObject, { x: e.pageX, y: e.pageY });
  }

  function handlePointerUp(e) {
    console.log('up on', e.target.id);
    props.onPointerUp(e)
  }

  const tileClass = `tile ${props.owner}${props.selected ? ' selected' : ''}${props.placed ? ' placed' : ''}${props.title ? ' title' : ''}${revealed ? ' revealed' : ''}`;
  return (
    <>
      <div
        id={props.id}
        onPointerDownCapture={props.draggable ? handlePointerDown : () => null}
        onPointerUpCapture={props.selected && props.draggable ? handlePointerUp : () => null}
        className={tileClass}
      >
        <span className='letter'>{props.letter.toUpperCase()}</span>
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
          background-repeat: no-repeat;
          width: var(--current-size);
          height: var(--current-size);
          min-width: var(--current-size);
          min-height: var(--current-size);
          border-radius: calc(var(--current-size) / 14);
          // box-shadow: 
          //   0 0 calc(var(--current-size) / 24) #000000aa,
          //   0 0 calc(var(--current-size) / 24) #000000aa inset
          // ;
          border: 1px solid #000;
          font-size: calc(var(--current-size) / 1.5);
          font-weight: 700;
          font-family: 'Open Sans', sans-serif;
          color: #000000;
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

        .tile.opponent {
          translate: none;
        }

        .tile.opponent > .letter, .tile.opponent:after {
          opacity: 0.2;
        }

        .tile.revealed {
          opacity: 1;
          scale: 1;
          translate: 0;
          transform: none;
        }
        
        .tile.selected {
          transition: scale 100ms ease;
          cursor: grabbing;
          z-index: 5;
          opacity: 0.65;
        }
        
        .tile.placed {
          --current-size: var(--played-tile-size);
          position: absolute;
          left: 50%;
          top: 50%;
          translate: -50% -50%;
          // box-shadow: 
          //   0 0 calc(var(--current-size) / 18) #00000044,
          //   0 0 calc(var(--current-size) / 18) #00000077 inset
          // ;
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