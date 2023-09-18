import Button from "./Button";
import Tile from "./Tile";
import { tileData } from "../scripts/scrabbledata";
import { useMemo, useRef } from "react";

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
alphabet.push('blank');

export default function GameMenuModal(props) {
  return (
    <div className={`game-menu-modal${props.showing ? ' showing' : ''}`}>
      <Button disabled={!props.showing} width='12rem' label='Back to Lobby' clickAction={props.handleClickBackToLobby} />
      <Button disabled={!props.showing} width='12rem' color='red' label='Forfeit Game' clickAction={props.handleClickForfeitGame} />
      <div className='button-area'>
        <Button width={'8rem'} label={'OK'} clickAction={props.dismissModal} />
      </div>
      <style jsx>{`
        .game-menu-modal {
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
          background-color: var(--main-modal-color);
          border-radius: var(--modal-border-radius);
          opacity: 0;
          translate: 0 15%;
          pointer-events: none;
          transition: all 400ms ease;
          z-index: 5;

          &.showing {
            opacity: 1;
            pointer-events: all;
            translate: 0 0;
            box-shadow: var(--modal-shadow);
          }

          & > .modal-title {
            text-shadow: var(--text-stroke);
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