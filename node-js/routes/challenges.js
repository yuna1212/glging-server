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
const { sequelize } = require('../models/challenge');

function is_achieved(user_data, standard) {
  if (standard === null) {
    return null;
  }
  if (user_data === null) {
    return false;
  }
  if (typeof user_data === 'number') {
    if (user_data > standard) {
      return true;
    } else {
      return false;
    }
  }
  // 숫자가 아니면 시간일 것
  user_data = user_data + '';
  standard = standard + '';
  user_duration_time = user_data.split(':').map((item) => {
    return parseInt(item, 10);
  });
  standard_time = standard.split(':').map((item) => {
    return parseInt(item, 10);
  });
  for (let i = 0; i < 3; i++) {
    if (user_duration_time[i] > standard_time[i]) {
      return true;
    }
  }
  return false;
}

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
  userId = token.user_id;

  //유저의 누적 플로깅 정보 가져오기
  let user_plogging_sum_info;
  try {
    const user_plogging_info = await Plogging.findAll({
      attributes: [
        [
          Sequelize.literal(`SEC_TO_TIME(SUM(TIME_TO_SEC(duration_time)))`),
          'duration_time',
        ],
        [Sequelize.fn('SUM', Sequelize.col('distance')), 'distance_km'],
        [Sequelize.fn('SUM', Sequelize.col('plastic_count')), 'plastic_count'],
        [Sequelize.fn('SUM', Sequelize.col('vinyles_count')), 'vinyles_count'],
        [Sequelize.fn('SUM', Sequelize.col('glasses_count')), 'glasses_count'],
        [Sequelize.fn('SUM', Sequelize.col('cans_count')), 'cans_count'],
        [Sequelize.fn('SUM', Sequelize.col('papers_count')), 'papers_count'],
        [Sequelize.fn('SUM', Sequelize.col('trash_count')), 'trash_count'],
      ],
      where: {
        user_id: userId,
      },
    });
    user_plogging_sum_info = user_plogging_info[0].dataValues;
    delete user_plogging_sum_info.Litter;

    // 쓰레기 종류 개수 넣기
    let user_litter_kind = 0;
    let user_litter_count = 0;
    if (user_plogging_sum_info.plastic_count > 0) {
      user_litter_kind++;
      user_litter_count += user_plogging_sum_info.plastic_count;
    }
    if (user_plogging_sum_info.vinyles_count > 0) {
      user_litter_kind++;
      user_litter_count += user_plogging_sum_info.vinyles_count;
    }
    if (user_plogging_sum_info.glasses_count > 0) {
      user_litter_kind++;
      user_litter_count += user_plogging_sum_info.glasses_count;
    }
    if (user_plogging_sum_info.cans_count > 0) {
      user_litter_kind++;
      user_litter_count += user_plogging_sum_info.cans_count;
    }
    if (user_plogging_sum_info.papers_count > 0) {
      user_litter_kind++;
      user_litter_count += user_plogging_sum_info.papers_count;
    }
    if (user_plogging_sum_info.trash_count > 0) {
      user_litter_kind++;
      user_litter_count += user_plogging_sum_info.trash_count;
    }
    user_plogging_sum_info.litter_kind = user_litter_kind;
    user_plogging_sum_info.litter_count = user_litter_count;
  } catch (err) {
    console.log(err);
    result.description = '사용자 플로깅 정보 조회 실패';
    res.json(result);
  }

  // 유저와 관계있는 챌린지 정보 가져오기
  // 기본 챌린지 가져오기
  let challenge_info;
  try {
    challenge_info = await Challenge.findAll({
      attributes: [
        'kind',
        'title',
        'duration_time',
        ['distance_by_hakyo', 'distance_hakyo'],
        'litter_kind',
        'litter_count',
      ],
      where: {
        [Sequelize.Op.or]: [{ kind: 'common' }, { kind: `${userId}` }],
      },
      raw: true,
    });
  } catch (err) {
    console.log(err);
    result.description = '챌린지 정보 조회 실패';
    res.json(result);
  }

  // 챌린지 달성 여부
  let challenges = [];
  challenge_info.forEach((value, index, array) => {
    let challenge = {};
    challenge.title = value.title;
    challenge.kind = value.kind;
    challenge.content = {
      duration_time: value.duration_time,
      distance_hakyo: value.distance_hakyo,
      litter_kind: value.litter_kind,
      litter_count: value.litter_count,
    };
    challenge.content_achieve = {};
    // 플로깅 지속 시간 비교
    if (
      is_achieved(user_plogging_sum_info.duration_time, value.duration_time)
    ) {
      challenge.content_achieve.duration_time = true;
    } else {
      challenge.content_achieve.duration_time = false;
    }
    // 플로깅 거리 비교
    if (
      is_achieved(
        user_plogging_sum_info.distance_km / 6.4,
        value.distance_hakyo
      )
    ) {
      challenge.content_achieve.distance_hakyo = true;
    } else {
      challenge.content_achieve.distance_hakyo = false;
    }
    // 쓰레기 종류 개수 비교
    if (is_achieved(user_plogging_sum_info.litter_kind, value.litter_kind)) {
      challenge.content_achieve.litter_kind = true;
    } else {
      challenge.content_achieve.litter_kind = false;
    }
    // 쓰레기 개수 비교
    if (is_achieved(user_plogging_sum_info.litter_count, value.litter_count)) {
      challenge.content_achieve.litter_count = true;
    } else {
      challenge.content_achieve.litter_count = false;
    }
    // 졸업시험이라면 설명 추가
    if (value.title === '졸업시험') {
      challenge.content.etc = '월 10회 이상 플로깅하기';
      challenge.content_achieve.etc = false;
    }
    challenges.push(challenge);
  });
  result.success = true;
  result.challenges = challenges;
  res.json(result);
});
module.exports = router;
