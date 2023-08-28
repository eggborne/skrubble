import { useState } from "react";
import Button from "./Button";

export default function RulesModal(props) {
  const [selectedUnit, setSelectedUnit] = useState(undefined);

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
  // for (let initialUnit in props.wordRules.invalidFollowers) {
  //   const newObj = {
  //     initialUnit,
  //     followers: props.wordRules.invalidFollowers[initialUnit]
  //   };
  //   followersArray.push(newObj);
  // }
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
    console.log('setting unit', newUnitId);
    setSelectedUnit(newUnitId);
  }
  function handleClickFollower(e) {
    const newUnitId = e.target.id;
    console.log('setting follower', newUnitId);
    setSelectedUnit(newUnitId);
  }
  function handleClickBannedString(e) {
    const newUnitId = e.target.id;
    console.log('setting banned string', newUnitId);
    setSelectedUnit(newUnitId);
  }
  function handleClickAddButton(e) {
    
    console.log('clicked ADD button!');
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
                        <div onClick={handleClickUnit} className={`word-unit${selectedUnit === `onset-${a}-${o}` ? ' selected' : ''}`} id={`onset-${a}-${o}`} key={`onset-${a}-${o}`}>{unit}</div>
                      )}
                      <div onClick={handleClickAddButton} className='add-button'>ADD</div>
                    </div>
                  )}
                </div>
              </div>
              <div className='unit-listing'>
                <h3>Nuclei</h3>
                <div className='unit-list'>
                  {nucleusArrays.map((arr, a) =>
                    <div key={`nucleus-sublist-${a}`} className='unit-sublist'>
                      {arr.map((unit, o) =>
                        <div onClick={handleClickUnit} className={`word-unit${selectedUnit === `nucleus-${a}-${o}` ? ' selected' : ''}`} id={`nucleus-${a}-${o}`} key={`nucleus-${a}-${o}`}>{unit}</div>
                      )}
                      <div onClick={handleClickAddButton} className='add-button'>ADD</div>
                    </div>
                  )}
                </div>
              </div>
              <div className='unit-listing'>
                <h3>Codas</h3>
                <div className='unit-list'>
                  {codaArrays.map((arr, a) =>
                    <div key={`coda-sublist-${a}`} className='unit-sublist'>
                      {arr.map((unit, o) =>
                        <div onClick={handleClickUnit} className={`word-unit${selectedUnit === `coda-${a}-${o}` ? ' selected' : ''}`} id={`coda-${a}-${o}`} key={`coda-${a}-${o}`}>{unit}</div>
                      )}
                      <div onClick={handleClickAddButton} className='add-button'>ADD</div>
                    </div>
                  )}
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
                        <div onClick={handleClickFollower} className={`word-unit${selectedUnit === `follower-${s}-${f}` ? ' selected' : ''}`} id={`follower-${s}-${f}`} key={`follower-${s}-${f}`}>{follower}</div>
                      )}
                      <div onClick={handleClickAddButton} className='add-button'>ADD</div>
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
                    <div onClick={handleClickBannedString} className={`word-unit${selectedUnit === `start-word-segment-${s}` ? ' selected' : ``}`} id={`start-word-segment-${s}`}  key={`start-word-segment-${s}`}>{segment}</div>
                  )}
                  <div onClick={handleClickAddButton} className='add-button'>ADD</div>
                </div>
              </div>
              <div className='unit-listing'>
                <h3 className='sticky'>End of word ({props.wordRules.endWord.length})</h3>
                <div className='unit-list long'>
                  {props.wordRules.endWord.map((segment, s) =>
                    <div onClick={handleClickBannedString} className={`word-unit${selectedUnit === `end-word-segment-${s}` ? ' selected' : ``}`} id={`end-word-segment-${s}`} key={`end-word-segment-${s}`}>{segment}</div>
                  )}
                  <div onClick={handleClickAddButton} className='add-button'>ADD</div>
                </div>
              </div>
              <div className='unit-listing'>
                <h3 className='sticky'>Anywhere in word ({props.wordRules.universal.length})</h3>
                <div className='unit-list long'>
                  {props.wordRules.universal.map((segment, s) =>
                    <div onClick={handleClickBannedString} className={`word-unit${selectedUnit === `universal-word-segment-${s}` ? ' selected' : ``}`} id={`universal-word-segment-${s}`} key={`universal-word-segment-${s}`}>{segment}</div>
                  )}
                  <div onClick={handleClickAddButton} className='add-button'>ADD</div>
                </div>
              </div>
              <div className='unit-listing'>
                <h3 className='sticky'>Exact word ({props.wordRules.loneWord.length})</h3>
                <div className='unit-list long'>
                  {props.wordRules.loneWord.map((segment, s) =>
                    <div onClick={handleClickBannedString} className={`word-unit${selectedUnit === `exact-word-segment-${s}` ? ' selected' : ``}`} id={`exact-word-segment-${s}`} key={`exact-word-segment-${s}`}>{segment}</div>
                  )}
                  <div onClick={handleClickAddButton} className='add-button'>ADD</div>
                </div>
              </div>
            </div>}
          </div>
        </>
      }
      <div className='button-area'>
        <Button width={'8rem'} label={'OK'} clickAction={props.dismissModal} />
      </div>
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
                padding: 1rem 0;
                gap: 0.5rem 0;

                & > .unit-list {
                  display: flex;
                  flex-direction: column;
                  gap: 1rem;
                  
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

              & .add-button {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 3rem;
                min-height: 1.5rem;
                background-color: #aaffaa;
                color: black;
                font-weight: bold;
                font-size: 0.8rem !important;
                border-radius: calc(var(--board-size) * 0.005);
                cursor: pointer;
                transition: all 100ms ease;

                &:hover {
                  outline: 3px solid green;
                }

                &:active {
                  scale: 0.9;
                }
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