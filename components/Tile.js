import { useEffect, useState } from "react";

export default function Tile(props) {
  if (props.placed) {
    // console.log('placed tile props', props)
  }
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (!revealed) {
      setRevealed(true);
    }
  }, [revealed]);

  const tileClass = `tile ${props.owner}${props.selected ? ' selected' : ''}${props.title ? ' title' : ''}${revealed ? ' revealed' : ''}${props.placed ? ' placed' : ''}`;
  const tileOffset = props.offset || { x: 0, y: 0 };
  return (
    <>
      <div
        id={props.id}
        className={tileClass}
      >
        <span className='letter'>{props.letter}</span>
      </div>
      <style jsx>{`
        .tile {
          --current-size: var(--racked-tile-size);
          box-sizing: border-box;
          position: absolute;
          top: 0;
          left: 0;
          color: black;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #ffff99;
          background-image: url(../floorwood.png);
          background-repeat: no-repeat;
          width: var(--current-size);
          height: var(--current-size);
          // min-width: var(--current-size);
          // min-height: var(--current-size);
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
          // transition: none !important;
          cursor: ${props.draggable ? 'grab' : 'unset'};
          pointer-events: all;
          // transform-origin: center;
          transform-origin: top left;
          
          &.revealed {
            opacity: 1;
            scale: 1;
            translate: ${tileOffset.x}px ${tileOffset.y}px;
            transform: none;
          }

          &.title {
            position: relative;
            --current-size: var(--title-tile-size);
            translate: none;
            cursor: unset;
          }

          &.selected {
            // --current-size: calc(var(--racked-tile-size) * 1.5);
            // scale: 1.5 !important;
            cursor: grabbing;
            z-index: 5;
            opacity: 0.65 !important;
            background-image: none;
            background-color: #affa0088;
            transition: translate 80ms, scale 100ms ease !important;
          }

          &.placed {
            box-shadow: 
              0 0 calc(var(--current-size) / 18) #00000044,
              0 0 calc(var(--current-size) / 18) #00000077 inset
            ;
            border: 1px solid #00000099;
            scale: 1;
            scale: var(--rack-board-tile-ratio);
            transition: translate 60ms, scale 80ms ease !important;
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
      `}</style>
    </>
  );
}