const express = require('express');
const app = express();
const router = express.Router();
const User = require('../models/user');
const tokens = require('../modules/token');
const send_mail = require('../modules/mail');
// Token 실패 코드
const TOKEN_EXPIRED = require('../modules/token').TOKEN_EXPIRED;
const TOKEN_INVALID = require('../modules/token').TOKEN_INVALID;

// 미들웨어 설정
app.use(express.json());

router.post('/mail/student-id', async (req, res) => {
  let result = { success: false, description: 'failed' };
  let userAccessToken = req.body.access_token;
  let studentId = req.body.student_id;

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
  // 학번을 제대로 받았다면
  if (studentId !== undefined) {
    try {
      const auth_num = Math.floor(Math.random() * (1000000 - 100000)) + 100000; // cert_number 발급
      const user_in_db = await User.update(
        {
          cert_number: auth_num,
          univ_cert_status: 1,
          student_id: studentId,
        },
        {
          where: { user_id: userId },
        }
      );
      // 메일서버에서, student_id에 해당하는 메일로 내용 보내기
      await send_mail(studentId, auth_num);
      if (user_in_db[0] > 0) result.description = 'successed';
      result.success = true;
    } catch (err) {
      console.error(err);
      if (err.name === 'SequelizeUniqueConstraintError') {
        result.description = '이미 존재하는 학번입니다.';
      }
    }
  }

  res.json(result);
});

// 인증번호로 학생 이메일 인증
router.post('/mail/authentication', async (req, res) => {
  let result = { success: false, description: '인증번호가 올바르지 않습니다.' };
  let userAccessToken = req.body.access_token;
  token = await tokens.access.verify(userAccessToken);

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

  let authNum = req.body.authentication_number;
  try {
    const user_in_db = await User.findOne({
      where: { user_id: userId, cert_number: authNum },
    });
    if (user_in_db === null);
    else {
      //   사용자가 입력한 인증번호와 DB의 인증번호 일치한다면, 인증 완료로 바꾸기
      const user_update = await User.update(
        {
          cert_number: -1,
          univ_cert_status: 0,
        },
        {
          where: { user_id: userId },
        }
      );
      if (user_update && user_update[0]) {
        result.description = '인증 성공!';
        result.success = true;
        result.User.nickname = user_in_db.nickname;
        result.User.student_id = user_in_db.student_id;
        result.User.user_id = user_in_db.user_id;
        result.User.univ_cert_status = 0;
      }
    }
  } catch (err) {
    console.error(err);
  }
  res.json(result);
});

module.exports = router;
