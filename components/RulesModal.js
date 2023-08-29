import { useState } from "react";
import Button from "./Button";
import ConfirmModal from "./ConfirmModal";
import { pause } from "../scripts/util";

export default function RulesModal(props) {
  const [selectedUnit, setSelectedUnit] = useState({
    id: '',
    string: '',
    rowEntry: '',
  });
  const [currentlyAdding, setCurrentlyAdding] = useState(undefined);
  const [confirmModalShowing, setConfirmModalShowing] = useState(false);
  const [errorShowing, setErrorShowing] = useState('');

  let onsetArrays = [[], [], [], [], []];
  let nucleusArrays = [[], [], [], [], []];
  let codaArrays = [[], [], [], [], []];
  props.wordRules.onsets.forEach(unit => {
    onsetArrays[unit.length - 1].push(unit);
  });
  onsetArrays = onsetArrays.filter(arr => arr.length);
  props.wordRules.nuclei.forEach(unit => {
    nucleusArrays[unit.length - 1].push(unit);
  });
  nucleusArrays = nucleusArrays.filter(arr => arr.length);
  props.wordRules.codas.forEach(unit => {
    codaArrays[unit.length - 1].push(unit);
  });
  codaArrays = codaArrays.filter(arr => arr.length);

  let followersArray = [];
  const allUnits = [...props.wordRules.onsets, ...props.wordRules.nuclei, ...props.wordRules.codas];
  const uniqueUnits = [...new Set(allUnits)].sort();;
  for (let initialUnit of uniqueUnits) {
    const newObj = {
      initialUnit,
      followers: props.wordRules.invalidFollowers[initialUnit] || [],
    };
    followersArray.push(newObj);
  }
  followersArray = followersArray.sort((a, b) => a.initialUnit.length - b.initialUnit.length);

  function handleClickUnit(e) {
    const newUnitId = e.target.id;
    setSelectedUnit({
      id: newUnitId,
      string: e.target.innerHTML,
      rowEntry: e.target.innerHTML,
    });
    setCurrentlyAdding(undefined);
  }
  function handleClickFollower(e) {
    const newUnitId = e.target.id;
    setSelectedUnit({
      id: newUnitId,
      string: e.target.innerHTML,
      rowEntry: e.target.innerHTML,
    });
    setCurrentlyAdding(undefined);
  }
  function handleClickBannedString(e) {
    const newUnitId = e.target.id;
    setSelectedUnit({
      id: newUnitId,
      string: e.target.innerHTML,
      rowEntry: e.target.innerHTML,
    });
    setCurrentlyAdding(undefined);
  }
  function onClickAddUnitButton(e) {
    setSelectedUnit({
      id: '',
      string: '',
      rowEntry: '',
    });
    const unitType = e.target.id.split('-')[1];
    console.log('clicked ADD button!', unitType);
    setCurrentlyAdding(unitType);
  }
  function onClickAddFollowerButton(e) {
    setSelectedUnit({
      id: '',
      string: '',
      rowEntry: '',
    });
    const initialUnit = e.target.id.split('-')[0];
    console.log('clicked ADD button!', initialUnit);
    setCurrentlyAdding(initialUnit);
  }
  function onClickEditButton(e) {
    console.log('clicked EDIT button!');
  }
  function onClickDeleteButton(e) {
    console.log('clicked DELETE button!');
  }
  function handleSubmitAddUnitForm(e) {
    e.preventDefault();
    const newUnit = e.target['submit-unit'].value.trim().toLowerCase();
    const isAlpha = newUnit.split('').every(letter => letter.match(/[a-z]/i));
    let ruleName;
    if (currentlyAdding === 'onset' || currentlyAdding === 'coda') {
      ruleName = currentlyAdding + 's';
    } else if (currentlyAdding === 'nucleus') {
      ruleName = 'nuclei';
    }
    const alreadyListed = props.wordRules[ruleName].includes(newUnit);
    let inputValidated =
      newUnit.length
      && isAlpha
      && !alreadyListed
      ;
    if (inputValidated) {
      setSelectedUnit({
        id: `user-${currentlyAdding}`,
        string: newUnit,
        rowEntry: newUnit,
      });
      setConfirmModalShowing(true);
    } else {
      if (alreadyListed) {
        flashError(`${newUnit} already listed!`);
      } else if (!isAlpha) {
        flashError(`those aren't letters!`);
      } else if (!newUnit.length) {
        flashError(`there's nothing there!`);
      }
    }
  }

  async function flashError(message, duration = 1000) {
    setErrorShowing(message);
    await pause(duration);
    setErrorShowing('');
  }

  function handleAcceptRuleEdit() {
    setConfirmModalShowing(false);
    let ruleName;
    if (currentlyAdding === 'onset' || currentlyAdding === 'coda') {
      ruleName = currentlyAdding + 's';
    } else if (currentlyAdding === 'nucleus') {
      ruleName = 'nuclei';
    }
    const editInfoObj = {
      ruleName,
      rowEntry: selectedUnit.rowEntry,
    };
    props.handleClickAcceptRuleEdit(editInfoObj);
    setSelectedUnit({
      id: '',
      string: '',
      rowEntry: '',
    });
    setCurrentlyAdding(undefined);
  }

  function handleCancelAddUnit() {
    setCurrentlyAdding(undefined);

  }

  function handleDismissConfirmModal() {
    setConfirmModalShowing(false);
    setCurrentlyAdding(undefined);
    setSelectedUnit({
      id: '',
      string: '',
      rowEntry: '',
    });
  }
  return (
    <div className={`rules-modal${props.showing ? ' showing' : ''}`}>
      <h1 className='modal-title'>Word Rules</h1>
      {true &&
        <>
          <div className='rules-area'>
            <div className='rule-type-area'>
              <h2>Valid Word Units</h2>
              <div className='unit-listing'>
                <h3>Onsets</h3>
                <div className='unit-list'>
                  {onsetArrays.map((arr, a) =>
                    <div key={`onset-sublist-${a}`} className='unit-sublist'>
                      {arr.map((unit, o) =>
                        <div onClick={handleClickUnit} className={`word-unit${selectedUnit.id === `onset-${a}-${o}` ? ' selected' : ''}`} id={`onset-${a}-${o}`} key={`onset-${a}-${o}`}>{unit}</div>
                      )}
                      {(a === onsetArrays.length - 1) &&
                        <div className={'edit-delete-buttons'}>
                          <div
                            onClick={currentlyAdding !== 'onset' ? onClickAddUnitButton : () => null}
                            id='add-onset-button'
                            className={`add-button${currentlyAdding === 'onset' ? ' adding' : ''}`}
                          >
                            {currentlyAdding === 'onset' ?
                              <form onSubmitCapture={handleSubmitAddUnitForm} name='submit-unit' className='add-unit-form'>
                                <input name='submit-unit' className='add-unit-input' type='text'></input>
                                <button className={'confirm-button'} type='submit'>OK</button>
                                <button className={'cancel-button'} type='button' onClick={handleCancelAddUnit}>Cancel</button>
                              </form>
                              :
                              'ADD NEW ONSET'
                            }
                          </div>
                          {!currentlyAdding && selectedUnit.id.includes(`onset`) &&
                            <>
                              <div onClick={onClickEditButton} id='edit-onset-button' className='edit-button'>{`EDIT "${selectedUnit.string}"`}</div>
                              <div onClick={onClickDeleteButton} id='delete-onset-button' className='delete-button'>{`DELETE "${selectedUnit.string}"`}</div>
                            </>
                          }
                        </div>
                      }
                    </div>
                  )}
                  {currentlyAdding === 'onset' && <div className={'error-display'}>{errorShowing}</div>}
                </div>
              </div>
              <div className='unit-listing'>
                <h3>Nuclei</h3>
                <div className='unit-list'>
                  {nucleusArrays.map((arr, a) =>
                    <div key={`nucleus-sublist-${a}`} className='unit-sublist'>
                      {arr.map((unit, o) =>
                        <div onClick={handleClickUnit} className={`word-unit${selectedUnit.id === `nucleus-${a}-${o}` ? ' selected' : ''}`} id={`nucleus-${a}-${o}`} key={`nucleus-${a}-${o}`}>{unit}</div>
                      )}
                      {(a === nucleusArrays.length - 1) &&
                        <div className='edit-delete-buttons'>
                          <div
                            onClick={currentlyAdding !== 'nucleus' ? onClickAddUnitButton : () => null}
                            id='add-nucleus-button'
                            className={`add-button${currentlyAdding === 'nucleus' ? ' adding' : ''}`}>
                            {currentlyAdding === 'nucleus' ?
                              <form onSubmitCapture={handleSubmitAddUnitForm} name='submit-unit' className='add-unit-form'>
                                <input name='submit-unit' className='add-unit-input' type='text'></input>
                                <button className={'confirm-button'} type='submit'>OK</button>
                                <button className={'cancel-button'} type='button' onClick={handleCancelAddUnit}>Cancel</button>
                              </form>
                              :
                              'ADD NEW NUCLEUS'
                            }
                          </div>
                          {!currentlyAdding && selectedUnit.id.includes(`nucleus`) &&
                            <>
                              <div onClick={onClickEditButton} id='edit-nucleus-button' className='edit-button'>{`EDIT "${selectedUnit.string}"`}</div>
                              <div onClick={onClickDeleteButton} id='delete-nucleus-button' className='delete-button'>{`DELETE "${selectedUnit.string}"`}</div>
                            </>
                          }
                        </div>
                      }
                    </div>
                  )}
                  {currentlyAdding === 'nucleus' && <div className={'error-display'}>{errorShowing}</div>}
                </div>
              </div>
              <div className='unit-listing'>
                <h3>Codas</h3>
                <div className='unit-list'>
                  {codaArrays.map((arr, a) =>
                    <div key={`coda-sublist-${a}`} className='unit-sublist'>
                      {arr.map((unit, o) =>
                        <div onClick={handleClickUnit} className={`word-unit${selectedUnit.id === `coda-${a}-${o}` ? ' selected' : ''}`} id={`coda-${a}-${o}`} key={`coda-${a}-${o}`}>{unit}</div>
                      )}
                      {(a === codaArrays.length - 1) &&
                        <div className='edit-delete-buttons'>
                          <div
                            onClick={currentlyAdding !== 'coda' ? onClickAddUnitButton : () => null}
                            id='add-coda-button'
                            className={`add-button${currentlyAdding === 'coda' ? ' adding' : ''}`}>
                            {currentlyAdding === 'coda' ?
                              <form onSubmitCapture={handleSubmitAddUnitForm} name='submit-unit' className='add-unit-form'>
                                <input name='submit-unit' className='add-unit-input' type='text'></input>
                                <button className={'confirm-button'} type='submit'>OK</button>
                                <button className={'cancel-button'} type='button' onClick={handleCancelAddUnit}>Cancel</button>
                              </form>
                              :
                              'ADD NEW CODA'
                            }
                          </div>
                          {!currentlyAdding && selectedUnit.id.includes(`coda`) &&
                            <>
                              <div onClick={onClickEditButton} id='edit-coda-button' className='edit-button'>{`EDIT "${selectedUnit.string}"`}</div>
                              <div onClick={onClickDeleteButton} id='delete-coda-button' className='delete-button'>{`DELETE "${selectedUnit.string}"`}</div>
                            </>
                          }
                        </div>
                      }
                    </div>
                  )}
                  {currentlyAdding === 'coda' && <div className={'error-display'}>{errorShowing}</div>}
                </div>
              </div>
            </div>

            {followersArray.length > 0 && <div className='rule-type-area'>
              <h2>Invalid Followers</h2>
              <div className='follower-area'>
                {followersArray.map((followerSet, s) =>
                  <div key={`follower-entry-${s}`} className='follower-entry'>
                    <div>{followerSet.initialUnit}</div>
                    <div className='followers'>
                      {followerSet.followers.length > 0 && followerSet.followers.map((follower, f) =>
                        <div onClick={handleClickFollower} className={`word-unit${selectedUnit.id === `follower-${s}-${f}` ? ' selected' : ''}`} id={`follower-${s}-${f}`} key={`follower-${s}-${f}`}>{follower}</div>
                      )}
                      <div onClick={onClickAddFollowerButton} id={`${followerSet.initialUnit}-add-follower-button`} className='add-button'>ADD</div>
                      {!currentlyAdding && selectedUnit.id.includes(`follower-${s}`) &&
                        <>
                          <div onClick={onClickEditButton} className='edit-button'>{`EDIT "${selectedUnit.string}"`}</div>
                          <div onClick={onClickDeleteButton} className='delete-button'>{`DELETE "${selectedUnit.string}"`}</div>
                        </>}
                    </div>
                  </div>
                )}
              </div>
            </div>}

            {[...props.wordRules.startWord, ...props.wordRules.endWord, ...props.wordRules.universal, ...props.wordRules.loneWord].length > 0 && <div className='rule-type-area'>
              <h2>Banned strings</h2>
              <div className='unit-listing'>
                <h3 className='sticky'>Beginning of word ({props.wordRules.startWord.length})</h3>
                <div className='unit-list long'>
                  {props.wordRules.startWord.map((segment, s) =>
                    <div onClick={handleClickBannedString} className={`word-unit${selectedUnit === `start-word-segment-${s}` ? ' selected' : ``}`} id={`start-word-segment-${s}`} key={`start-word-segment-${s}`}>{segment}</div>
                  )}
                  <div onClick={onClickAddUnitButton} className='add-button'>ADD</div>
                  <div onClick={onClickEditButton} className='edit-button'>EDIT</div>
                </div>
              </div>
              <div className='unit-listing'>
                <h3 className='sticky'>End of word ({props.wordRules.endWord.length})</h3>
                <div className='unit-list long'>
                  {props.wordRules.endWord.map((segment, s) =>
                    <div onClick={handleClickBannedString} className={`word-unit${selectedUnit === `end-word-segment-${s}` ? ' selected' : ``}`} id={`end-word-segment-${s}`} key={`end-word-segment-${s}`}>{segment}</div>
                  )}
                  <div onClick={onClickAddUnitButton} className='add-button'>ADD</div>
                  <div onClick={onClickEditButton} className='edit-button'>EDIT</div>
                </div>
              </div>
              <div className='unit-listing'>
                <h3 className='sticky'>Anywhere in word ({props.wordRules.universal.length})</h3>
                <div className='unit-list long'>
                  {props.wordRules.universal.map((segment, s) =>
                    <div onClick={handleClickBannedString} className={`word-unit${selectedUnit === `universal-word-segment-${s}` ? ' selected' : ``}`} id={`universal-word-segment-${s}`} key={`universal-word-segment-${s}`}>{segment}</div>
                  )}
                  <div onClick={onClickAddUnitButton} className='add-button'>ADD</div>
                  <div onClick={onClickEditButton} className='edit-button'>EDIT</div>
                </div>
              </div>
              <div className='unit-listing'>
                <h3 className='sticky'>Exact word ({props.wordRules.loneWord.length})</h3>
                <div className='unit-list long'>
                  {props.wordRules.loneWord.map((segment, s) =>
                    <div onClick={handleClickBannedString} className={`word-unit${selectedUnit === `exact-word-segment-${s}` ? ' selected' : ``}`} id={`exact-word-segment-${s}`} key={`exact-word-segment-${s}`}>{segment}</div>
                  )}
                  <div onClick={onClickAddUnitButton} className='add-button'>ADD</div>
                  <div onClick={onClickEditButton} className='edit-button'>EDIT</div>
                </div>
              </div>
            </div>}
          </div>
        </>
      }
      <div className='button-area'>
        <Button width={'8rem'} label={'OK'} clickAction={props.dismissModal} />
      </div>
      <ConfirmModal
        showing={confirmModalShowing}
        handleClickAcceptRuleEdit={handleAcceptRuleEdit}
        dismissModal={handleDismissConfirmModal}
        selectedUnit={selectedUnit}
        currentlyAdding={currentlyAdding}
      />
      <style jsx>{`
        .rules-modal {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          transform-origin: 50% 50%;
          padding: 0 2rem;
          display: flex;
          height: calc(var(--actual-height) * 0.9);
          min-width: calc(var(--board-size) * 0.9);
          max-width: 90vw;
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
            position: absolute;
            top: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 4rem;
          }

          & > .rules-area {
            position: relative;
            display: flex;
            flex-direction: column;
            padding: calc(var(--board-size) * 0.01);
            gap: calc(var(--board-size) * 0.03);
            overflow-y: scroll;
            margin-top: 3rem;
            text-transform: uppercase;

            & h3.sticky {
              position: sticky;
              top: -0.5rem;
              padding: 1rem 0;
              background-color: var(--main-bg-color);
            }

            & > .rule-type-area {
              display: flex;
              flex-direction: column;
              gap: 1rem;
              padding: 1rem;

              & .unit-listing {
                display: flex;
                flex-direction: column;
                padding: 1rem 0.75rem;
                gap: 0.5rem 0;
                background-color: #00000033;
                border-radius: calc(var(--board-size) * 0.01);

                & > .unit-list {
                  position: relative;
                  display: flex;
                  flex-direction: column;
                  gap: 1rem;

                  .error-display {
                    position: absolute;
                    color: #ff6666;
                    font-weight: bold;
                    right: 2%;
                    bottom: 2%;
                  }
                  
                  &.long {
                    flex-direction: row;
                    flex-wrap: wrap;
                    gap: 0.2rem;
                    font-size: 0.8rem;
                    
                    & > .word-unit {
                      padding: 0.15rem;
                    }
                  }

                  & > .unit-sublist {
                    display: flex;
                    gap: 0.25rem;
                    flex-wrap: wrap;

                  }
                }
              }

              & .word-unit {
                background-color: #ffffff33;
                padding: 0.25rem 0.5rem;
                min-width: 1.5rem;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                border-radius: calc(var(--board-size) * 0.005);

                &.selected {
                  background-color: green;
                }
              }
              
              & .edit-delete-buttons {
                display: flex;
                width: 100%;
                gap: 0.5rem;
                margin-top: 1rem;
              }

              & .add-button, & .edit-button, & .delete-button {
                display: flex;
                align-items: center;
                justify-content: center;                
                min-height: 3rem;
                background-color: #aaffaa;
                color: black;
                font-weight: bold;
                font-size: 0.8rem !important;
                border-radius: calc(var(--board-size) * 0.005);
                padding: 0 3%;
                cursor: pointer;
                transition: all 100ms ease, background-color 0ms;

                &:hover {
                  outline: 3px solid green;
                }

                &:active {
                  scale: 0.95;
                }
              }

              & .add-button {

                &.adding {
                  min-width: 9rem;
                  width: min-content;
                  padding: 0 !important;
                  background-color: #0000ff55;
                  background-color: transparent;

                  &:active {
                    scale: 1;
                  }
                  &:hover {
                    outline: none;
                  }
                }
              }

              & .add-unit-form {
                width: 100%;
                display: flex;
                gap: 0.5rem;
                padding: 0 0.75rem;

                & > .add-unit-input {
                  margin: 0;
                  width: 4rem;
                  font-size: 1.75rem;
                  height: 2.5rem;
                  text-transform: uppercase;
                  text-align: center;
                }

                & > button.confirm-button {
                  background-color: #aaffaa;
                }
                & > button.cancel-button {
                  background-color: #ffaaaa;
                }
              }
              & button {
                width: 4rem;
                border-radius: calc(var(--board-size) * 0.0075);
              }

              & .edit-button {
                background-color: #ffffaa;
              }
              
              & .delete-button {
                background-color: #ffaaaa;
                width: unset;
                padding: 0 2%;
              }

              & > .follower-area {
                display: flex;
                flex-direction: column;

                & > .follower-entry {
                  display: grid;
                  grid-template-columns: 2.5rem 1fr;
                  padding: 0.5rem;
                  align-items: center;                  
                  font-weight: bold;

                  &:nth-of-type(odd) {
                    background-color: #00000011;
                  }

                  & > .followers {
                    font-weight: normal;
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.25rem;
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