import axios from "axios";

const PROD = process.env.NODE_ENV === 'production';
let ROOT = '/namegenerator/php/';
if (!PROD) {
  // ROOT = 'https://eggborne.com/namegenerator/php/';
  ROOT = 'https://skrubble.live/php/';
}

function getAllRulesets() {
  return axios({
    method: 'get',
    url: `${ROOT}getallrulesets.php`,
    headers: {
      'Content-type': 'application/x-www-form-urlencoded'
    }
  });
}

function sendNewRules(ruleType, newList) {
  console.log('sendNewRules ruleType is', ruleType);
  console.log('sendNewRules newList is', newList);
  // let lastRulesIndex = undefined;
  // if (rulesObj.usingRuleset > 99) {
  //   lastRulesIndex = parseInt(rulesObj.usingRuleset);
  // }
  // let creatorName = rulesObj.creator;
  // let changedRules = [];

  // let ruleEntry = changedRules[0];
  let rawData = {
    rulesetID: 43,
    ruleType,
    newList,
  };
  console.info('rawData is', rawData);
  console.info('stringified',JSON.stringify(rawData))
  return axios({
    method: 'post',
    url: `${ROOT}sendnewwordrules.php`,
    headers: {
      'Content-type': 'application/x-www-form-urlencoded'
    },
    data: JSON.stringify(rawData)
  });
}

export { getAllRulesets, sendNewRules };