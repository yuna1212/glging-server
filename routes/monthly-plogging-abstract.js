const express = require('express');
const app = express();
const router = express.Router();
const User = require('../models/challenge');
const Plogging = require('../models/plogging');
const Litter = require('../models/litter');
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
  // 토큰 검증
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

  //유저의 누적 플로깅 정보 가져오기
  let user_plogging_sum_info;
  try {
    const user_plogging_info = await Plogging.findAll({
      include: [{ model: Litter, require: true }],
      attributes: [
        [Sequelize.fn('COUNT', Sequelize.col('litter')), 'count'],
        [
          Sequelize.literal(`SEC_TO_TIME(AVG(TIME_TO_SEC(duration_time)))`),
          'avg_duration_time',
        ],
        [Sequelize.fn('AVG', Sequelize.col('distance')), 'avg_distance_km'],
        [Sequelize.fn('SUM', Sequelize.col('plastic_count')), 'plastic_count'],
        [Sequelize.fn('SUM', Sequelize.col('vinyles_count')), 'vinyles_count'],
        [Sequelize.fn('SUM', Sequelize.col('glasses_count')), 'glasses_count'],
        [Sequelize.fn('SUM', Sequelize.col('cans_count')), 'cans_count'],
        [Sequelize.fn('SUM', Sequelize.col('papers_count')), 'papers_count'],
        [Sequelize.fn('SUM', Sequelize.col('trash_count')), 'trash_count'],
      ],
      where: {
        user_id: userId,
        date: {
          [Sequelize.Op.between]: [
            `${req.query.year}-${req.query.month}-01`,
            `${req.query.year}-${req.query.month}-31`,
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
      result.avg_duration_time = user_plogging_sum_info.avg_duration_time;
      result.avg_distance_km = user_plogging_sum_info.avg_distance_km;
      result.avg_litter_count = user_plogging_sum_info.avg_litter_count;
    } else {
      result.avg_duration_time = '00:00:00';
      result.avg_distance_km = 0;
      result.avg_litter_count = 0;
    }
    result.success = true;
  } catch (err) {
    console.log(err);
    result.description = '사용자의 플로깅 정보를 가져올 수 없습니다.';
    res.json(result);
  }

  res.json(result);
});
module.exports = router;
