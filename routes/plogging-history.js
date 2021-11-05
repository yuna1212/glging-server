const express = require('express');
const app = express();
const router = express.Router();
const Plogging = require('../models/plogging');
const Challenge = require('../models/challenge');
const tokens = require('../modules/token');
const Sequelize = require('sequelize');

// Token 실패 코드
const TOKEN_EXPIRED = require('../modules/token').TOKEN_EXPIRED;
const TOKEN_INVALID = require('../modules/token').TOKEN_INVALID;

const getAvgLitterCount = (data) => {
  sum = 0;
  sum += parseInt(data.plastic_count);
  sum += parseInt(data.vinyles_count);
  sum += parseInt(data.glasses_count);
  sum += parseInt(data.cans_count);
  sum += parseInt(data.papers_count);
  sum += parseInt(data.trash_count);
  return sum / data.count;
};
router.get('', async (req, res) => {
  let result = {};
  ///////////////////////////////// 토큰 검증
  let userAccessToken = req.query.access_token;
  let token = await tokens.access.verify(userAccessToken);
  // 적합하지 않은 토큰이면
  if (TOKEN_EXPIRED === token) {
    result.description = 'token expired';
    res.json(result);
  } else if (TOKEN_INVALID === token) {
    result.description = 'token invalid';
    res.json(result);
  }
  // 적합한 토큰이면
  let userId = token.user_id;
  ////////////////////////////////////////////////
  // 유저의 플로깅 기록 찾기
  result.history = [];
  let logs = [];
  try {
    const plogging_in_db = await Plogging.findAll({
      attributes: [
        ['client_id', 'id'],
        ['start_date', 'startDate'],
        ['end_date', 'endDate'],
        'distance',
        ['duration_time', 'time'],
        ['count_of_badge_got', 'badge'],
        ['photo', 'picture'],
        ['plastic_count', 'plastic'],
        ['vinyles_count', 'vinyl'],
        ['glasses_count', 'glass'],
        ['cans_count', 'can'],
        ['papers_count', 'paper'],
        ['trash_count', 'general'],
      ],
      where: {
        user_id: userId,
      },
      raw: true,
    });
    plogging_in_db.forEach((value, index, array) => {
      let log = value;
      if (value.picture !== null) {
        value.picture =
          'http://18.119.6.206:8001/PLOGGING-RESULT-IMAGES/' + value.picture; // 사진 경로
      }
      logs.push(log);
    });
  } catch (err) {
    console.log(err);
    delete result.description;
  }
  result.history = logs;

  res.json(result);
});
module.exports = router;
