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

function extractSyllables(word, wordRules) {
  // console.warn('extractSyllables from', word);
  let syllables = [];
  let remainingWord = word;
  let currentStartingIndex = 0;
  let currentSyllable = [];
  let previousUnit;
  while (remainingWord.length) {
    const newUnit = validateInitialUnit(remainingWord, wordRules);
    if (newUnit.string) {
      const nextRemainingWord = remainingWord.substring(newUnit.string.length);
      // const nextUnit = nextRemainingWord ? validateInitialUnit(nextRemainingWord, wordRules) : undefined;
      if (newUnit.string.length === word.length) {
        currentSyllable.push(newUnit);
        syllables.push(currentSyllable);
        remainingWord = '';
        break;
      }
      if (remainingWord) {
        if (!previousUnit) {
          currentSyllable.push(newUnit);
        } else {
          currentSyllable.push(newUnit);
          // console.log('adding unit', newUnit, 'to syllables');
          const endOfSyllable = previousUnit.types.includes('nucleus') && (newUnit.types.includes('coda') || newUnit.types.includes('onset'));
          const endOfWord = nextRemainingWord.length === 0;
          const endingOnProperType = endOfWord && (newUnit.types.includes('nucleus') || newUnit.types.includes('coda'));
          if (endOfSyllable || endingOnProperType) {
            // console.log('pushing complete syllable', currentSyllable);
            // console.log('endOfSyllable', endOfSyllable);
            // console.log('endingOnProperType', endingOnProperType);
            syllables.push(currentSyllable);
            currentSyllable = [];
          }
        }        
        previousUnit = newUnit;
      }
      currentStartingIndex = newUnit.string.length;
      remainingWord = remainingWord.substr(currentStartingIndex);
    } else {
      remainingWord = '';
    }
  }
  // console.log('SYLLABLES ----------', syllables);

  return syllables;
}

function validateSyllableSequence(syllableArray) {
  // console.warn('??????????????? validating', syllableArray);
  let violation = {};
  const isSingleSyllableWord = syllableArray.length === 1;
  for (let s = 0; s < syllableArray.length; s++) {
    const unitObjArray = syllableArray[s];
    const syllableString = unitObjArray.map(syllObj => syllObj.string).join('');
    // console.log('unitObjArray', unitObjArray);
    let consecutiveSingleLetterConsonants = 0;
    const isSingleUnitSyllable = unitObjArray.length === 1;
    const isFinalSyllable = !isSingleUnitSyllable && s === syllableArray.length - 1;
    const firstUnit = unitObjArray[0];
    const secondUnit = unitObjArray[1];
    const lastUnit = unitObjArray[unitObjArray.length - 1];
    const previousSyllable = syllableArray[s - 1];
    const finalUnitOfPreviousSyllable = s > 0 && !isSingleSyllableWord ? previousSyllable[previousSyllable.length - 1] : undefined;

    const startsWithRestrictiveCoda =
      firstUnit.types.includes('coda')
      && !firstUnit.types.includes('onset')
    ;
    const endsWithRestrictiveOnset =
      lastUnit.types.includes('onset')
      && !lastUnit.types.includes('coda')
    ;
    const incompleteSyllableAsOnlyUnit =
      isSingleUnitSyllable
      && !firstUnit.types.includes('nucleus')
    ; 
    const noNucleusFirstOrSecond =
      unitObjArray.length > 1
      && !firstUnit.types.includes('nucleus')
      && !secondUnit.types.includes('nucleus')
    ; 
    const hasConsecutiveNuclei =
      (
        unitObjArray.length >= 2
        && (firstUnit.types.includes('nucleus') && !firstUnit.types.includes('onset') && !firstUnit.types.includes('coda') )
        && (secondUnit.types.includes('nucleus') && !secondUnit.types.includes('onset') && !secondUnit.types.includes('coda') )
      )
      ||
      (
        unitObjArray.length === 3
        && (secondUnit.types.includes('nucleus') && !secondUnit.types.includes('onset') && !secondUnit.types.includes('coda') )
        && (lastUnit.types.includes('nucleus') && !lastUnit.types.includes('onset') && !lastUnit.types.includes('coda') )
      )
    ; 
    const endsWordWithTwoConsonants =
      syllableArray.length > 1
      && unitObjArray.length === 1
      && !firstUnit.string === 's'
      && !firstUnit.types.includes('nucleus')
      && !finalUnitOfPreviousSyllable.types.includes('nucleus')
    ;
    const tooManyUnits = unitObjArray.length > 3;
    const disqualified =
      tooManyUnits
      || incompleteSyllableAsOnlyUnit
      || startsWithRestrictiveCoda
      || noNucleusFirstOrSecond
      || hasConsecutiveNuclei
      || endsWithRestrictiveOnset
      || endsWordWithTwoConsonants
    ;
    
    if (disqualified) {
      if (incompleteSyllableAsOnlyUnit) {
        violation.syllable = syllableString;
        violation.rule = 'syllable sequence';
        violation.string = syllableString;
        violation.details = 'consonant unit as only syllable';
        break;
      }
      if (startsWithRestrictiveCoda) {
        violation.syllable = syllableString;
        violation.rule = 'syllable sequence';
        violation.string = firstUnit.string;
        violation.details = 'starts with restrictive coda';
        break;
      }
      if (noNucleusFirstOrSecond) {
        violation.syllable = syllableString;
        violation.rule = 'syllable sequence';
        violation.string = firstUnit.string + secondUnit.string;
        violation.details = 'no nucleus in first or second position';
        break;
      }
      if (hasConsecutiveNuclei) {
        violation.syllable = syllableString;
        violation.rule = 'syllable sequence';
        violation.string = syllableString;
        violation.details = 'has two consecutive nucleii';
        break;
      }
      if (endsWithRestrictiveOnset) {
        violation.syllable = syllableString;
        violation.rule = 'syllable sequence';
        violation.string = firstUnit.string;
        violation.details = 'ends with restrictive onset';
        break;
      }
      if (endsWordWithTwoConsonants) {
        violation.syllable = syllableString;
        violation.rule = 'syllable sequence';
        violation.string = firstUnit.string;
        violation.details = 'ends word with two consonant units';
        break;
      }
      if (tooManyUnits) {
        violation.syllable = syllableString;
        violation.rule = 'syllable sequence';
        violation.string = syllableString;
        violation.details = 'contains too many units';
        break;
      }
    } else {
      // console.warn('------------------------------------------------------------------------------', syllableArray[s].map(unit => unit.string).join(''), 'OK!')
    }
  }
  return violation;
}

