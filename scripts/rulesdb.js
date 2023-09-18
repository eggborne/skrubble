import axios from "axios";

let ROOT = 'https://skrubble.live/php/';

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
  return axios({
    method: 'post',
    url: `${ROOT}sendnewwordrules.php`,
    headers: {
      'Content-type': 'application/x-www-form-urlencoded'
    },
    data: JSON.stringify({
      rulesetID: 43,
      ruleType,
      newList,
    }),
  });
}

export { getAllRulesets, sendNewRules };