function findRegexIndices(text, needle) {
  const needleLength = needle.length;
  const reg = new RegExp(needle, 'g');
  const indices = [];
  let result;

  while ((result = reg.exec(text))) {
    indices.push({
      start: result.index,
      end: result.index + needleLength,
    });
  }
  return indices;
}

function validateInitialUnit(word, wordRules) {
  let string = '';
  const types = [];
  const unitArrays = {
    onset: [...wordRules.onsets].sort((a, b) => b.length - a.length),
    nucleus: [...wordRules.nuclei].sort((a, b) => b.length - a.length),
    coda: [...wordRules.codas].sort((a, b) => b.length - a.length),
  }
  for (let type in unitArrays) {
    const unitArray = unitArrays[type];
    for (let unit of unitArray) {
      if (word.indexOf(unit) === 0) {
        if (unit.length > string.length) {
          console.log('setting initial to', unit)
          string = unit;
        }
        types.push(type);
      }
    }
  }
  return {
    string,
    types,
  };
}

function validateWordUnits(word, wordRules) {
  const validated = [];
  const initialUnit = validateInitialUnit(word, wordRules);
  let partialRemainingWord;
  if (initialUnit && initialUnit.types.includes('onset') || initialUnit.types.includes('nucleus')) {
    console.warn('initial unit is', initialUnit);
    validated.push(initialUnit);
    let lastTypes = initialUnit.types;
    let startingPartialIndex = initialUnit.string.length;
    partialRemainingWord = word.substr(startingPartialIndex);
    let cycleCount = 0;
    while (cycleCount < 100) {
      const nextUnit = validateInitialUnit(partialRemainingWord, wordRules);
      console.warn('nextUnit is', nextUnit);
      if (nextUnit) {
        if (lastTypes.includes('onset') || lastTypes.includes('coda')) {
          if (nextUnit.types.includes('nucleus') || nextUnit.string === 's') {
            validated.push(nextUnit);
            lastTypes = nextUnit.types;
            startingPartialIndex += nextUnit.string.length;
            partialRemainingWord = word.substr(startingPartialIndex);
            if (!partialRemainingWord) {
              break;
            }
          } else {
            console.warn('last one had onset or coda but next did not have nucleus')
          }
        } else {
          if (nextUnit.types.includes('onset') || nextUnit.types.includes('coda')) {
            validated.push(nextUnit);
            lastTypes = nextUnit.types;
            startingPartialIndex += nextUnit.string.length;
            partialRemainingWord = word.substr(startingPartialIndex);
            if (!partialRemainingWord) {
              break;
            }
          }
          else {
            console.warn('last did not have onset or coda and next HAD onset or coda');
          }
        }
      } else {
        console.error('no new unit begins', partialRemainingWord);
        break;
      }
      cycleCount++;
    }
  }
  const validatedSyllables = validated.map(unit => unit.string).join('');
  console.log('validated', validated)
  console.log('val - word |', validatedSyllables, '-', word);
  let finalValidity = validatedSyllables === word;
  let details = validatedSyllables + ' /== ' + word;
  if (validated.length === 1) {
    finalValidity = false;
    details = 'only one unit';
  }
  if (validated.length && validated[validated.length - 1].types.includes('onset') && !validated[validated.length - 1].types.includes('coda')) {
    finalValidity = false;
    details = 'ends with onset';
  }

  return {
    valid: finalValidity,
    unvalidatedString: partialRemainingWord,
    details,
  };
}

function checkFollowers(word, wordRules) {
  const invalidPairings = [];
  for (let initialUnit in wordRules.invalidFollowers) {
    const indexes = findRegexIndices(word, initialUnit);
    if (indexes.length) {
      indexes.forEach(indexPair => {
        const followerList = wordRules.invalidFollowers[initialUnit];
        const followerIndex = indexPair.end;
        followerList.forEach(follower => {
          const segmentAtFollowerPosition = word.substr(followerIndex, follower.length);
          if (segmentAtFollowerPosition === follower) {
            const violatingPair = {
              initial: {
                string: initialUnit,
                index: indexPair.start,
              },
              follower: follower,
            };
            invalidPairings.push(violatingPair);
          }
        });
      });
    }
  }
  return invalidPairings;
}

function getViolations(word, wordRules) {
  let banned = false;
  let invalid = false;
  const violations = [];
  let invalidStrings = {
    banned: wordRules.banned,
    universal: wordRules.universal,
    startWord: wordRules.startWord,
    midWord: wordRules.midWord,
    endWord: wordRules.endWord,
    loneWord: wordRules.loneWord,
  };
  word = word.toLowerCase();
  for (let ruleType in invalidStrings) {
    let invalidArr = invalidStrings[ruleType];
    for (let s = 0; s < invalidArr.length; s++) {
      let invalidString = invalidArr[s];
      if (word.indexOf(invalidString) > -1) {
        let violating;
        let stringIndex = word.indexOf(invalidString);
        if (ruleType === 'universal' || ruleType === 'banned') {
          violating = true;
        } else if (ruleType === 'startWord') {
          violating = stringIndex === 0;
        } else if (ruleType === 'midWord') {
          violating = (stringIndex !== 0 && stringIndex !== word.length - invalidString.length);
        } else if (ruleType === 'endWord') {
          violating = stringIndex === word.length - invalidString.length;
        } else if (ruleType === 'loneWord') {
          violating = word === invalidString;
        }
        if (violating) {
          if (invalidStrings.banned.indexOf(invalidString) > -1) {
            banned = true;
          } else {
            invalid = true;
          }
          const invalidDetails = 'bad string in word';
          const violation = {
            rule: ruleType,
            invalidString: {
              value: invalidString,
              index: word.toLowerCase().indexOf(invalidString)
            },
            details: invalidDetails,
          };
          violations.push(violation);
        }
      }
    };
  }
  const unitValidation = validateWordUnits(word, wordRules);
  if (!unitValidation.valid) {
    invalid = true;
    const violation = {
      rule: 'syllables',
      invalidString: unitValidation.unvalidatedString,
      details: unitValidation.details,
    };
    violations.push(violation);
  }

  const followerViolations = checkFollowers(word, wordRules);
  if (followerViolations.length) {
    invalid = true;
    violations.push(...followerViolations);
  }

  if (violations.length) {
    console.log('violations!', violations);
  }

  return {
    banned,
    invalid,
    violations
  };
};

export { getViolations };