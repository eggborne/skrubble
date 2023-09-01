import { useState } from "react";
import Button from "./Button";
import ConfirmAddUnitModal from "./ConfirmAddUnitModal";
import { pause } from "../scripts/util";
import { validateInitialUnit } from "../scripts/validator";
import ConfirmAddFollowerModal from "./ConfirmAddFollowerModal";

export default function RulesModal(props) {
  const [selectedUnit, setSelectedUnit] = useState({
    id: '',
    string: '',
    rowEntry: '',
  });
  const [currentlyEditingType, setCurrentlyEditingType] = useState(undefined);
  const [currentEditAction, setCurrentEditAction] = useState(undefined);
  const [confirmModalShowing, setConfirmModalShowing] = useState('');
  const [errorShowing, setErrorShowing] = useState('');

  let onsetArrays = [[], [], [], [], []];
  let nucleusArrays = [[], [], [], [], []];
  let codaArrays = [[], [], [], [], []];
  props.wordRules.onsets.forEach(unit => {
    onsetArrays[unit.length - 1].push(unit);
  });
  onsetArrays = onsetArrays.filter(arr => arr.length);
  onsetArrays.forEach(lengthArray => lengthArray.sort());
  props.wordRules.nuclei.forEach(unit => {
    nucleusArrays[unit.length - 1].push(unit);
  });
  nucleusArrays = nucleusArrays.filter(arr => arr.length);
  nucleusArrays.forEach(lengthArray => lengthArray.sort());
  props.wordRules.codas.forEach(unit => {
    codaArrays[unit.length - 1].push(unit);
  });
  codaArrays = codaArrays.filter(arr => arr.length);
  codaArrays.forEach(lengthArray => lengthArray.sort());

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
    setCurrentlyEditingType(undefined);
  }
  function handleClickFollower(e) {
    const newUnitId = e.target.id;
    const initialUnit = e.target.parentNode.parentNode.childNodes[0].innerHTML;
    setSelectedUnit({
      id: newUnitId,
      string: e.target.innerHTML,
      rowEntry: {
        initialUnit,
        newFollower: e.target.innerHTML
      },
    });
    setCurrentlyEditingType(newUnitId.includes('follower') ? `invalidFollowers-${initialUnit}` : undefined);
  }
  function handleClickFollowerSelection(e) {
    const newUnitId = e.target.id;
    setSelectedUnit({
      id: newUnitId,
      string: e.target.innerHTML,
      rowEntry: e.target.innerHTML,
    });
  }
  function handleClickBannedString(e) {
    const newUnitId = e.target.id;
    setSelectedUnit({
      id: newUnitId,
      string: e.target.innerHTML,
      rowEntry: e.target.innerHTML,
    });
    setCurrentlyEditingType(undefined);
  }
  function onClickAddUnitButton(e) {
    setSelectedUnit({
      id: '',
      string: '',
      rowEntry: '',
    });
    const unitType = e.target.id.split('-')[1];
    setCurrentlyEditingType(unitType);
    setCurrentEditAction('add');
  }
  function onClickAddFollowerButton(e) {
    setSelectedUnit({
      id: '',
      string: '',
      rowEntry: '',
    });
    const initialUnit = e.target.id.split('-')[0];
    setCurrentlyEditingType(`invalidFollowers-${initialUnit}`);
    setCurrentEditAction('add');
  }
  function onClickEditButton(e) {
    setCurrentEditAction('edit');
  }
  function onClickDeleteWordUnitButton(e) {
    setCurrentEditAction('delete');
    setCurrentlyEditingType('unit');
    setConfirmModalShowing('unit-delete');
  }
  function onClickDeleteFollowerSetButton(initialUnit, newFollower) {
    const newSelectedUnit = { ...selectedUnit };
    newSelectedUnit.rowEntry = {
      initialUnit,
      newFollower,
    };
    setSelectedUnit(newSelectedUnit);
    setCurrentEditAction('delete');
    setCurrentlyEditingType('invalidFollowers');
    setConfirmModalShowing('follower-delete');
  }
  function handleSubmitAddUnitForm(e) {
    e.preventDefault();
    let ruleName;
    if (currentlyEditingType === 'onset' || currentlyEditingType === 'coda') {
      ruleName = currentlyEditingType + 's';
    } else if (currentlyEditingType === 'nucleus') {
      ruleName = 'nuclei';
    }
    const newUnit = e.target['submit-unit'].value.trim().toLowerCase();
    const isAlpha = newUnit.split('').every(letter => letter.match(/[a-z]/i));
    const alreadyListed = props.wordRules[ruleName].includes(newUnit);
    let inputValidated = newUnit.length && isAlpha && !alreadyListed;
    if (inputValidated) {
      setSelectedUnit({
        id: `user-${currentlyEditingType}`,
        string: newUnit,
        rowEntry: newUnit,
      });
      setConfirmModalShowing('unit');
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

  function handleSubmitAddFollowerSet(initialUnit, newFollower) {
    const newSelectedUnit = {
      id: `user-${currentlyEditingType}`,
      string: newFollower,
      rowEntry: {
        initialUnit,
        newFollower,
      },
    };
    setSelectedUnit(newSelectedUnit);
    setConfirmModalShowing('follower');
  }

  async function flashError(message, duration = 1000) {
    setErrorShowing(message);
    await pause(duration);
    setErrorShowing('');
  }

  function handleAcceptRuleEdit() {
    setConfirmModalShowing(false);
    let ruleName;
    if (currentlyEditingType.includes('invalidFollowers')) {
      ruleName = 'invalidFollowers';
    } else {
      const subType = selectedUnit.id.split('-')[currentEditAction === 'add' ? 1 : 0];
      if (subType === 'onset' || subType === 'coda') {
        ruleName = subType + 's';
      } else if (subType === 'nucleus') {
        ruleName = 'nuclei';
      }
    }
    const editInfoObj = {
      ruleName,
      rowEntry: selectedUnit.rowEntry,
      editAction: currentEditAction,
    };
    props.handleClickAcceptRuleEdit(editInfoObj);
    setSelectedUnit({
      id: '',
      string: '',
      rowEntry: '',
    });
    setCurrentlyEditingType(undefined);
    setCurrentEditAction(undefined);
  }

  function handleCancelAddUnit() {
    setCurrentlyEditingType(undefined);
    setCurrentEditAction(undefined);
    setSelectedUnit({
      id: '',
      string: '',
      rowEntry: '',
    });
  }

  function handleDismissConfirmModal(keepType) {
    setConfirmModalShowing(false);
    !keepType && setCurrentlyEditingType(undefined);
    !keepType && setCurrentEditAction(undefined);
    setSelectedUnit({
      id: '',
      string: '',
      rowEntry: '',
    });
  }

  function getPotentialFollowers(initialUnit) {
    const existingFollowers = props.wordRules.invalidFollowers[initialUnit] || [];
    const potentialFollowers = [];
    let validFollowerTypes = [];
    const types = validateInitialUnit(initialUnit, props.wordRules).types.map(type => {
      if (type === 'onset' || type === 'coda') {
        return type + 's';
      } else if (currentlyEditingType === 'nucleus') {
        return 'nuclei';
      }
    });
    const restrictiveOnset = types.includes('onsets') && !types.includes('codas');
    const restrictiveCoda = !types.includes('onsets') && types.includes('codas');

    types.forEach(type => {
      if (type === 'onsets') {
        if (restrictiveOnset) {
          validFollowerTypes.push('nuclei');
        } else {
          validFollowerTypes.push('nuclei', 'onsets');
        }
      } else if (type === 'codas') {
        if (restrictiveCoda) {
          validFollowerTypes.push('nuclei', 'onsets');
        } else {
          validFollowerTypes.push('nuclei', 'onsets');
        }
      } else {
        validFollowerTypes.push('onsets', 'codas');
      }
    });

    validFollowerTypes = [...new Set(validFollowerTypes)];

    validFollowerTypes.forEach(validType => {
      potentialFollowers.push(props.wordRules[validType]);
    });

    const allFollowers = [...new Set(potentialFollowers.flat())];
    return allFollowers.filter(follower => !existingFollowers.includes(follower));
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
                            onClick={currentlyEditingType !== 'onset' ? onClickAddUnitButton : () => null}
                            id='add-onset-button'
                            className={`add-button${currentlyEditingType === 'onset' ? ' adding' : ''}`}
                          >
                            {currentlyEditingType === 'onset' ?
                              !confirmModalShowing && <form onSubmitCapture={handleSubmitAddUnitForm} name='submit-unit' className='add-unit-form'>
                                <input name='submit-unit' className='add-unit-input' type='text'></input>
                                <button className={'confirm-button'} type='submit'>OK</button>
                                <button className={'cancel-button'} type='button' onClick={handleCancelAddUnit}>Cancel</button>
                              </form>
                              :
                              'ADD NEW ONSET'
                            }
                          </div>
                          {!currentlyEditingType && selectedUnit.id.includes(`onset`) &&
                            <>
                              <div onClick={onClickEditButton} id='edit-onset-button' className='edit-button'>{`EDIT "${selectedUnit.string}"`}</div>
                              <div onClick={onClickDeleteWordUnitButton} id='delete-onset-button' className='delete-button'>{`DELETE "${selectedUnit.string}"`}</div>
                            </>
                          }
                        </div>
                      }
                    </div>
                  )}
                  {currentlyEditingType === 'onset' && <div className={'error-display'}>{errorShowing}</div>}
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
                            onClick={currentlyEditingType !== 'nucleus' ? onClickAddUnitButton : () => null}
                            id='add-nucleus-button'
                            className={`add-button${currentlyEditingType === 'nucleus' ? ' adding' : ''}`}>
                            {currentlyEditingType === 'nucleus' ?
                              !confirmModalShowing && <form onSubmitCapture={handleSubmitAddUnitForm} name='submit-unit' className='add-unit-form'>
                                <input name='submit-unit' className='add-unit-input' type='text'></input>
                                <button className={'confirm-button'} type='submit'>OK</button>
                                <button className={'cancel-button'} type='button' onClick={handleCancelAddUnit}>Cancel</button>
                              </form>
                              :
                              'ADD NEW NUCLEUS'
                            }
                          </div>
                          {!currentlyEditingType && selectedUnit.id.includes(`nucleus`) &&
                            <>
                              <div onClick={onClickEditButton} id='edit-nucleus-button' className='edit-button'>{`EDIT "${selectedUnit.string}"`}</div>
                              <div onClick={onClickDeleteWordUnitButton} id='delete-nucleus-button' className='delete-button'>{`DELETE "${selectedUnit.string}"`}</div>
                            </>
                          }
                        </div>
                      }
                    </div>
                  )}
                  {currentlyEditingType === 'nucleus' && <div className={'error-display'}>{errorShowing}</div>}
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
                            onClick={currentlyEditingType !== 'coda' ? onClickAddUnitButton : () => null}
                            id='add-coda-button'
                            className={`add-button${currentlyEditingType === 'coda' ? ' adding' : ''}`}>
                            {currentlyEditingType === 'coda' ?
                              !confirmModalShowing && <form onSubmitCapture={handleSubmitAddUnitForm} name='submit-unit' className='add-unit-form'>
                                <input name='submit-unit' className='add-unit-input' type='text'></input>
                                <button className={'confirm-button'} type='submit'>OK</button>
                                <button className={'cancel-button'} type='button' onClick={handleCancelAddUnit}>Cancel</button>
                              </form>
                              :
                              'ADD NEW CODA'
                            }
                          </div>
                          {!currentlyEditingType && selectedUnit.id.includes(`coda`) &&
                            <>
                              <div onClick={onClickEditButton} id='edit-coda-button' className='edit-button'>{`EDIT "${selectedUnit.string}"`}</div>
                              <div onClick={onClickDeleteWordUnitButton} id='delete-coda-button' className='delete-button'>{`DELETE "${selectedUnit.string}"`}</div>
                            </>
                          }
                        </div>
                      }
                    </div>
                  )}
                  {currentlyEditingType === 'coda' && <div className={'error-display'}>{errorShowing}</div>}
                </div>
              </div>
            </div>

            {followersArray.length > 0 &&
              <div className='rule-type-area'>
                <h2>Invalid Followers</h2>
                <div className='follower-area'>
                  {followersArray.map((followerSet, s) => {
                    const editingCurrentPair = currentlyEditingType === `invalidFollowers-${followerSet.initialUnit}`;
                    const showingPotentials = (currentEditAction === 'add') && editingCurrentPair;
                    return (
                      <div key={`follower-entry-${s}`} className={`follower-entry${showingPotentials ? ' expanded' : ''}${editingCurrentPair ? ' highlighted' : ''}`}>
                        <div className='initial-unit'>{followerSet.initialUnit}</div>
                        <div className={`followers`}>
                          {followerSet.followers.length > 0 && followerSet.followers.map((follower, f) =>
                            <div onClick={handleClickFollower} className={`word-unit established${selectedUnit.id === `follower-${followerSet.initialUnit}-${f}` ? ' selected' : ''}`} id={`follower-${followerSet.initialUnit}-${f}`} key={`follower-${followerSet.initialUnit}-${f}`}>{follower}</div>
                          )}
                          <div className={`follower-selection-units`}>
                            {getPotentialFollowers(followerSet.initialUnit).map((follower, g) =>
                              <div onClick={handleClickFollowerSelection} className={`word-unit potential${selectedUnit.id === `follower-selection-${s}-${g}` ? ' selected' : ''}`} id={`follower-selection-${s}-${g}`} key={`follower-selection-${s}-${g}`}>{follower}</div>
                            )}
                          </div>
                          {<div className='add-follower-button-area'>
                            {editingCurrentPair &&
                              (currentEditAction !== 'add') && <>
                                <div onClick={onClickEditButton} className='edit-button'>{`EDIT "NO ${followerSet.initialUnit}${selectedUnit.string}"`}</div>
                              <div onClick={() => onClickDeleteFollowerSetButton(followerSet.initialUnit, selectedUnit.string)} className='delete-button'>{`DELETE "NO ${followerSet.initialUnit}${selectedUnit.string}"`}</div>
                              <button className={'cancel-button small'} onClick={handleCancelAddUnit}>X</button>
                              </>                                                            
                            }
                            {(currentlyEditingType !== `invalidFollowers-${followerSet.initialUnit}`) &&
                              <div
                                onClick={currentlyEditingType !== `invalidFollowers-${followerSet.initialUnit}` ? onClickAddFollowerButton : () => null}
                                id={`${followerSet.initialUnit}-add-follower-button`}
                                className={`add-button follower${currentlyEditingType === `invalidFollowers-${followerSet.initialUnit}` ? ' adding' : ''}`}
                              >
                                {'ADD'}
                              </div>
                            }
                            {currentEditAction === 'add' && editingCurrentPair && <>
                              <button onClick={() => handleSubmitAddFollowerSet(followerSet.initialUnit, selectedUnit.string)} className={'confirm-button'}>OK</button>
                              <button className={'cancel-button'} onClick={handleCancelAddUnit}>Cancel</button>
                            </>}
                          </div>}
                          {/* {selectedUnit.id.includes(`follower-${s}`) && <>
                          <div onClick={onClickEditButton} className='edit-button'>{`EDIT "${followerSet.initialUnit}${selectedUnit.string}"`}</div>
                          <div onClick={() => onClickDeleteFollowerSetButton(followerSet.initialUnit, selectedUnit.string)} className='delete-button'>{`DELETE "${followerSet.initialUnit}${selectedUnit.string}"`}</div>
                        </>} */}
                        </div>
                      </div>
                    );
                  }
                  )}
                </div>
              </div>
            }

            {[...props.wordRules.startWord, ...props.wordRules.endWord, ...props.wordRules.universal, ...props.wordRules.loneWord].length > 0 &&
              <div className='rule-type-area'>
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
              </div>
            }
          </div>
        </>
      }
      <div className='button-area'>
        <Button width={'8rem'} label={'GO BACK'} clickAction={props.dismissModal} />
      </div>
      {props.showing && currentlyEditingType && selectedUnit.string &&
        <>
          {!currentlyEditingType.includes('invalidFollowers') ?
            <ConfirmAddUnitModal
              action={currentEditAction}
              showing={confirmModalShowing && confirmModalShowing.includes('unit')}
              handleClickAcceptRuleEdit={handleAcceptRuleEdit}
              dismissModal={handleDismissConfirmModal}
              selectedUnit={selectedUnit}
              currentlyEditingType={currentlyEditingType}
            />
            :
            <ConfirmAddFollowerModal
              action={currentEditAction}
              showing={confirmModalShowing && confirmModalShowing.includes('follower')}
              handleClickAcceptRuleEdit={handleAcceptRuleEdit}
              dismissModal={() => handleDismissConfirmModal(true)}
              selectedUnit={selectedUnit}
              currentlyEditingType={currentlyEditingType}
            />
          }
        </>
      }
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
            z-index: 6;
            overscroll-behavior: none;

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
                height: 2rem;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                border-radius: calc(var(--board-size) * 0.005);
                transition: scale 100ms ease, opacity 100ms ease;

                &.selected {
                  background-color: green;
                  scale: 1.1;
                  font-weight: bold;
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

                &.follower {
                  width: 6rem;                  
                }

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

              & .edit-button, & .delete-button {
                width: 9.5rem;
                max-width: 18vw;
                text-align: center;
              }
              
              & .add-unit-form, .add-follower-form {
                width: 100%;
                display: flex;
                gap: 0.5rem;
                padding: 0 0.75rem;

                & > .add-unit-input {
                  margin: 0;
                  width: 4rem;
                  font-size: 1.75rem;
                  height: 3rem;
                  text-transform: uppercase;
                  text-align: center;
                }                
              }

              & button {
                width: 4rem;
                min-height: 3rem;
                border-radius: calc(var(--board-size) * 0.0075);

                &.confirm-button {
                  background-color: #aaffaa;
                }
                &.cancel-button {
                  background-color: #ffaaaa;

                  &.small {
                    width: 3rem;
                    font-weight: bold;
                    font-size: 1.5rem;
                    color: #eee;
                    background-color: red;
                  }
                }
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

                & .word-unit {
                  font-size: 1.25rem;
                }

                & > .follower-entry {
                  display: grid;
                  grid-template-columns: 2.5rem 1fr;
                  padding: 0.5rem;
                  align-items: center;                  
                  font-weight: bold;

                  & .follower-selection-units {
                    display: none;
                    flex-wrap: wrap;
                    transition: all 1000ms ease;
                    gap: inherit;
                    padding: 0.5rem;
                    padding-right: 1rem;
                    margin-top: 1rem;

                    & > .word-unit {
                      opacity: 0.65;
                      font-size: 1rem;

                      &.selected {
                        opacity: 1;
                      }

                    }
                  }

                  &.highlighted {
                    outline: 2px solid blue;
                  }

                  &.expanded {

                    & .word-unit.established {
                      outline: 0.1rem solid green;
                      pointer-events: none;                    
                    }

                    & .follower-selection-units {
                      display: flex;
                    }
                  }

                  &:nth-of-type(odd) {
                    background-color: #00000011;
                  }

                  & > .initial-unit {
                    font-size: 2rem;
                    align-self: flex-start;
                  }

                  & > .followers {
                    font-weight: normal;
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.25rem;
                    min-height: 3rem;                                                                                
                  }

                  & .add-follower-button-area {
                    display: flex;
                    align-items: stretch;
                    flex-grow: 1;
                    justify-content: flex-end;
                    gap: 0.5rem;
                  }                  
                }
              }
            }
          }
          & > .button-area {
            width: 100%;
            padding-left: 1rem;
          }
        }
      `}</style>
    </div>
  );
}