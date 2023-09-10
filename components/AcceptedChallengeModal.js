import Button from "./Button";

export default function AcceptedChallengeModal(props) {
  const titleLegend = `Game start!`;
  return (
    <div className={`accepted-challenge-modal${props.showing ? ' showing' : ''}`}>
      <h2 className='modal-title'>{titleLegend}</h2>
      <h4>{`A new game with ${props.opponent.displayName} will start, with your turn first.`}</h4>      
      <div className='button-area'>
        <Button disabled={!props.showing} width={'6rem'} label={'Cancel'} clickAction={props.dismissModal} />
        <Button disabled={!props.showing} color={'green'} width={'14rem'} label={'GO!'} clickAction={props.startGameWithOpponent} />
      </div>
      <style jsx>{`
        .accepted-challenge-modal {
          position: absolute;
          min-width: 30rem;
          max-width: 100vw;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          transform-origin: 50% 50%;
          padding: 0 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
          gap: calc(var(--board-size) * 0.05);
          padding: calc(var(--board-size) * 0.05);
          background-color: var(--main-modal-color);
          border-radius: var(--modal-border-radius);
          opacity: 0;
          translate: 0 15%;
          pointer-events: none;
          transition: all 400ms ease;
          z-index: 7;

          &.showing {
            opacity: 1;
            pointer-events: all;
            translate: 0 0;
            box-shadow: var(--modal-shadow);
          }

          & > .modal-title {
            width: max-content;
            text-shadow: var(--text-stroke);
            padding: 5% 0;
            font-family: 'Aladin';
            font-size: calc(var(--board-size) * 0.075);
          }

          & > h2, & > h4 {
            text-align: center;
            font-weight: normal;
          }
        
          & > .button-area {
            display: flex;
            gap: 5%;
          }
        }

      `}</style>
    </div>
  );
}