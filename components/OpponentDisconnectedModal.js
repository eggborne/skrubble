import Button from "./Button";

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
alphabet.push('blank');

export default function OpponentDisconnectedModal(props) {
  return (
    <div className={`opponent-disconnected-modal${props.showing ? ' showing' : ''}`}>
      <h2 className='modal-title'>{props.opponent.displayName} forfeited!</h2>
      <div>You win by default.</div>
      <div className='button-area'>
        <Button width={'8rem'} label={'OK'} clickAction={props.dismissModal} />
      </div>
      <style jsx>{`
        .opponent-disconnected-modal {
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
        }

        div button {
          font-size: 1rem;
          color: green;
        }
      `}</style>
    </div>
  );
}