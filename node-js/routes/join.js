const express = require('express');
const app = express();
const router = express.Router();
const User = require('../models/user');
const tokens = require('../modules/token');
const logger = require('../modules/log_winston');

// 미들웨어 설정
app.use(express.json());

// 회원가입
router.post('', async (req, res) => {
  let user_id = req.body.user_id;
  let password = req.body.password;
  let join_result = {
    success: false,
    description: '회원가입 실패.. 다시 시도해주세요.',
  };
  try {
    await User.create({
      user_id: user_id,
      password: password,
    });
    logger.info(`id: ${user_id}`);
    join_result.description = '회원가입 성공!';
    join_result.success = true;
    join_result.user = {
      nickname: null,
      student_id: null,
      univ_cert_status: 2,
      profile_image:
        'http://18.119.6.206:8001/PLOGGING-PROFILE-IMAGES/DEFAULT-IMAGE.jpg',
    };
    // access, refresh 토큰 발급
    join_result.refresh_token = await tokens.refresh.sign(user_id);
    join_result.access_token = await tokens.access.sign(user_id);
    join_result.user.user_id = user_id;
  } catch (err) {
    logger.error(err);
  }
  res.json(join_result);
});

// id 중복체크
router.get('/id', async (req, res) => {
  let user_id = req.query.user_id;
  let join_result = { success: false, is_existing: null };
  try {
    const user_in_db = await User.findOne({
      where: { user_id: user_id },
    });
    if (user_in_db === null) {
      join_result.is_existing = false;
      join_result.success = true;
    } else {
      join_result.is_existing = true;
    }
  } catch (err) {
    logger.error(err);
    join_result.is_existing = true;
  }
  res.json(join_result); // 아 근데 어차피 에러 캐치되면 여기 실행 안되는구나..? 올리는게 낫나.. 아니네 실행되네?왜되지 -> 에러 캐치되도 계속 실행 되는게 try catch니까!
});

module.exports = router;
