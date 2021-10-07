const express = require('express');
const app = express();
const router = express.Router();
const User = require('../models/user');
const tokens = require('../modules/token');

// 미들웨어 설정
app.use(express.json());

// 회원가입
router.post('', async (req, res) => {
  let user_id = req.body.user_id;
  let password = req.body.password;
  let join_result = {
    description: '회원가입 실패.. 다시 시도해주세요.',
  };
  try {
    await User.create({
      user_id: user_id,
      password: password,
    });
    join_result.description = '회원가입 성공!';
    // access, refresh 토큰 발급
    join_result.refresh_token = await tokens.refresh.sign(user_id);
    join_result.access_token = await tokens.access.sign(user_id);
    join_result.User.nickname = user_in_db.nickname;
    join_result.User.student_id = user_in_db.student_id;
    join_result.User.user_id = user_in_db.user_id;
    join_result.User.univ_cert_status = user_in_db.univ_cert_status;
  } catch (err) {
    console.error(err);
  }
  res.json(join_result);
});

// id 중복체크
router.get('/id', async (req, res) => {
  let user_id = req.query.user_id;
  let join_result = { is_existing: null };
  try {
    const user_in_db = await User.findOne({
      where: { user_id: user_id },
    });
    if (user_in_db === null) {
      join_result.is_existing = false;
    } else {
      join_result.is_existing = true;
    }
  } catch (err) {
    console.error(err);
    join_result.is_existing = true;
  }
  res.json(join_result); // 아 근데 어차피 에러 캐치되면 여기 실행 안되는구나..? 올리는게 낫나.. 아니네 실행되네?왜되지 -> 에러 캐치되도 계속 실행 되는게 try catch니까!
});

module.exports = router;
