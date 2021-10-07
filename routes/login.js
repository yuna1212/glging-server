const express = require('express');
const app = express();
const router = express.Router();
const User = require('../models/user');
const tokens = require('../modules/token');

// 미들웨어 설정
app.use(express.json());

// 로그인
router.post('', async (req, res) => {
  let user_id = req.body.user_id;
  let password = req.body.password;
  let login_result = {
    description: '실패',
    User: {},
  };
  try {
    const user_in_db = await User.findOne({
      attributes: ['nickname', 'student_id', 'user_id', 'univ_cert_status'],
      where: { user_id: user_id, password: password },
    });
    // DB에 있다면
    if (user_in_db.length !== null) {
      login_result.description = '로그인 성공';
      // access, refresh 토큰 발급
      login_result.refresh_token = await tokens.refresh.sign(user_id);
      login_result.access_token = await tokens.access.sign(user_id);
      // nickname, student_id, user_id, univ_cert_status 반환\
      console.log(user_in_db);

      login_result.User.nickname = user_in_db.nickname;
      login_result.User.student_id = user_in_db.student_id;
      login_result.User.user_id = user_in_db.user_id;
      login_result.User.univ_cert_status = user_in_db.univ_cert_status;
    }
    // DB에 없다면
    else {
      login_result.description = '아이디 또는 비밀번호가 일치하지 않습니다.';
    }
  } catch (err) {
    console.error(err);
  }
  res.json(login_result);
});

module.exports = router;
