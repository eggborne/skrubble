import Button from "./Button";
import Tile from "./Tile";
import { tileData } from "../scripts/scrabbledata";

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
alphabet.push('blank');

export default function BagModal(props) {
  return (
    <div className={`bag-modal${props.showing ? ' showing' : ''}`}>
      <h2 className='modal-title'>Remaining Tiles</h2>
      <div className='remaining-tile-grid'>
        {alphabet.map((letter, l) => {
            const amountInBag = props.bag.filter(tile => tile.letter.toUpperCase() === letter.toUpperCase()).length;
            return (
              <div key={`bag-tile-cell-${l}`} className={`bag-tile-cell${!amountInBag ? ' depleted' : ''}`}>
                <Tile bgPosition={`${100 - (3 * (l + 1))}`} letter={letter} value={tileData[letter.toLowerCase()].value} bag />
                <div className='tile-amount-label'>{amountInBag || <p>&nbsp;</p>}</div>
              </div>
            );
          })}
        
      </div>
      <div className='button-area'>
        <Button width={'8rem'} label={'OK'} clickAction={props.dismissModal} />
      </div>
      <style jsx>{`
        .bag-modal {
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
          background-color: var(--main-bg-color);
          border-radius: calc(var(--board-size) * 0.025);
          opacity: 0;
          translate: 0 15%;
          pointer-events: none;
          transition: all 400ms ease;
          z-index: 5;

          &.showing {
            opacity: 1;
            pointer-events: all;
            translate: 0 0;
            box-shadow: 
              0 0 calc(var(--board-size) / 100) #00000088,
              0 0 calc(var(--board-size) / 150) #000000aa inset
            ;
          }

          & > .modal-title {
            text-shadow: 
              1px 1px calc(var(--button-height) / 64) #000000,
              -1px 1px calc(var(--button-height) / 64) #000000,
              -1px -1px calc(var(--button-height) / 64) #000000,
              1px -1px calc(var(--button-height) / 64) #000000
            ;
          }

          & > .remaining-tile-grid {
            position: relative;
            display: grid;
            grid-template-rows: repeat(4, 1fr);
            grid-template-columns: repeat(7, var(--bag-display-tile-size));
            padding: calc(var(--board-size) * 0.01);
            gap: calc(var(--board-size) * 0.01);

            & * {
              cursor: unset;
            }

            & > .bag-tile-cell {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;

              &.depleted {
                opacity: 0.25;
              }

              & > .tile-amount-label {
                color: white;
                width: min-content;
                padding: 5% 15%;
                font-size: calc(var(--bag-display-tile-size) * 0.35);
                text-shadow: 
                  1px 1px calc(var(--button-height) / 64) #000000,
                  -1px 1px calc(var(--button-height) / 64) #000000,
                  -1px -1px calc(var(--button-height) / 64) #000000,
                  1px -1px calc(var(--button-height) / 64) #000000
                ;
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