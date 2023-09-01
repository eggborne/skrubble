import Button from "./Button";

export default function ConfirmAddFollowerModal(props) {
  
  function onAcceptRuleEdit(e) {
    props.handleClickAcceptRuleEdit();
  }
  
  return (
    <div className={`confirm-add-follower-modal${props.showing ? ' showing' : ''}`}>
      {props.currentlyEditingType && props.selectedUnit.rowEntry.newFollower && <h1 className='modal-title'>
        <div>Really {props.action} rule</div>
        <div className='selected-unit'>{props.selectedUnit.rowEntry.initialUnit.toUpperCase()}</div>
        <div>cannot be followed by</div>
        <div className='selected-unit'>{props.selectedUnit.rowEntry.newFollower ? props.selectedUnit.rowEntry.newFollower.toUpperCase() : ''}?</div>
      </h1>}

      <div className='button-area'>
        <Button disabled={!props.showing} color='green' width={'8rem'} label={'OK'} clickAction={onAcceptRuleEdit} />
        <Button disabled={!props.showing} width={'8rem'} label={'Cancel'} clickAction={props.dismissModal} />
      </div>
      <style jsx>{`
        .confirm-add-follower-modal {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          transform-origin: 50% 50%;
          display: flex;
          max-width: 90vw;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
          gap: calc(var(--board-size) * 0.025);
          padding: calc(var(--board-size) * 0.05);
          background-color: #885577;
          border-radius: calc(var(--board-size) * 0.025);
          opacity: 0;
          translate: 0 15%;
          pointer-events: none;
          transition: all 400ms ease;
          z-index: 6;

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
            font-size: calc(var(--board-size) / 30);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            padding: 0.5rem;

            & > p {
              color: #ccc;
              font-size: 85%;             
            }

            & > .selected-unit {
              font-size: var(--played-tile-size);
            }
          }

          & > .button-area {
            display: flex;
            gap: 1rem;
          }
        }
      `}</style>
    </div>
  );
}