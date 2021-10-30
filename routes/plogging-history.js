const express = require('express');
const app = express();
const router = express.Router();
const User = require('../models/challenge');
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
  let result = { success: false };
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
  ///////////////////////////////// 플로깅 기록이 있는 달만 알아오기
  let exists_plogging_period = new Set();
  try {
    const user_plogging_info = await Plogging.findAll({
      attributes: ['date'],
      where: {
        user_id: userId,
      },
      raw: true,
    });

    user_plogging_info.forEach((value, index, array) => {
      let [year, month, _] = value.date.split('-');
      let yyyymm = year + '-' + month;
      exists_plogging_period.add(yyyymm);
    });
  } catch (err) {
    console.log(err);
    result.description = '사용자의 플로깅 정보를 가져올 수 없습니다.';
    res.json(result);
  }
  const real_plogging_period = Array.from(exists_plogging_period);
  ////////////////////////////////////////////////
  ///////////////////////////////// 플로깅 있는 달에 대해, 유저의 누적 플로깅 요약 가져오기
  let user_plogging_sum_info;
  result.abstracts = [];
  real_plogging_period.forEach(async (value, index, array) => {
    let [year, month, _] = value.split('-');
    let abstract = {};
    abstract.period = year + '-' + month;
    month = `${parseInt(month)}`;
    try {
      const user_plogging_info = await Plogging.findAll({
        // include: [{ model: Litter, require: true }],
        attributes: [
          [Sequelize.fn('COUNT', Sequelize.col('id')), 'count'],
          [
            Sequelize.literal(`SEC_TO_TIME(AVG(TIME_TO_SEC(duration_time)))`),
            'avg_duration_time',
          ],
          [Sequelize.fn('AVG', Sequelize.col('distance')), 'avg_distance_km'],
          [
            Sequelize.fn('SUM', Sequelize.col('plastic_count')),
            'plastic_count',
          ],
          [
            Sequelize.fn('SUM', Sequelize.col('vinyles_count')),
            'vinyles_count',
          ],
          [
            Sequelize.fn('SUM', Sequelize.col('glasses_count')),
            'glasses_count',
          ],
          [Sequelize.fn('SUM', Sequelize.col('cans_count')), 'cans_count'],
          [Sequelize.fn('SUM', Sequelize.col('papers_count')), 'papers_count'],
          [Sequelize.fn('SUM', Sequelize.col('trash_count')), 'trash_count'],
        ],
        where: {
          user_id: userId,
          date: {
            [Sequelize.Op.between]: [
              `${year}-${month}-01`,
              `${year}-${month}-31`,
            ],
          },
        },
      });
      user_plogging_sum_info = user_plogging_info[0].dataValues;
      // 만약 조회한 달의 플로깅 기록이 있다면
      if (user_plogging_sum_info.count > 0) {
        user_plogging_sum_info.avg_duration_time =
          user_plogging_sum_info.avg_duration_time.split('.')[0];
        user_plogging_sum_info.avg_litter_count = getAvgLitterCount(
          user_plogging_sum_info
        );
        // res 보낼 객체에 담기
        abstract.avg_duration_time = user_plogging_sum_info.avg_duration_time;
        abstract.avg_distance_km = user_plogging_sum_info.avg_distance_km;
        abstract.avg_litter_count = user_plogging_sum_info.avg_litter_count;
      } else {
        abstract.avg_duration_time = '00:00:00';
        abstract.avg_distance_km = 0;
        abstract.avg_litter_count = 0;
      }
      result.abstracts.push(abstract);
    } catch (err) {
      console.log(err);
      result.description = '사용자의 플로깅 정보를 가져올 수 없습니다.';
      res.json(result);
    }
  });

  ////////////////////////////////////////////////
  // 해당 달의 플로깅 기록 찾기
  result.history = [];
  let logs = [];
  for (let index = 0; index < real_plogging_period.length; index++) {
    value = real_plogging_period[index];
    let [year, month, _] = value.split('-');
    let abstract = {};
    abstract.period = year + '-' + month;
    month = `${parseInt(month)}`;
    try {
      const user_plogging_each_info = await Plogging.findAll({
        // include: [{ model: Litter }],
        require: true,
        where: {
          user_id: userId,
          date: {
            [Sequelize.Op.between]: [
              `${year}-${month}-01`,
              `${year}-${month}-31`,
            ],
          },
        },
        raw: true,
      });
      user_plogging_each_info.forEach((value, index, array) => {
        let log = {};
        log.date = value.date;
        log.photo =
          'http://18.119.6.206:8001/plogging-result-image/' + value.photo; // 사진 경로
        log.distance_hakyo = value.distance / 6.4; // 몇 학교?
        log.distance_km = value.distance; // 몇 km 뛰었는지
        log.duration_time = value.duration_time; // 플로깅 지속 시간
        if (value.count_of_badge_got > 0) {
          log.got_badge = true;
        } else {
          log.got_badge = false;
        } // 뱃지는 생겼는지 안생겼는지
        log.duration_time = value.duration_time; // 플로깅 지속 시간
        // 쓰레기 개수 세기
        log.litter_count = 0;
        log.litter_count += value.plastic_count;
        log.litter_count += value.vinyles_count;
        log.litter_count += value.glasses_count;
        log.litter_count += value.cans_count;
        log.litter_count += value.cans_count;
        log.litter_count += value.papers_count;
        log.litter_count += value.trash_count;

        logs.push(log);
      });
    } catch (err) {
      console.log(err);
      delete result.description;
    }
  }
  result.history = logs;
  if (!result.abstracts.length && !result.history.length) {
    delete result.abstracts;
    delete result.history;
    result.description = '플로깅 기록이 없습니다.';
  }
  res.json(result);
});
module.exports = router;
