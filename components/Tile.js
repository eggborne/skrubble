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

  const tileClass =
    `tile ${props.owner}
    ${props.selected ? ' selected' : ''}
    ${props.title ? ' title' : ''}
    ${revealed ? ' revealed' : ''}
    ${props.placed ? ' placed' : ''}
    ${props.landed ? ' landed' : ''}`
  ;
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
          border-radius: calc(var(--current-size) / 12);
          box-shadow: 
            0 0 calc(var(--current-size) / 24) #000000aa,
            0 0 calc(var(--current-size) / 24) #000000aa inset
          ;
          border: 1px solid #000;
          font-size: calc(var(--current-size) / 1.5);
          font-weight: 700;
          font-family: 'Open Sans', sans-serif;
          color: #000000;
          opacity: 0;
          // transform: translateY(-50%);
          z-index: 3;
          transition: opacity 500ms ease, transform 500ms ease;
          // transition: none !important;
          cursor: ${props.draggable ? 'grab' : 'unset'};
          pointer-events: all;
          

          &.revealed {
            translate: ${tileOffset.x}px ${tileOffset.y}px;
            opacity: 1;
            scale: 1;
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
            scale: var(--grabbed-tile-scale);
            cursor: grabbing;
            z-index: 5;
            opacity: 0.65 !important;
            background-image: none;
            background-color: #affa0088;
            transition: translate 80ms, scale 100ms ease !important;
            transform-origin: center;
            box-shadow: none;
          }

          &.placed {
            box-shadow: 
              0 0 calc(var(--current-size) / 32) calc(var(--current-size) / 64) #00000044,
              0 0 calc(var(--current-size) / 10) #00000066 inset
            ;
            border: 1px solid #00000099;
            scale: var(--rack-board-tile-ratio);
            transition: none;
            transform-origin: top left;
            opacity: 0;

            &.landed {
              opacity: 1;
              transition: opacity 150ms ease;
            }
          }

          &:not(.selected):not(.placed) {
            transition: all 500ms ease;
            z-index: 2;
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

        // @media screen and (orientation: portrait) {
        //   .tile.revealed.placed {
        //     background: orange;
        //     // transition: none !important;
        //   }
        // }
      `}</style>
    </>
  );
}