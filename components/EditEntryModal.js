import Button from "./Button";

export default function EditEntryModal(props) {
  console.warn('rendering EditEntryModal', props);
  function onAcceptEditEntry(e) {
    props.handleAcceptRuleEdit();
  }
  const confirmMessage = `Editing ${props.currentlyEditingType} ${props.selectedUnit.rowEntry.toUpperCase()}`;

  return (
    <div className={`edit-entry-modal${props.showing ? ' showing' : ''}`}>
      {props.currentlyEditingType && props.selectedUnit && <h1 className='modal-title'>{props.showing && confirmMessage}</h1>}
      <div className='button-area'>
        <Button disabled={!props.showing} color='green' width={'8rem'} label={'OK'} clickAction={onAcceptEditEntry} />
        <Button disabled={!props.showing} width={'8rem'} label={'Cancel'} clickAction={props.dismissModal} />
      </div>
      <style jsx>{`
        .edit-entry-modal {
          position: fixed;
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
          gap: calc(var(--board-size) * 0.025);
          padding: calc(var(--board-size) * 0.05);
          background-color: #885577;
          border-radius: var(--modal-border-radius);
          opacity: 0.5;
          translate: 0 15%;
          pointer-events: none;
          transition: all 400ms ease;
          z-index: 8;

          &.showing {
            opacity: 1;
            pointer-events: all;
            translate: 0 0;
            box-shadow: var(--modal-shadow);
          }

          & > .modal-title {
            text-shadow: var(--text-stroke);
            font-size: calc(var(--board-size) / 30);
            display: flex;
            align-items: center;
            justify-content: center;
            height: 4rem;
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