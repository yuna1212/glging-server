const express = require('express');
const app = express();
const router = express.Router();
const User = require('../models/user');
const Plogging = require('../models/plogging');
const tokens = require('../modules/token');
const Sequelize = require('sequelize');
const logger = require('../modules/log_winston');

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
  logger.info(`랭킹 요청한 사람은 ${user_id}`);
  ////////////////////////////////////////////////
  ///////////////////////////////// DB 조회
  try {
    // 내 닉네임 조회
    const my_info = await User.findOne({
      attributes: ['nickname', 'profile_image'],
      where: { user_id: user_id },
    });
    // 학생 수 조회
    const users = await User.findAndCountAll({
      attributes: ['user_id'],
    });
    result.all_user_count = users.count;
    // 배지 수 조회
    const badges = await Plogging.findOne({
      attributes: [
        [Sequelize.fn('SUM', Sequelize.col('count_of_badge_got')), 'badge'],
      ],
    });
    result.all_badge_count = parseInt(badges.dataValues.badge);
    // 랭킹 기록 조회
    const ranking_users = await Plogging.findAll({
      attributes: [
        [Sequelize.fn('SUM', Sequelize.col('count_of_badge_got')), 'badge'],
      ],
      include: {
        model: User,
        attributes: ['nickname', 'profile_image'],
        required: false,
      },
      group: 'User.user_id',
      order: [
        [Sequelize.fn('SUM', Sequelize.col('count_of_badge_got')), 'DESC'],
      ],

      raw: true,
    });
    result.ranking = ranking_users;
    result.my_ranking = 0;
    let rankings = result.ranking;
    for (let i = 0; i < rankings.length; i++) {
      element = rankings[i];
      element.badge = parseInt(element.badge);
      element.profile_image =
        'http://18.119.6.206:8001/PLOGGING-PROFILE-IMAGES/' +
        element['User.profile_image'];
      delete element['User.profile_image'];
      element.nickname = element['User.nickname'];
      delete element['User.nickname'];

      if (i === 0) {
        element.ranking = 1;
      } else {
        if (element.badge === rankings[i - 1].badge) {
          element.ranking = rankings[i - 1].ranking;
        } else {
          element.ranking = 1 + rankings[i - 1].ranking;
        }
      }
      if (element.nickname === my_info.nickname) {
        result.my_ranking = element.ranking;
        result.my_profile = element.profile_image;
        result.my_badge = element.badge;
        result.my_nickname = element.nickname;
      }
    }
    if (result.my_ranking === 0) {
      result.my_ranking = rankings[rankings.length - 1].ranking + 1;
      result.my_profile =
        'http://18.119.6.206:8001/PLOGGING-PROFILE-IMAGES/' +
        my_info.profile_image;
      result.my_badge = 0;
      result.my_nickname = my_info.nickname;
    }
    if (rankings.length > 10) {
      result.ranking = rankings.slice(0, 10);
    }
    result.success = true;
  } catch (err) {
    logger.error(err);
    result.description = '랭킹 조회 실패';
    res.json(result);
  }

  res.json(result);
});
module.exports = router;
