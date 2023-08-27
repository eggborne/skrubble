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
  const unitArray = [...wordRules.onsets, ...wordRules.nuclei, ...wordRules.codas].sort((a, b) => b.length - a.length);;
  for (let unit of unitArray) {
    if (word.indexOf(unit) === 0) {
      return {
        type: wordRules.nuclei.indexOf(unit) !== -1 ? 'nucleus' : wordRules.onsets.indexOf(unit) !== -1 ? 'onset' : 'coda',
        string: unit
      };
    }
  }
}

function validateWordUnits(word, wordRules) {
  const validated = [];
  const initialUnit = validateInitialUnit(word, wordRules);
  if (initialUnit && initialUnit.type !== 'coda') {
    validated.push(initialUnit);
    let lastType = initialUnit.type;
    let startingPartialIndex = initialUnit.string.length;
    let partialRemainingWord = word.substr(startingPartialIndex, word.length - startingPartialIndex);
    let cycleCount = 0;
    while (cycleCount < 100) {
      const nextUnit = validateInitialUnit(partialRemainingWord, wordRules);
      if (nextUnit) {
        if (lastType === 'onset' || lastType === 'coda') {
          if (nextUnit.type === 'nucleus' || nextUnit.string === 's') {
            validated.push(nextUnit);
          }
        } else {
          if (nextUnit.type !== 'nucleus') {
            validated.push(nextUnit);
          }
        }
        lastType = nextUnit.type;
        startingPartialIndex += nextUnit.string.length;
        partialRemainingWord = word.substr(startingPartialIndex, word.length - startingPartialIndex);
      } else {
        break;
      }
      cycleCount++;
    }
    const validatedSyllables = validated.map(unit => unit.string).join('');
    if (validatedSyllables === word) {
      return true;
    } else {
      return false;
    }
  }
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
          const violation = {
            rule: ruleType,
            invalidString: {
              value: invalidString,
              index: word.toLowerCase().indexOf(invalidString)
            }
          };
          violations.push(violation);
        }
      }
    };
  }
  const unitsOkay = validateWordUnits(word, wordRules);
  if (!unitsOkay) {
    invalid = true;
    const violation = {
      rule: 'syllables'
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