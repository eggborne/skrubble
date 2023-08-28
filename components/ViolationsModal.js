import Button from "./Button";

export default function ViolationsModal(props) {
  return (
    <div className={`violations-modal${props.showing ? ' showing' : ''}`}>
      <h2 className='modal-title'>Violations</h2>
      <div className='violations-area'>
        {props.showing && props.unpronouncableWords.map(violationsObj =>
          <div className='word-area' key={`violations-obj-${violationsObj.wordObj.wordId}`}>
            <div className='violating-word'>{violationsObj.wordObj.word}</div>
            <div className='violating-word-rules'>
              {violationsObj.violations.violations.sort((a, b) => a.invalidString.index - b.invalidString.index).map((violationObj, v) =>
                <div className={'word-rule-listing'} key={`violation-rule-listing-${violationsObj.wordObj.wordId}-${v}`}>
                  <div><p>Rule:</p><p>{violationObj.rule.toUpperCase()}</p></div>
                  <div><p>Violating String:</p><p>{violationObj.invalidString.string.toUpperCase()} at index {violationObj.invalidString.index}</p></div>
                  <div><p>Details:</p><p>{violationObj.details.toUpperCase()}</p></div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <div className='button-area'>
        <Button disabled={!props.showing} width={'8rem'} label={'OK'} clickAction={props.dismissModal} />
      </div>
      <style jsx>{`
        .violations-modal {
          position: fixed;
          top: 50%;
          left: 50%;
          width: 40rem;
          max-width: 95vw;
          transform: translate(-50%, -50%);
          transform-origin: 50% 50%;
          padding: 0 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
          gap: calc(var(--board-size) * 0.025);
          padding: calc(var(--board-size) * 0.0325);
          background-color: rgb(120, 50, 30);
          border-radius: calc(var(--board-size) * 0.025);
          opacity: 0;
          translate: 0 25%;
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
          }

          & > .violations-area {
            position: relative;
            display: flex;
            flex-direction: column;
            align-items: stretch;
            padding: calc(var(--board-size) * 0.01);
            gap: calc(var(--board-size) * 0.01);

            & > .word-area {
              background-color: #00000022;
              display: grid;
              grid-template-columns: min-content 20rem;
              padding: calc(var(--board-size) * 0.01) calc(var(--board-size) * 0.02);
              gap: calc(var(--board-size) * 0.01) calc(var(--board-size) * 0.03);

              & > .violating-word {
                padding: 5%;
                font-size: 2rem;
                align-self: center;
              }
              & > .violating-word-rules {
                display: flex;
                flex-direction: column;
                

                & > .word-rule-listing {
                  display: flex;
                  flex-direction: column;
                  gap: 0.5rem;
                  padding: 2.5% 0;
                  
                  &:not(:last-of-type) {
                    border-bottom: 1px solid white;
                  }

                  & > div {
                    display: flex;
                    justify-content: space-between;
                    background-color: #ffffff11;
                    padding: 2.5%;
                    
                    & > p:last-of-type {
                      text-align: right;
                      font-weight: bold;
                    }
                  }
                }
              }
            }
          }
        }
      `}</style>
    </div>
  );
}