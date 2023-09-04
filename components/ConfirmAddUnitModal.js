import Button from "./Button";

export default function ConfirmAddUnitModal(props) {
  console.warn('rendering ConfirmAddUnitModal ------------')
  function onAcceptRuleEdit(e) {
    props.handleClickAcceptRuleEdit();
  }
  console.log('prop', props)
  const confirmMessage = `Really ${props.action} ${props.currentlyEditingType} "${props.action !== 'edit' ? props.selectedUnit.rowEntry.toUpperCase() : props.selectedUnit.doomedUnit && props.selectedUnit.doomedUnit.toUpperCase() }"?`;
  
  return (
    <div className={`confirm-add-unit-modal${props.showing ? ' showing' : ''}`}>
      {props.currentlyEditingType && props.selectedUnit && <h1 className='modal-title'>{props.showing && confirmMessage}</h1>}
      {props.showing && props.action === 'edit' && <div className='modal-subtitle'>
        <div>{`It will be replaced by`}</div>
        <div className='replacing-unit'>{props.selectedUnit.rowEntry}</div>
      </div>}
      <div className='button-area'>
        <Button disabled={!props.showing} color='green' width={'8rem'} label={'OK'} clickAction={onAcceptRuleEdit} />
        <Button disabled={!props.showing} width={'8rem'} label={'Cancel'} clickAction={props.dismissModal} />
      </div>
      <style jsx>{`
        .confirm-add-unit-modal {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          transform-origin: 50% 50%;
          padding: 0 2rem;
          display: flex;
          max-width: 90vw;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
          gap: calc(var(--board-size) * 0.035);
          padding: calc(var(--board-size) * 0.05);
          background-color: #885577;
          border-radius: var(--modal-border-radius);
          opacity: 0;
          translate: 0 15%;
          pointer-events: none;
          transition: all 400ms ease;
          z-index: 6;

          &.showing {
            opacity: 1;
            pointer-events: all;
            translate: 0 0;
            box-shadow: var(--modal-shadow);
          }

          & > .modal-title, .modal-subtitle {
            text-shadow: var(--text-stroke);
            font-size: calc(var(--board-size) / 30);
            display: flex;
            align-items: center;
            justify-content: center;
            height: 3rem;
          }

          & > .modal-subtitle {
            height: unset;
            display: flex;
            flex-direction: column;
            gap: 1rem;
            font-size: calc(var(--board-size) / 32);

            & > .replacing-unit {
              text-transform: uppercase;
              font-weight: bold;
              padding: 0.5rem 0;
              font-size: calc(var(--board-size) / 18);
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