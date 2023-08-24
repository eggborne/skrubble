import { useEffect, useRef, useState } from "react";

export default function Tile(props) {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (!revealed) {
      setRevealed(true);
    }
  }, [revealed]);

  const tileClass =
    `tile ${props.owner} ${props.selected ? ' selected' : ''}${props.title ? ' title' : ''}${props.blank ? ' blank' : ''}${props.blankSelection ? ' blank-selection' : ''}${props.bag ? ' bag' : ''}${props.blank ? ' blank' : ''}${revealed ? ' revealed' : ''}${props.placed ? ' placed' : ''}${props.landed ? ' landed' : ''}${props.incongruent ? ' incongruent' : ''}${props.locked ? ' locked' : ''}`
  ;
  const tileOffset = props.offset || { x: 0, y: 0 };
  return (
    <>
      <div
        id={props.id}
        className={tileClass}
      >
        <span className='letter'>{props.letter.toUpperCase() === 'BLANK' ? '' : props.letter}</span>
        {/* {props.displayingWordScore && props.pendingTurnScore > 0 && <div className='word-score-display'>{props.pendingTurnScore}</div>} */}
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
          background-position: ${props.bgPosition}%;
          width: var(--current-size);
          height: var(--current-size);
          border-radius: calc(var(--current-size) / 8);
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
          
          z-index: 3;
          transition: opacity 200ms ease, transform 100ms ease;
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
            transform: scale(80%);
            transition: all 500ms ease, rotate 500ms ease 1200ms, background 0ms;

            &.revealed {
              transform: none;
              rotate: ${props.even ? '4deg' : '-4deg'};
            }
          }

          &.bag, &.blank-selection {
            position: relative;
            --current-size: var(--bag-display-tile-size);
            pointer-events: none;
          }

          &.blank-selection {
            border-radius: unset;
            background-image: unset;
          }

          &.selected {
            scale: var(--grabbed-tile-scale);
            cursor: grabbing;
            z-index: 5;
            opacity: 0.65 !important;
            // background-image: none;
            // background-color: #affa0088;
            transition: translate 100ms, scale 100ms ease !important;
            // transform-origin: center;
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

              &.incongruent {
                 background-color: rgb(241, 123, 171);
              }

              
              &.locked {
                position: absolute;
                top: 0;
                left: 0;
                transition: all 500ms ease;
                background-image: none;
                background-color: rgb(241, 223, 171);
              }
            }
          }

          &:not(.selected):not(.placed):not(.title) {
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

        // .tile.opponent > .letter, .tile.opponent:after {
        //   opacity: 0;
        // }

        // .tile > .word-score-display {
        //   position: absolute;
        //   display: flex;
        //   align-items: center;
        //   justify-content: center;
        //   font-size: calc(var(--played-tile-size) / 2);
        //   bottom: -35%;
        //   right: -25%;
        //   border-radius: 50%;
        //   color: white;
        //   background-color: green;
        //   width: calc(var(--played-tile-size));
        //   height: calc(var(--played-tile-size));
        //   z-index: 6;
        // }
      `}</style>
    </>
  );
}