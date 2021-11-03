const express = require('express');
const app = express();
const router = express.Router();
const User = require('../models/user');
const tokens = require('../modules/token');
// Token 실패 코드
const TOKEN_EXPIRED = require('../modules/token').TOKEN_EXPIRED;
const TOKEN_INVALID = require('../modules/token').TOKEN_INVALID;

// 미들웨어 설정
app.use(express.json());

// 로그인
router
  .route('')
  .post(async (req, res) => {
    let user_id = req.body.user_id;
    let password = req.body.password;
    let login_result = {
      success: false,
      description: '실패',
    };
    try {
      const user_in_db = await User.findOne({
        attributes: [
          'nickname',
          'student_id',
          'user_id',
          'univ_cert_status',
          'profile_image',
        ],
        where: { user_id: user_id, password: password },
      });
      // DB에 있다면
      if (user_in_db !== null) {
        login_result.description = '로그인 성공';
        login_result.success = true;
        // access, refresh 토큰 발급
        login_result.refresh_token = await tokens.refresh.sign(user_id);
        login_result.access_token = await tokens.access.sign(user_id);
        // nickname, student_id, user_id, univ_cert_status 반환
        console.log(user_in_db);
        login_result.user = {};
        login_result.user.nickname =
          user_in_db.univ_cert_status === 0
            ? user_in_db.nickname || user_in_db.student_id.toString()
            : null;
        login_result.user.student_id = user_in_db.student_id;
        login_result.user.user_id = user_in_db.user_id;
        login_result.user.univ_cert_status = user_in_db.univ_cert_status;
        login_result.user.profile_image =
          'http://18.119.6.206:8001/plogging-profile-images/' +
          user_in_db.profile_image;
      }
      // DB에 없다면
      else {
        login_result.description = '아이디 또는 비밀번호가 일치하지 않습니다.';
      }
    } catch (err) {
      console.error(err);
    }
    res.json(login_result);
  })
  .get(async (req, res) => {
    let login_result = {
      success: false,
      description: '실패',
    };
    let userAccessToken = req.query.access_token;
    token = await tokens.access.verify(userAccessToken);
    // 적합하지 않은 토큰이면
    if (TOKEN_EXPIRED === token) {
      login_result.description = 'token expired';
      res.json(login_result);
    } else if (TOKEN_INVALID === token) {
      login_result.description = 'token invalid';
      res.json(login_result);
    }
    // 적합한 토큰이면
    user_id = token.user_id;

    // DB 조회
    try {
      const user_in_db = await User.findOne({
        attributes: [
          'nickname',
          'student_id',
          'user_id',
          'univ_cert_status',
          'profile_image',
        ],
        where: { user_id: user_id },
      });
      // DB에 있다면
      if (user_in_db !== null) {
        login_result.description = '로그인 성공';
        login_result.success = true;

        // nickname, student_id, user_id, univ_cert_status 반환
        console.log(user_in_db);
        login_result.user = {};
        login_result.user.nickname =
          user_in_db.univ_cert_status === 0
            ? user_in_db.nickname || user_in_db.student_id.toString()
            : null;
        login_result.user.student_id = user_in_db.student_id;
        login_result.user.user_id = user_in_db.user_id;
        login_result.user.univ_cert_status = user_in_db.univ_cert_status;
        login_result.user.profile_image =
          'http://18.119.6.206:8001/plogging-profile-images/' +
          user_in_db.profile_image;
      }
      // DB에 없다면
      else {
        login_result.description = '해당 계정이 존재하지 않습니다. ';
      }
    } catch (err) {
      console.error(err);
    }
    res.json(login_result);
  });

module.exports = router;
