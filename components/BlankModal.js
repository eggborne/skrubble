import { useState } from "react";
import Button from "./Button";
import Tile from "./Tile";

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export default function BlankModal(props) {
  const [selectedLetter, setSelectedLetter] = useState(undefined);

  function handleClickLetter(e) {
    const clickedLetter = e.target.id;
    setSelectedLetter(clickedLetter);
  }
  function handleClickOkay(e) {
    props.dismissModal(selectedLetter);
  }
  return (
    <div className={`blank-modal${props.showing ? ' showing' : ''}`}>
      <h2 className='modal-title'>Choose a Letter</h2>
      <div className='blank-tile-grid'>
        {alphabet.map((letter, l) =>
          <div key={`blank-tile-cell-${l}`} className={`blank-tile-cell${selectedLetter === letter ? ' selected' : ''}`} id={letter} onClick={handleClickLetter}>
            <Tile bgPosition={`${100 - (3 * (l + 1))}`} letter={letter} value={''} blankSelection />
          </div>
        )}

      </div>
      <div className='button-area'>
        <Button width={'8rem'} label={'OK'} clickAction={handleClickOkay} disabled={!props.showing} />
      </div>
      <style jsx>{`
        .blank-modal {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          transform-origin: 50% 50%;
          padding: 0 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
          gap: calc(var(--board-size) * 0.025);
          padding: calc(var(--board-size) * 0.0325);
          background-color: #99aa99;
          border-radius: var(--modal-border-radius);
          opacity: 0;
          pointer-events: none;
          transition: all 400ms ease;
          z-index: 5;

          &.showing {
            opacity: 1;
            pointer-events: all;
            box-shadow: var(--modal-shadow);
          }

          & > .modal-title {
            text-shadow: var(--text-stroke);
          }

          & > .blank-tile-grid {
            position: relative;
            display: grid;
            grid-template-rows: repeat(4, 1fr);
            grid-template-columns: repeat(7, var(--bag-display-tile-size));
            padding: calc(var(--board-size) * 0.01);
            gap: calc(var(--board-size) * 0.015);

            & > .blank-tile-cell {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              cursor: pointer;
              transition: all 100ms ease;

              &.selected {
                box-sizing: border-box;
                outline: calc(var(--bag-display-tile-size) * 0.08) solid green;
                scale: 1.1;
              }
            }

          }
        }

        div button {
          font-size: 1rem;
          color: green;
        }
      `}</style>
    </div>
  );
}