function validateInitialUnit(word, wordRules) {
  // console.warn('validateInitialUnit ------------------->', word)
  word = word.toLowerCase();
  let string = '';
  const types = [];
  const unitArrays = {
    nucleus: [...wordRules.nuclei].sort((a, b) => b.length - a.length),
    coda: [...wordRules.codas].sort((a, b) => b.length - a.length),
    onset: [...wordRules.onsets].sort((a, b) => b.length - a.length),
  };
  for (let type in unitArrays) {
    const unitArray = unitArrays[type];
    for (let unit of unitArray) {
      const sliceLength = unit.length;
      const contestedLetters = word.slice(0, sliceLength);
      const wordBeginsWithUnit = contestedLetters === unit;
      if (wordBeginsWithUnit) {
        const stringOverWritable = unit.length >= string.length;
        if (stringOverWritable) {
          if (unit.length > string.length) {
            types.length = 0;
          }
          string = unit;
          const typeOverwritable = !types.includes(type) && unitArrays[type].indexOf(unit) !== -1;
          if (typeOverwritable) {
            types.push(type);
          }
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
    validated.push(initialUnit);
    let lastTypes = initialUnit.types;
    startingPartialIndex = initialUnit.string.length;
    partialRemainingWord = word.substr(startingPartialIndex);
    let cycleCount = 0;
    while (cycleCount < 100) {
      const nextUnit = validateInitialUnit(partialRemainingWord, wordRules);
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
              console.error('while breaking due to no partialRemainingWord', cycleCount);
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
              console.error('while breaking due to no partialRemainingWord', cycleCount);
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

  // const sequenceViolation = validateUnitSequence(word, wordRules);
  // if (sequenceViolation) {
  //   const newViolation = {
  //     rule: sequenceViolation.rule,
  //     invalidString: { ...sequenceViolation.invalidString },
  //     details: sequenceViolation.details,
  //   };
  //   violations.push(newViolation);
  // }

  // const followerViolations = checkFollowers(word, wordRules);
  // if (followerViolations.length) {
  //   violations.push(...followerViolations);
  // }

  // const stringViolations = getStringViolations(word, invalidStrings);
  // violations.push(...stringViolations);

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

export { getViolations, extractSyllables, validateSyllableSequence, checkFollowers, validateInitialUnit };