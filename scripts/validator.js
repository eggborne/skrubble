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
  };
  for (let type in unitArrays) {
    const unitArray = unitArrays[type];
    for (let unit of unitArray) {
      if (word.indexOf(unit) === 0) {
        if (unit.length > string.length) {
          console.log('type', type, 'setting initial to', unit);
          string = unit;
        }
        if (!types.includes(type)) {
          types.push(type);
        }
      }
    }
  }
  return {
    string,
    types,
  };
}

function validateUnitSequence(word, wordRules) {
  const validated = [];
  const initialUnit = validateInitialUnit(word, wordRules);
  let rule = 'unit sequence';
  let details = '';
  let partialRemainingWord, startingPartialIndex;
  if (initialUnit && (initialUnit.types.includes('onset') || initialUnit.types.includes('nucleus'))) {
    console.warn('initial unit is', initialUnit);
    validated.push(initialUnit);
    let lastTypes = initialUnit.types;
    startingPartialIndex = initialUnit.string.length;
    partialRemainingWord = word.substr(startingPartialIndex);
    let cycleCount = 0;
    while (cycleCount < 100) {
      const nextUnit = validateInitialUnit(partialRemainingWord, wordRules);
      console.warn('nextUnit is', nextUnit);
      if (nextUnit) {
        const lastWasConsonantUnit = lastTypes.includes('onset') || lastTypes.includes('coda');
        const nextIsConsonantUnit = nextUnit.types.includes('onset') || nextUnit.types.includes('coda');
        const unitCouldCompleteWord = validated.map(unit => unit.string).join('').length === word.length - nextUnit.string.length;
        if (lastWasConsonantUnit) {
          const endingS = nextUnit.string === 's' && unitCouldCompleteWord;
          const junctureOkay = false;
          if (junctureOkay || nextUnit.types.includes('nucleus') || endingS) {
            validated.push(nextUnit);
            lastTypes = nextUnit.types;
            startingPartialIndex += nextUnit.string.length;
            partialRemainingWord = word.substr(startingPartialIndex);
            if (!partialRemainingWord) {
              console.error('while breaking due to no partialRemainingWord', cycleCount)
              break;
            }
          } else {
            console.warn('last one had onset or coda but next did not have nucleus');
            details = `onset/coda not followed by nucleus`;
            console.error('while breaking due to violation!', cycleCount);
            break;
          }
        } else {
          if (nextIsConsonantUnit) {
            validated.push(nextUnit);
            lastTypes = nextUnit.types;
            startingPartialIndex += nextUnit.string.length;
            partialRemainingWord = word.substr(startingPartialIndex);
            if (!partialRemainingWord) {
              console.error('while breaking due to no partialRemainingWord', cycleCount)
              break;
            }
          } else {
            console.warn('last AND NEXT did not have onset or coda');
            details = 'nucleus followed by another nucleus';
            console.error('while breaking due to violation!', cycleCount);
            break;
          }
        }
      } else {
        console.error('while breaking due to no new unit begins', partialRemainingWord, cycleCount);
        break;
      }
      cycleCount++;
      if (cycleCount === 100) {
        console.error('while timed out :(');
      }
    }
  }
  const validatedSyllables = validated.map(unit => unit.string).join('');
  let finalValidity = validatedSyllables === word;
  if (!details && validated.length === 1) {
    finalValidity = false;
    details = 'only one unit';
  } else if (!details && validated.length && validated[validated.length - 1].types.includes('onset') && !validated[validated.length - 1].types.includes('coda')) {
    finalValidity = false;
    details = 'ends with onset';
  }
  if (validated.length && !validated[0].types.includes('onset') && validated[0].types.includes('coda')) {
    finalValidity = false;
    details = 'starts with coda';
  }
  console.warn('VAL', validated)
  if (!details && validated.length && !validated.some(validatedUnit => validatedUnit.types.includes('nucleus'))) {
    finalValidity = false;
    details = 'no nucleus';
  }

  return !finalValidity ? {
    rule,
    invalidString: {
      string: partialRemainingWord,
      index: startingPartialIndex,
    },
    details,
  } : undefined;
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
              rule: 'followers',
              invalidString: {
                string: `${initialUnit}${follower}`,
                index: indexPair.start,
            },
              initial: {
                string: initialUnit,
                index: indexPair.start,
              },
              follower: follower,
              details: `${follower} cannot come after ${initialUnit}`,
            };
            invalidPairings.push(violatingPair);
          }
        });
      });
    }
  }
  return invalidPairings;
}

function getStringViolations(word, invalidStrings) {
  const stringViolations = [];
  for (let rule in invalidStrings) {
    let invalidArr = invalidStrings[rule];
    for (let s = 0; s < invalidArr.length; s++) {
      let invalidString = {
        string: invalidArr[s],
        index: undefined,
      };
      if (word.indexOf(invalidString.string) > -1) {
        let violating;
        let stringIndex = word.indexOf(invalidString.string);
        if (rule === 'universal' || rule === 'banned') {
          violating = true;
        } else if (rule === 'startWord') {
          violating = stringIndex === 0;
        } else if (rule === 'midWord') {
          violating = (stringIndex !== 0 && stringIndex !== word.length - invalidString.string.length);
        } else if (rule === 'endWord') {
          violating = stringIndex === word.length - invalidString.string.length;
        } else if (rule === 'loneWord') {
          violating = word === invalidString.string;
        }
        if (violating) {
          // if (invalidStrings.banned.indexOf(invalidString.string) > -1) {
          //   banned = true;
          // } else {
          //   invalid = true;
          // }
          invalidString.index = stringIndex;
          const details = 'bad string in word';
          const violation = {
            rule,
            invalidString,
            details,
          };
          stringViolations.push(violation);
        }
      }
    };
  }
  return stringViolations;
}

function getViolations(word, wordRules) {
  word = word.toLowerCase();
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

  const sequenceViolation = validateUnitSequence(word, wordRules);
  if (sequenceViolation) {
    const newViolation = {
      rule: sequenceViolation.rule,
      invalidString: { ...sequenceViolation.invalidString },
      details: sequenceViolation.details,
    };
    violations.push(newViolation);
  }

  const followerViolations = checkFollowers(word, wordRules);
  if (followerViolations.length) {
    violations.push(...followerViolations);
  }

  const stringViolations = getStringViolations(word, invalidStrings);
  violations.push(...stringViolations);

  if (violations.length) {
    invalid = true;
    console.log('violations!', violations);
  }

  return {
    banned,
    invalid,
    violations
  };
};

export { getViolations };