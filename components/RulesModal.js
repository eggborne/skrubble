import Button from "./Button";

export default function RulesModal(props) {
  return (
    <div className={`rules-modal${props.showing ? ' showing' : ''}`}>
      <h2 className='modal-title'>Word Rules</h2>
      <div className='rules-grid'>
        grid 
      </div>
      <div className='button-area'>
        <Button width={'8rem'} label={'OK'} clickAction={props.dismissModal} />
      </div>
      <style jsx>{`
        .rules-modal {
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
          translate: 0 25%;
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

          & > .rules-grid {
            position: relative;
            display: grid;
            grid-template-rows: repeat(4, 1fr);
            grid-template-columns: repeat(7, var(--bag-display-tile-size));
            padding: calc(var(--board-size) * 0.01);
            gap: calc(var(--board-size) * 0.01);
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