import axios from "axios";

const PROD = process.env.NODE_ENV === 'production';
let ROOT = '/namegenerator/php/';
if (!PROD) {
  ROOT = 'https://eggborne.com/namegenerator/php/';
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

export { getAllRulesets };