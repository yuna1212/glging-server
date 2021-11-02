const express = require('express');
const app = express();
const router = express.Router();
const User = require('../models/user');
const Plogging = require('../models/plogging');
const tokens = require('../modules/token');
const Sequelize = require('sequelize');
// Token 실패 코드
const TOKEN_EXPIRED = require('../modules/token').TOKEN_EXPIRED;
const TOKEN_INVALID = require('../modules/token').TOKEN_INVALID;

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
  let user_id = token.user_id;
  ////////////////////////////////////////////////
  ///////////////////////////////// DB 조회
  try {
    // 학생 수 조회
    const users = await User.findAndCountAll({
      attributes: ['user_id'],
    });
    result.all_user_count = users.count;
    // 배지 수 조회
    const badges = await Plogging.findOne({
      attributes: [
        [
          Sequelize.fn('SUM', Sequelize.col('count_of_badge_got')),
          'badge_count',
        ],
      ],
    });
    result.all_badge_count = parseInt(badges.dataValues.badge_count);
    // 랭킹 기록 조회
    const ranking_users = await Plogging.findAll({
      attributes: [
        [
          Sequelize.fn('SUM', Sequelize.col('count_of_badge_got')),
          'badge_count',
        ],
      ],
      include: {
        model: User,
        attributes: ['nickname'],
        required: false,
      },
      group: 'nickname',
      order: [
        [Sequelize.fn('SUM', Sequelize.col('count_of_badge_got')), 'DESC'],
      ],
      raw: true,
    });
    result.ranking = ranking_users;
    result.ranking.forEach((element) => {
      element.badge_count = parseInt(element.badge_count);
    });
    result.success = true;
  } catch (err) {
    console.log('랭킹 조회 실패');
    console.log(err);
    result.description = '랭킹 조회 실패';
    res.json(result);
  }
  res.json(result);
});
module.exports = router;
