import axios from "axios";

const PROD = process.env.NODE_ENV === 'production';
let ROOT = '/php/';
if (!PROD) {
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

function getAllVisitors() {
  return axios({
    method: 'get',
    url: `${ROOT}getallvisitors.php`,
    headers: {
      'Content-type': 'application/x-www-form-urlencoded'
    }
  });
}

function registerVisitor(visitorId) {
  return axios({
    method: 'post',
    url: `${ROOT}registervisitor.php`,
    headers: {
      'Content-type': 'application/x-www-form-urlencoded'
    },
    data: JSON.stringify({
      visitorId: visitorId,
    }),
  });
}

function handshakeWithLobby(visitorId, location, phase) {
  console.log('handshakeWithLobby sending', visitorId, location, phase)
  return axios({
    method: 'post',
    url: `${ROOT}lobbyhandshake.php`,
    headers: {
      'Content-type': 'application/x-www-form-urlencoded'
    },
    data: JSON.stringify({
      visitorId,
      location,
      phase,
    }),
  });
}

function sendChallenge(visitorId, opponentId, status) {
  return axios({
    method: 'post',
    url: `${ROOT}sendchallenge.php`,
    headers: {
      'Content-type': 'application/x-www-form-urlencoded'
    },
    data: JSON.stringify({
      visitorId,
      opponentId,
      status,
    }),
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

export { getAllRulesets, getAllVisitors, registerVisitor, handshakeWithLobby, sendChallenge, sendNewRules };